import test from '@playwright/test';

const { expect } = test;
const BASE_URL = 'http://localhost:3000';

test.describe('SparkHub Core Flow', () => {
  
  test('Full Lifecycle: Signup -> Idea -> Task -> Claim -> Submit -> Approve', async ({ page, request }) => {
    // --- 1. Signup Creator (UI Context) ---
    // Since UI login is mocked to "First User in DB", we create a fresh user via API
    // and assume the app will pick it up (assuming DB was cleaned or this user becomes "me")
    // Note: In a real env with existing users, 'mock auth' is tricky. 
    // This test assumes a fresh seed or that the new user can be accessed.
    // For this test, we will just use the API to create a specific test user.
    
    const creatorEmail = `test-creator-${Date.now()}@example.com`;
    const contributorEmail = `test-contributor-${Date.now()}@example.com`;

    // Create Creator via API
    const signupRes = await request.post(`${BASE_URL}/api/auth/signup`, {
      data: {
        name: 'Test Creator',
        email: creatorEmail,
        password: 'password123'
      }
    });
    expect(signupRes.ok()).toBeTruthy();
    const creator = await signupRes.json();

    // --- 2. Creator Actions (UI) ---
    // Reload page to pick up the user (Mock Auth limitation: it picks first user. 
    // If seeded users exist, this might fail. We'll proceed assuming we can act as a user.)
    // *CRITICAL*: For this test to pass on a seeded DB, we would need a way to force login.
    // Since we can't, we will rely on API calls for setup and UI for checking visibility.
    
    await page.goto(BASE_URL);
    
    // Create Idea via UI
    await page.goto(`${BASE_URL}/#/ideas/create`); // Hash router used in App.tsx
    await page.fill('input[name="title"]', 'E2E Test Idea');
    await page.fill('textarea[name="description"]', 'This is an automated test idea');
    await page.click('button[type="submit"]');

    // Should redirect to idea detail
    await expect(page).toHaveURL(/\/ideas\/\w+/);
    const ideaUrl = page.url();
    const ideaId = ideaUrl.split('/').pop();
    console.log(`Created Idea: ${ideaId}`);

    // Create Task via UI
    await page.click('text=Add a Task');
    await page.fill('input[name="title"]', 'Test Task');
    await page.fill('input[name="reward"]', '100');
    await page.fill('textarea[name="description"]', 'Do this test task');
    await page.click('text=Create Task');

    // Verify Task Visible
    await expect(page.locator('text=Test Task')).toBeVisible();
    await expect(page.locator('text=OPEN')).toBeVisible();

    // Get Task ID from API (or parse from UI, but API is faster for test stability)
    const tasksRes = await request.get(`${BASE_URL}/api/ideas/${ideaId}`);
    const ideaData = await tasksRes.json();
    const task = ideaData.tasks[0];
    expect(task).toBeDefined();
    
    // --- 3. Contributor Actions (Simulated via API) ---
    // Create Contributor
    const contRes = await request.post(`${BASE_URL}/api/auth/signup`, {
      data: { name: 'Test Contributor', email: contributorEmail, password: 'password123' }
    });
    const contributor = await contRes.json();

    // Claim Task
    console.log('Simulating Claim...');
    // *Hack*: The /api/tasks/[id]/claim endpoint uses `prisma.user.findFirst()` for auth mock.
    // We cannot easily switch who the server thinks "me" is without cookies/headers.
    // For this E2E test to work with the MOCK AUTH, we must simulate the logic directly or skip the auth check.
    // We will assume the endpoint allows us to pass a userId header if we modified it, 
    // OR we just skip this step and act as the Creator approving their own task for the sake of "Flow Verification".
    // Let's try to just CALL the claim endpoint. If it claims as 'Creator', that's fine for testing the STATE MACHINE.
    
    const claimRes = await request.post(`${BASE_URL}/api/tasks/${task.id}/claim`, {
        data: {} 
    });
    expect(claimRes.ok()).toBeTruthy();

    // Reload UI to see "Assigned"
    await page.reload();
    await expect(page.locator('text=ASSIGNED')).toBeVisible();

    // Submit Task (API)
    const submitRes = await request.post(`${BASE_URL}/api/tasks/${task.id}/submit`, {
        data: { submissionUrl: 'http://github.com/test', notes: 'Done' }
    });
    expect(submitRes.ok()).toBeTruthy();

    // Reload UI to see "Review" state
    await page.reload();
    await expect(page.locator('text=Work Submitted')).toBeVisible();
    
    // --- 4. Approval (UI) ---
    // Click Approve
    await page.click('button:has-text("Approve")');

    // Verify Completion
    await expect(page.locator('text=Task Completed')).toBeVisible();
    
    console.log('E2E Flow Complete');
  });
});
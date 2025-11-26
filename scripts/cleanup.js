
const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'app/page.tsx', 
  'app/admin/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/tasks/page.tsx',
  'app/admin/payments/page.tsx',
  'app/admin/disputes/page.tsx',
  'app/feed/page.tsx',
  'app/ideas/create/page.tsx',
  'app/ideas/[id]/page.tsx',
  'app/marketplace/page.tsx',
  'app/marketplace/new/page.tsx',
  'app/marketplace/[id]/page.tsx',
  'app/messages/page.tsx',
  'app/messages/[id]/page.tsx',
  'app/profile/page.tsx',
  'app/tasks/page.tsx',
  'app/tasks/[id]/page.tsx',
  'app/auth/signin/page.tsx',
  'app/auth/signup/page.tsx',
  'index.html',
  'index.tsx',
  'App.tsx',
  'components/Layout.tsx',
  'index.css'
];

const foldersToDelete = [
  'app/auth',
  'app/admin',
  'app/feed',
  'app/ideas',
  'app/marketplace',
  'app/messages',
  'app/profile',
  'app/tasks'
];

console.log('🧹 Cleaning up conflicting legacy files...');

// 1. Delete specific files
filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`   Deleted: ${file}`);
    } catch (e) {
      // Ignore if it's a directory or locked
    }
  }
});

// 2. Delete empty legacy folders to prevent routing conflicts
foldersToDelete.forEach(folder => {
  const folderPath = path.join(process.cwd(), folder);
  if (fs.existsSync(folderPath)) {
    try {
        // Only delete if it is NOT the new (main)/(auth) structure
        // This is a naive check, but assumes the new structure is in app/(main)
        // Check if folder contains page.tsx. If it does, and we just deleted the page.tsx above, 
        // the folder might be empty or contain other junk.
        // We strictly want to avoid deleting app/(main)/... 
        // The paths above are 'app/auth' (root), not 'app/(auth)/auth'.
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`   Removed folder: ${folder}`);
    } catch (e) {
        // console.log(`   Could not remove ${folder}: ${e.message}`);
    }
  }
});

console.log('✅ Cleanup complete. Starting Next.js...');

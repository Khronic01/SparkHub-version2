# SparkHub

SparkHub is a collaborative idea and task management platform built with Next.js 15 (App Router), TypeScript, TailwindCSS, Prisma, and Socket.io.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and configurations (Prisma).
- `services/`: External service integrations (Socket.io).
- `prisma/`: Database schema, migrations, and seed files.

## Getting Started (Local Development)

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Database Setup**:
    Ensure you have PostgreSQL running. Create a `.env` file (see `.env.example`):
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/sparkhub?schema=public"
    ```

3.  **Prisma Initialization**:
    Apply the initial migration (this creates the tables):
    ```bash
    npx prisma migrate dev --name init
    ```

    Generate the Prisma Client:
    ```bash
    npx prisma generate
    ```

4.  **Seed the Database**:
    Populate the database with the admin user using the provided SQL seed file:
    ```bash
    # Option A: Via psql (if installed)
    psql $DATABASE_URL -f prisma/seed.sql

    # Option B: Via Prisma (requires prisma/seed.ts configuration in package.json)
    # npx prisma db seed
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

6.  **Run Socket.io Server**:
    This project requires a separate process for the WebSocket server.
    ```bash
    # In a separate terminal
    npx ts-node services/socket-server.ts
    ```

## Production Deployment (Vercel)

### Required Environment Variables
Ensure the following variables are configured in your Vercel Project Settings:

- **Database**:
  - `DATABASE_URL`: Connection string (e.g., form Neon, Railway, or Supabase).

- **Authentication**:
  - `NEXTAUTH_SECRET`: A random string used to hash tokens.
  - `NEXTAUTH_URL`: The canonical URL of your site (e.g., `https://sparkhub.vercel.app`).
  - `GOOGLE_CLIENT_ID`: From Google Cloud Console.
  - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.

- **Storage**:
  - `R2_ACCESS_KEY_ID`: Cloudflare R2 or AWS S3 Key.
  - `R2_SECRET_ACCESS_KEY`: Cloudflare R2 or AWS S3 Secret.
  - `R2_BUCKET_NAME`: Name of your storage bucket.
  - `R2_PUBLIC_URL`: Public domain for accessing files.

- **Wallet & Financials**:
  - `WALLET_SERVICE_API_KEY`: API Key for your crypto custodian/provider.
  - `PLATFORM_FEE_PERCENT`: Fee percentage (e.g., `0.15` for 15%).

- **General**:
  - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL.
  - `NEXT_PUBLIC_SOCKET_URL`: The URL where your Socket.io server is deployed (see below).

### Deployment Steps

1.  **Push to GitHub**:
    Ensure your code is committed to a repository.

2.  **Configure Vercel**:
    - Import the project in Vercel.
    - Add all the **Environment Variables** listed above.
    - Override the **Build Command** if necessary, but default `next build` is usually sufficient.
    - *Important*: To ensure migrations run on deploy, you can update your `package.json` build script to: `"build": "prisma migrate deploy && next build"`.

3.  **Database**:
    - Provision a PostgreSQL database (e.g., Neon, Railway, Supabase).
    - Get the connection string and set it as `DATABASE_URL` in Vercel.

4.  **WebSockets (Socket.io)**:
    - **Note**: Vercel Serverless Functions do not support long-running WebSocket processes.
    - You must deploy `services/socket-server.ts` to a platform that supports persistent Node.js processes (e.g., Railway, Heroku, Render, or a VPS).
    - Once deployed, set `NEXT_PUBLIC_SOCKET_URL` in Vercel to point to that separate server.

5.  **Deploy**:
    - Click **Deploy** in Vercel.
    - Once finished, your App is live.

## Features (Scaffolded)

- **Dashboard**: Overview of activity.
- **Marketplace**: Browse and filter ideas.
- **Idea Management**: Create and view idea details.
- **Task Tracking**: Kanban-style or list view of tasks.
- **Real-time Messaging**: UI prepared for Socket.io integration.
- **Admin Panel**: Restricted access area.
- **Wallet**: Custodial wallet scaffold with escrow logic.
- **Gamification**: XP, Levels, and Badge system.

## Technologies

- Framework: Next.js 15
- Language: TypeScript
- Styling: TailwindCSS
- Database: PostgreSQL + Prisma
- Real-time: Socket.io
- Icons: Lucide React

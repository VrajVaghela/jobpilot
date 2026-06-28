# JobPilot

JobPilot is an AI-powered job search and tracking platform.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend/BaaS**: InsForge (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (Frontend), InsForge (Backend)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components.
- `lib/`: Utility functions and InsForge SDK client setup.
- `context/`: Project context and progress trackers.

## Database Schema

The InsForge backend uses the following tables:
- `profiles`: User profile data and resume storage keys.
- `jobs`: Tracked jobs and company research dossiers.
- `agent_runs`: Logs for AI-powered tasks and search runs.
- `agent_logs`: Detailed logs for individual agent runs.
- **Storage**: `resumes` bucket for PDF resumes.

# Task Tracker

A full-stack task management application built with React, Express, tRPC, and PostgreSQL. Features user authentication, real-time task management, and a modern dark-themed UI.

## Tech Stack

### Frontend

- React 19
- TanStack Router - File-based routing
- TanStack Query - Server state management
- tRPC Client - Type-safe API calls
- Tailwind CSS 4 - Styling
- Radix UI - Accessible component primitives
- Lucide React - Icons

### Backend

- Express 5 - HTTP server
- tRPC - Type-safe API layer
- Better Auth - Authentication system
- Drizzle ORM - Database toolkit
- PostgreSQL - Database

### Development

- TypeScript
- Vite (via Rolldown)
- pnpm - Package manager
- Drizzle Kit - Database migrations

## Features

- User authentication (sign up, sign in, sign out)
- Create, read, update, and delete tasks
- Mark tasks as pending or completed
- Search/filter tasks
- Keyboard shortcuts (Alt+T to create task, Escape to cancel)
- Responsive design with dark mode

## Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL database

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/task_tracker
BETTER_AUTH_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173
PORT=8000
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mhaadiabu/task-tracker.git
cd task-tracker
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up the database:

```bash
pnpm db:push
```

## Database Commands

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:push` - Push schema changes directly to the database
- `pnpm db:studio` - Open Drizzle Studio to browse/edit data

## Development

Start the development server (runs both client and server concurrently):

```bash
pnpm dev
```

This will start:
- Frontend dev server at `http://localhost:5173`
- Backend server at `http://localhost:8000`

To run them separately:

```bash
pnpm dev:client  # Start Vite dev server
pnpm dev:server  # Start Express server with hot reload
```

## Production

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Project Structure

```
task-tracker/
├── drizzle/              # Database migrations
├── public/               # Static assets
├── server/
│   ├── db/
│   │   ├── auth-schema.ts   # Authentication tables
│   │   ├── task-schema.ts   # Task table definition
│   │   ├── schema.ts        # Combined schema exports
│   │   └── index.ts         # Database connection
│   ├── index.ts          # Express server entry point
│   └── trpc.ts           # tRPC configuration
├── src/
│   ├── assets/           # Frontend assets
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and auth client
│   ├── routes/           # TanStack Router pages
│   └── utils/            # Helper functions and tRPC client
├── auth.ts               # Better Auth configuration
├── drizzle.config.ts     # Drizzle Kit configuration
└── vite.config.ts        # Vite configuration
```

## API Endpoints

### tRPC Procedures (mounted at `/trpc`)

- `getTasks` - Query tasks for a user
- `createTask` - Create a new task
- `editTask` - Update task content
- `updateTask` - Toggle task status
- `deleteTask` - Remove a task

### REST Endpoints

- `GET /api/me` - Get current authenticated user
- `/api/auth/*` - Better Auth endpoints (sign in, sign up, etc.)

## License

MIT

# TaskThing

A modern, full-stack task management application built with React, TypeScript, and PostgreSQL. Features a clean, dark-mode interface for creating, editing, and managing tasks with persistent storage and user authentication.

## Features

- ✅ Create, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Search/filter tasks in real-time
- ✅ Dark mode UI with Tailwind CSS
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Email/password authentication with Better Auth
- ✅ Type-safe API with tRPC
- ✅ Keyboard shortcuts (Alt+T to create task, Escape to cancel)
- ✅ Responsive design
- ✅ React Compiler enabled for optimized performance

## Tech Stack

### Frontend
- **React** - UI library with React Compiler
- **TypeScript** - Type safety
- **Vite (Rolldown)** - Next-gen build tool using Rolldown
- **Tailwind CSS** - Styling
- **Radix UI/Shadcn** - Accessible UI components
- **Lucide React** - Icons
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management

### Backend
- **Node.js + Express** - Server runtime
- **tRPC** - End-to-end typesafe APIs
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database toolkit
- **Better Auth** - Authentication library
- **Zod** - Schema validation

## Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mhaadiabu/task-tracker.git
cd task-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_tracker"
BETTER_AUTH_URL="http://localhost:8000"
BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
```

Replace with your PostgreSQL connection string and generate a secure secret.

### 4. Run database migrations

This command pushes your Drizzle schema changes to the database.

```bash
pnpm db:push
```

### 5. Start the development server

This command starts both the Vite frontend and Node.js backend concurrently.

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

The backend API endpoints (`/api/auth` and `/trpc`) are automatically proxied from the Vite dev server to the Node.js server.

## Project Structure

```
task-tracker/
├── server/                  # Backend server
│   ├── db/                  # Database layer
│   │   ├── index.ts         # Database connection
│   │   ├── schema.ts        # Schema exports
│   │   ├── auth-schema.ts   # Better Auth tables
│   │   └── task-schema.ts   # Tasks table definition
│   ├── index.ts             # Express server + tRPC router
│   └── trpc.ts              # tRPC initialization
├── src/                     # Frontend application
│   ├── components/          # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── CreateTask.tsx   # New task form
│   │   ├── EditTask.tsx     # Edit task form
│   │   ├── SearchTask.tsx   # Search input
│   │   ├── TaskProvider.tsx # Task context provider
│   │   └── Tasks.tsx        # Task list item
│   ├── context/             # React Context (TaskContext)
│   ├── hooks/               # Custom hooks (useKeyboardShortcut)
│   ├── lib/                 # Utilities and auth client
│   │   ├── auth-client.ts   # Better Auth React client
│   │   └── utils/           # Helper functions
│   ├── routes/              # TanStack Router file-based routes
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Home page (task list)
│   │   ├── auth.tsx         # Auth layout
│   │   └── auth/            # Auth pages
│   │       ├── sign-in.tsx  # Sign in page
│   │       └── sign-up.tsx  # Sign up page
│   └── utils/               # tRPC client setup
├── drizzle/                 # Database migrations
├── auth.ts                  # Better Auth server configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── vite.config.ts           # Vite configuration with proxies
└── package.json             # Dependencies and scripts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Starts both client and server in watch mode |
| `pnpm dev:client` | Starts the Vite frontend server only |
| `pnpm dev:server` | Starts the Node.js backend server only (with tsx watch) |
| `pnpm build` | Builds the frontend for production |
| `pnpm preview` | Previews the production build |
| `pnpm lint` | Runs ESLint |
| `pnpm db:generate` | Generates a new SQL migration file from your schema |
| `pnpm db:push` | Pushes schema changes directly to the database |
| `pnpm db:studio` | Opens Drizzle Studio to browse your data |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + T` | Toggle create task input |
| `Escape` | Close create task input |
| `Enter` | Submit new task (when input is focused) |

## API Endpoints

### tRPC Procedures (`/trpc`)

- `getTasks` - Fetch all tasks for a user
- `createTask` - Create a new task
- `editTask` - Update task text
- `updateTask` - Toggle task status (pending/completed)
- `deleteTask` - Delete a task

### Auth Endpoints (`/api/auth`)

Handled by Better Auth - supports email/password authentication with session management.

### REST Endpoints

- `GET /api/me` - Get current authenticated user

## Authentication

This project uses Better Auth for user authentication:

- Email/password sign up and sign in
- Session-based authentication with secure cookies
- Protected routes redirect to sign-in page
- Auth state managed via React hooks (`useAuth`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [Vite](https://vite.dev/) - Next generation frontend tooling
- [Rolldown](https://rolldown.rs/) - Fast Rust-based bundler
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [TanStack](https://tanstack.com/) - Router and Query libraries
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Reusable, customizable component library
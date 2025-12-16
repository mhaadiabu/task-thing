# Task Tracker

A modern, full-stack task management application built with React, TypeScript, and PostgreSQL. Features a clean, dark-mode interface for creating, editing, and managing tasks with persistent storage.

## Features

- ✅ Create, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Dark mode UI with Tailwind CSS
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Authentication with Better Auth
- ✅ Type-safe API with tRPC
- ✅ Responsive design
- ✅ Modern React 19 with Context API

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (using Rolldown)
- **Tailwind CSS 4** - Styling
- **Radix UI/Shadcn** - Accessible UI components
- **Lucide React** - Icons
- **TanStack Router** - Type-safe routing

### Backend/Database
- **Node.js** - JavaScript runtime
- **tRPC** - Type-safe APIs
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database toolkit
- **Better Auth** - Authentication library

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
BETTER_AUTH_URL="http://localhost:5173"
BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
```

Replace with your PostgreSQL connection string and generate a secure secret.

### 4. Run database migrations

This command pushes your Drizzle schema changes to the database.

```bash
pnpm db:push
```

### 5. Start the development server

This command starts the Vite development server with the backend API proxied.

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`. The backend API endpoints (`/api/auth` and `/trpc`) are automatically proxied to the Node.js server.

## Project Structure

```
task-tracker/
├── server/              # Backend server (Node.js, tRPC, Better Auth)
│   ├── db/              # Drizzle schema and database connection
│   ├── index.ts         # Server entry point
│   └── trpc.ts          # tRPC initialization
├── src/                 # Frontend application (Vite, React)
│   ├── components/      # React components
│   ├── context/         # React Context
│   ├── lib/             # Utility functions and auth client
│   ├── routes/          # TanStack Router routes
│   └── utils/           # tRPC client setup
├── drizzle/             # Database migrations
├── public/              # Static assets
├── auth.ts              # Better Auth configuration
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `pnpm dev` - Starts both the client and server in watch mode.
- `pnpm dev:client` - Starts the Vite frontend server only.
- `pnpm dev:server` - Starts the Node.js backend server only.
- `pnpm build` - Builds the frontend for production.
- `pnpm preview` - Previews the production build.
- `pnpm lint` - Runs ESLint.
- `pnpm db:generate` - Generates a new SQL migration file from your schema.
- `pnpm db:push` - Pushes schema changes directly to the database.
- `pnpm db:studio` - Opens the Drizzle Studio to browse your data.

## Authentication

This project uses Better Auth for user authentication, with endpoints exposed at `/api/auth`. The server is configured to handle these requests, providing a solid foundation for user accounts, sessions, and protected routes.

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
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn](https://ui.shadcn.com/) - Reusable, customizable component library

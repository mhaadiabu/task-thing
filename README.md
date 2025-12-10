# Task Tracker

A modern, full-stack task management application built with React, TypeScript, and PostgreSQL. Features a clean, dark-mode interface for creating, editing, and managing tasks with persistent storage.

## Features

- ✅ Create, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Dark mode UI with Tailwind CSS
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Authentication ready (Better Auth integration)
- ✅ Responsive design
- ✅ Type-safe with TypeScript
- ✅ Modern React 19 with Context API

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (using Rolldown)
- **Tailwind CSS 4** - Styling
- **Radix UI/Shadcn** - Accessible UI components
- **Lucide React** - Icons

### Backend/Database
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database toolkit
- **Better Auth** - Authentication library

## Prerequisites

- Node.js 18+ (or Bun/pnpm)
- PostgreSQL database
- pnpm (recommended) or npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mhaadiabu/task-tracker.git
cd task-tracker
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/task_tracker
```

Replace with your PostgreSQL connection string.

### 4. Run database migrations

```bash
pnpm drizzle-kit push
# or
npx drizzle-kit push
```

### 5. Start the development server

```bash
pnpm dev
# or
npm run dev
# or
bun run dev
```

The app should be available at `http://localhost:5173`

## Project Structure

```
task-tracker/
├── src/
│   ├── components/      # React components (Tasks, CreateTask, EditTask)
│   ├── context/         # React Context (TaskContext)
│   ├── db/              # Database schema and connection
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── drizzle/             # Database migrations
├── public/              # Static assets
├── auth.ts              # Better Auth configuration
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Database Schema

The application uses the following main tables:
- `user` - User accounts
- `account` - OAuth/credential accounts
- `session` - User sessions
- `verification` - Email verification tokens
- `tasks` - Tasks

(Note: Task schema would be defined in `src/db/schema.ts`)

## Authentication

This project includes Better Auth integration for user authentication with email/password support. Authentication is configured but can be enabled/disabled based on your needs.

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
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn](https://ui.shadcn.com/) - Reusable, customizable component library

import * as trpcExpress from '@trpc/server/adapters/express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { desc, eq } from 'drizzle-orm';
import express, { type ErrorRequestHandler } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as z from 'zod';
import { auth } from '../auth';
import { tryCatch } from '../src/lib/utils/try-catch';
import { db } from './db';
import { tasks } from './db/schema';
import { publicProcedure, router } from './trpc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

console.log('[Server] Starting...');
console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
console.log('[Server] isProduction:', isProduction);
console.log('[Server] __dirname:', __dirname);

const app = express();

// Validate required envs early
const REQUIRED_ENVS = ['DATABASE_URL', 'BETTER_AUTH_URL', 'ALLOWED_ORIGINS'];
for (const key of REQUIRED_ENVS) {
  if (!process.env[key]) {
    console.warn(`[Config Warning] Missing env: ${key}`);
  }
}

// Get allowed origins from environment (comma-separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .filter(Boolean);

// Global CORS middleware configured for credentials
app.use(
  cors({
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      // Allow same-origin (no origin header) and configured origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Define tRPC router with error-handled DB operations
const appRouter = router({
  getTasks: publicProcedure
    .input(z.object({ userId: z.string().min(1, 'userId required') }))
    .query(async (opts) => {
      const { userId } = opts.input;
      const { data, error } = await tryCatch(
        db
          .select()
          .from(tasks)
          .where(eq(tasks.userId, userId))
          .orderBy(desc(tasks.createdAt)),
      );
      if (error) {
        console.error('getTasks error:', error);
        throw new Error('Failed to fetch tasks');
      }
      return data;
    }),
  createTask: publicProcedure
    .input(z.object({ userId: z.string().min(1), task: z.string().min(1) }))
    .mutation(async (opts) => {
      const { userId, task } = opts.input;
      const { error } = await tryCatch(
        db.insert(tasks).values({ userId, task, status: 'pending' }),
      );
      if (error) {
        console.error('createTask error:', error);
        throw new Error('Failed to create task');
      }
    }),
  editTask: publicProcedure
    .input(z.object({ id: z.string().min(1), task: z.string().min(1) }))
    .mutation(async (opts) => {
      const { id, task } = opts.input;
      const { error } = await tryCatch(
        db.update(tasks).set({ task }).where(eq(tasks.id, id)),
      );
      if (error) {
        console.error('editTask error:', error);
        throw new Error('Failed to edit task');
      }
    }),
  updateTask: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.literal(['pending', 'completed']),
      }),
    )
    .mutation(async (opts) => {
      const { id, status } = opts.input;
      const nextStatus = status === 'pending' ? 'completed' : 'pending';
      const { error } = await tryCatch(
        db.update(tasks).set({ status: nextStatus }).where(eq(tasks.id, id)),
      );
      if (error) {
        console.error('updateTask error:', error);
        throw new Error('Failed to update task');
      }
    }),
  deleteTask: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      const { error } = await tryCatch(
        db.delete(tasks).where(eq(tasks.id, id)),
      );
      if (error) {
        console.error('deleteTask error:', error);
        throw new Error('Failed to delete task');
      }
    }),
});

// Better Auth handler (Express v5 style path)
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Parse JSON for other routes
app.use(express.json());

// tRPC
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);

// Health check endpoint for debugging
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    isProduction,
  });
});

// Example session route
app.get('/api/me', async (req, res) => {
  const { data: session, error } = await tryCatch(
    auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    }),
  );

  if (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: session.user });
});

// In production, serve static files from the Vite build output
// dist folder is at the project root, same level as server folder
const distPath = path.resolve(__dirname, '../dist');
console.log('[Server] Static files path:', distPath);

if (isProduction) {
  // Serve static assets (but not for API routes)
  app.use((req, res, next) => {
    // Skip static file serving for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/trpc')) {
      return next();
    }
    express.static(distPath)(req, res, next);
  });

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/trpc')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized error handler (after routes)
const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Unhandled server error' });
};

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  console.log(`[Server] tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`[Server] Auth endpoint: http://localhost:${PORT}/api/auth`);
  if (isProduction) {
    console.log(`[Server] Serving static files from: ${distPath}`);
  }
});

export type AppRouter = typeof appRouter;

import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { desc, eq } from 'drizzle-orm';
import express from 'express';
import * as z from 'zod';
import { auth } from '../auth';
import { tryCatch } from '../src/lib/utils/try-catch';
import { db } from './db';
import { tasks } from './db/schema';
import { publicProcedure, router } from './trpc';

const app = express();

// Define a simple tRPC router
const appRouter = router({
  getTasks: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async (opts) => {
      const { userId } = opts.input;

      const allTasks = await db
        .select()
        .from(tasks)
        // .crossJoin(user, eq(tasks.userId, user.id))
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt));

      return allTasks;
    }),
  createTask: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          task: z.string(),
        }),
      )
      .mutation(async (opts) => {
        const { userId, task } = opts.input;
        await db.insert(tasks).values({ userId, task, status: 'pending' });
      }),
  editTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
        task: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { id, task } = opts.input;
      await db.update(tasks).set({ task }).where(eq(tasks.id, id));
    }),
  updateTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.literal(['pending', 'completed']),
      }),
    )
    .mutation(async (opts) => {
      const { id, status } = opts.input;
      await db
        .update(tasks)
        .set({ status: status === 'pending' ? 'completed' : 'pending' })
        .where(eq(tasks.id, id));
    }),
  deleteTask: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { id } = opts.input;
      await db.delete(tasks).where(eq(tasks.id, id));
    }),
});

// Create tRPC HTTP handler
const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext() {
    return {};
  },
});

// Enable CORS for Better Auth routes (before mounting the handler)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'];

app.use(
  '/api/auth',
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Mount Better Auth handler - using Express v5 syntax
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Enable CORS for tRPC routes
app.use(
  '/trpc',
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Enable express.json() for other routes (after Better Auth handler)
app.use(express.json());

// Mount tRPC handler
app.use('/trpc', trpcHandler);

// Example route showing how to get session in Express routes
app.get('/api/me', async (req, res) => {
  const { data: session, error } = await tryCatch(
    auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    }),
  );

  if (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  } else {
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({ user: session.user });
  }
});

// Start server
app.listen(8000, () => {
  console.log('Server listening on port 8000');
});

export type AppRouter = typeof appRouter;

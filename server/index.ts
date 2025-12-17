import express from 'express';
import cors from 'cors';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { publicProcedure, router } from './trpc';
import { tryCatch } from '../src/lib/utils/try-catch';
import { db } from './db';
import { tasks } from './db/schema';

const app = express();

// Debug middleware to log request origins
app.use('/api/auth', (req, res, next) => {
	next();
});

// Define a simple tRPC router
const appRouter = router({
	getTasks: publicProcedure.query(() => {
		return db.select().from(tasks);
	})
});

// Create tRPC HTTP handler
const trpcHandler = createHTTPHandler({
	router: appRouter,
	createContext() {
		return {};
	}
});

// Enable CORS for Better Auth routes (before mounting the handler)
app.use(
	'/api/auth',
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
	})
);

// Mount Better Auth handler - using Express v5 syntax
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Enable CORS for tRPC routes
app.use(
	'/trpc',
	cors({
		origin: 'http://localhost:5173',
		credentials: true
	})
);

// Enable express.json() for other routes (after Better Auth handler)
app.use(express.json());

// Mount tRPC handler
app.use('/trpc', trpcHandler);

// Example route showing how to get session in Express routes
app.get('/api/me', async (req, res) => {
	const { data: session, error } = await tryCatch(
		auth.api.getSession({
			headers: fromNodeHeaders(req.headers)
		})
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
app.listen(8000, () => {});

export type AppRouter = typeof appRouter;

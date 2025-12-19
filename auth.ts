import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './server/db';
import * as schema from './server/db/auth-schema';
import 'dotenv/config';

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:8000';

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  allowedOrigins: ['http://localhost:5173', BETTER_AUTH_URL],
  trustedOrigins: ['http://localhost:5173'],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

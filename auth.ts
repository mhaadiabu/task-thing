import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './server/db';
import * as schema from './server/db/auth-schema';
import 'dotenv/config';

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:5173',
];

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  allowedOrigins: [...ALLOWED_ORIGINS, BETTER_AUTH_URL].filter(Boolean),
  trustedOrigins: ALLOWED_ORIGINS,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: 'none' as const,
      secure: true,
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

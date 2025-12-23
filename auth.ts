import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './server/db';
import * as schema from './server/db/auth-schema';
import 'dotenv/config';

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:5173',
];

const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  allowedOrigins: [...ALLOWED_ORIGINS, BETTER_AUTH_URL].filter(
    Boolean,
  ) as string[],
  trustedOrigins: [...ALLOWED_ORIGINS, BETTER_AUTH_URL].filter(
    Boolean,
  ) as string[],
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Disable since we're on different domains
    },
    defaultCookieAttributes: {
      sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-site cookies
      secure: isProduction, // Must be true when sameSite is 'none'
      httpOnly: true,
      path: '/',
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

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './server/db';
import * as schema from './server/db/auth-schema';
import 'dotenv/config';

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:5173',
];

if (!BETTER_AUTH_SECRET) {
  console.warn(
    '[Auth Warning] BETTER_AUTH_SECRET is not set. This is required in production.',
  );
}

// Determine if we're in production (HTTPS) or development (HTTP)
const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  allowedOrigins: [...ALLOWED_ORIGINS, BETTER_AUTH_URL].filter(Boolean),
  trustedOrigins: ALLOWED_ORIGINS,
  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction, // Only enable for production with proper domain setup
    },
    useSecureCookies: isProduction, // Only use secure cookies in production (HTTPS)
    defaultCookieAttributes: {
      sameSite: isProduction ? ('none' as const) : ('lax' as const), // 'lax' works on localhost, 'none' requires secure
      secure: isProduction, // secure: true only works over HTTPS
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

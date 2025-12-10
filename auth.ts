import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./src/db";

import "dotenv/config";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

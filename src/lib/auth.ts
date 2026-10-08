import "server-only";
import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { dbPool } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: dbPool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(
    new Set([env.BETTER_AUTH_URL, "http://localhost:3000", "http://127.0.0.1:3000"]),
  ),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  plugins: [admin(), username()],
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        socialProviders: {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        },
      }
    : {}),
});

export const authHandler = toNextJsHandler(auth);

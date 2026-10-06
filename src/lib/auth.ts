import "server-only";
import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { env } from "@/lib/env";
import { dbPool } from "@/lib/db";

export const auth = betterAuth({
  database: dbPool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
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

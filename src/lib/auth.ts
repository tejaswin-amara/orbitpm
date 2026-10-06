import "server-only";
import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { dbPool } from "@/lib/db";
import { env } from "@/lib/env";

const trustedOrigins = new Set([env.BETTER_AUTH_URL]);
if (process.env.NODE_ENV !== "production") {
  trustedOrigins.add("http://localhost:3000");
  trustedOrigins.add("http://127.0.0.1:3000");
}

const allowedEmailDomains = env.ALLOWED_EMAIL_DOMAINS.split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

function isSignupAllowed(email: string): boolean {
  if (env.ALLOW_PUBLIC_SIGNUP) return true;
  const domain = email.split("@").at(-1)?.trim().toLowerCase();
  return Boolean(domain && allowedEmailDomains.includes(domain));
}

export const auth = betterAuth({
  database: dbPool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [...trustedOrigins],
  user: {
    validateUserInfo: async ({ user, source }) => {
      if (source.action === "create-user" && !isSignupAllowed(user.email ?? "")) {
        return {
          error: "signup_disabled",
          errorDescription: "Account creation is restricted.",
        };
      }
      return;
    },
  },
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

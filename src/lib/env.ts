import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
<<<<<<< HEAD
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
=======
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
>>>>>>> origin/main
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  ALLOW_PUBLIC_SIGNUP: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  ALLOWED_EMAIL_DOMAINS: z.string().default(""),
});

<<<<<<< HEAD
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
});

=======
const isBuild = process.env.npm_lifecycle_event === "build";
>>>>>>> origin/main
export const env = serverEnvSchema.parse({
  DATABASE_URL:
    process.env.DATABASE_URL ||
    (isBuild ? "postgresql://postgres:postgres@127.0.0.1:5432/orbitpm" : undefined),
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ||
    (isBuild ? "this_is_a_development_secret_for_tests" : undefined),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || (isBuild ? "http://127.0.0.1:3000" : undefined),
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  ALLOW_PUBLIC_SIGNUP: process.env.ALLOW_PUBLIC_SIGNUP,
  ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS,
});

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export interface AuthErrorLike {
  message?: string | null;
  code?: string | null;
  status?: number | null;
}

export function getAuthErrorMessage(
  mode: "sign-in" | "sign-up",
  error?: AuthErrorLike | string | null,
): string {
  if (mode === "sign-up") {
    const rawMsg = typeof error === "string" ? error : (error?.message ?? "");
    const rawCode = typeof error === "object" ? (error?.code ?? "") : "";
    const lowerMsg = rawMsg.toLowerCase();
    const upperCode = rawCode.toUpperCase();

    // 1. Email already in use
    if (
      upperCode === "USER_ALREADY_EXISTS" ||
      upperCode === "USER_EXISTS" ||
      lowerMsg.includes("already exists") ||
      lowerMsg.includes("already in use") ||
      lowerMsg.includes("user exists") ||
      lowerMsg.includes("email exists") ||
      lowerMsg.includes("duplicate")
    ) {
      return "Email already in use.";
    }

    // 2. Suppress login errors leaking into sign-up (e.g. "Authentication failed.", "Invalid email or password", "Invalid credentials")
    if (
      lowerMsg.includes("authentication failed") ||
      lowerMsg.includes("invalid credentials") ||
      lowerMsg.includes("invalid email or password") ||
      lowerMsg.includes("sign in") ||
      lowerMsg.includes("login")
    ) {
      return "Failed to create account. Please try again.";
    }

    // 3. Password requirements not met
    if (
      upperCode === "PASSWORD_TOO_SHORT" ||
      upperCode === "INVALID_PASSWORD" ||
      upperCode === "PASSWORD_REQUIREMENTS_NOT_MET" ||
      (lowerMsg.includes("password") &&
        (lowerMsg.includes("short") ||
          lowerMsg.includes("length") ||
          lowerMsg.includes("character") ||
          lowerMsg.includes("requirement") ||
          lowerMsg.includes("meet") ||
          lowerMsg.includes("invalid") ||
          lowerMsg.includes("weak")))
    ) {
      return "Password does not meet requirements.";
    }

    // 4. Invalid email format
    if (upperCode === "INVALID_EMAIL" || lowerMsg.includes("invalid email")) {
      return "Please enter a valid email address.";
    }

    // 5. If there is a clean descriptive user-facing message that isn't a login error or internal crash
    if (
      rawMsg &&
      !lowerMsg.includes("failed") &&
      !lowerMsg.includes("error") &&
      !lowerMsg.includes("internal") &&
      !lowerMsg.includes("500")
    ) {
      return rawMsg;
    }

    // 6. Generic registration fallback
    return "Failed to create account. Please try again.";
  }

  // mode === "sign-in"
  const rawMsg = typeof error === "string" ? error : (error?.message ?? "");
  const rawCode = typeof error === "object" ? (error?.code ?? "") : "";
  const lowerMsg = rawMsg.toLowerCase();
  const upperCode = rawCode.toUpperCase();

  if (
    upperCode === "INVALID_EMAIL_OR_PASSWORD" ||
    upperCode === "INVALID_CREDENTIALS" ||
    lowerMsg.includes("invalid email or password") ||
    lowerMsg.includes("invalid credentials") ||
    lowerMsg.includes("user not found")
  ) {
    return "Invalid email or password.";
  }

  return rawMsg || "Authentication failed.";
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "sign-up" && password.length < 10) {
      setError("Password does not meet requirements.");
      return;
    }

    setPending(true);
    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name });
      setPending(false);
      if (result.error) {
        setError(getAuthErrorMessage(mode, result.error));
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setPending(false);
      setError(
        mode === "sign-up"
          ? "Failed to create account. Please try again."
          : "Authentication failed. Please try again.",
      );
    }
  }

  return (
    <section className="glass w-full max-w-md rounded-3xl p-7 sm:p-9">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          OrbitPM
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
          {mode === "sign-in" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "sign-in" ? "Sign in to continue to your projects." : ""}
        </p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        {mode === "sign-up" && (
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              id="name"
              autoComplete="name"
              className="mt-2"
            />
          </label>
        )}
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            required
            id="email"
            autoComplete="email"
            className="mt-2"
          />
        </label>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            id="password"
            type="password"
            placeholder="At least 10 characters"
            minLength={10}
            required
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className="mt-2"
          />
        </label>
        {error && (
          <p
            role="alert"
            data-testid="auth-error"
            className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 transition-colors"
          >
            {error}
          </p>
        )}
        <Button className="w-full" disabled={pending}>
          {pending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
          className="font-medium text-foreground underline-offset-4 hover:underline transition-colors"
        >
          {mode === "sign-in" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </section>
  );
}

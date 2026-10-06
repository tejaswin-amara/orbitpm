"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

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
    setPending(true);
    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Authentication failed.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <section className="glass w-full max-w-md rounded-3xl p-7 sm:p-9">
      <div className="mb-8">
        <Link href="/" className="text-sm font-semibold text-slate-500">
          OrbitPM
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "sign-in"
            ? "Sign in to continue to your projects."
            : "Start with an account for your organization."}
        </p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        {mode === "sign-up" && (
          <label htmlFor="name" className="block text-sm font-medium">
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
        <label htmlFor="name" className="block text-sm font-medium">
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
        <label htmlFor="name" className="block text-sm font-medium">
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
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}
        <Button className="w-full" disabled={pending}>
          {pending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
          className="font-medium text-slate-900 dark:text-white"
        >
          {mode === "sign-in" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </section>
  );
}

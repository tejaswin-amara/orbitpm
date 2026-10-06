"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateProjectForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return <Button onClick={() => setOpen(true)}>New project</Button>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, description, targetDate }),
    });
    const body = (await response.json()) as { error?: string; project?: { id: string } };
    setPending(false);
    if (!response.ok || !body.project) {
      setError(body.error ?? "Could not create the project.");
      return;
    }
    router.push(`/app/projects/${body.project.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="name" className="text-sm font-medium sm:col-span-2">
          Project name
          <Input
            className="mt-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            id="name"
            maxLength={80}
          />
        </label>
        <label htmlFor="name" className="text-sm font-medium sm:col-span-2">
          Description
          <Textarea
            className="mt-2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            id="description"
            maxLength={500}
            placeholder="What outcome are you driving?"
          />
        </label>
        <label htmlFor="targetDate" className="text-sm font-medium">
          Target date
          <Input
            className="mt-2"
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

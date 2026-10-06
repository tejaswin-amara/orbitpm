"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Comment = { id: string; body: string; createdAt: string; author: { name: string } };

export function ProjectComments({
  projectId,
  initialComments,
}: {
  projectId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const response = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await response.json()) as { comment?: Comment; error?: string };
    setPending(false);
    if (response.ok && data.comment) {
      setComments((current) => [data.comment as NonNullable<typeof data.comment>, ...current]);
      setBody("");
    }
  }
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4" />
        <h2 className="text-lg font-semibold">Discussion</h2>
      </div>
      <form onSubmit={submit} className="glass rounded-2xl p-4">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          aria-label="Add a comment"
          placeholder="Add context, a decision, or a blocker…"
        />
        <div className="mt-3 flex justify-end">
          <Button disabled={pending || !body.trim()}>
            {pending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{comment.author.name}</span>
              <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {comment.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

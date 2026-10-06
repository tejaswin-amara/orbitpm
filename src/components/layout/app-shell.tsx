"use client";

import { useState } from "react";
import { OrbitAssistantModal } from "@/components/assistant/orbit-assistant-modal";
import { WorkspaceDock, type WorkspaceDockUser } from "@/components/layout/workspace-dock";

interface AppShellProps {
  user: WorkspaceDockUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">
      <WorkspaceDock
        user={user}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen((prev) => !prev)}
      />
      <main className="flex-1 min-h-0 overflow-hidden relative">{children}</main>
      <OrbitAssistantModal open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
    </div>
  );
}

# Project: OrbitPM Frontend Redesign & Rebuild

## Architecture
OrbitPM is a modern project intelligence and management application built on Next.js 16 (App Router with Turbopack), React 19, Tailwind CSS v4, Prisma ORM, and Better Auth.
The redesign transforms the user interface into a bespoke, highly interactive, zero-scroll spatial workspace featuring React Bits micro-animations, glassmorphic visual hierarchy, fluid native drag-and-drop, and Generative UI assistant protocols.

### Core Architecture Layers:
1. **Design System & Spatial Shell Layer (Completed in M1)**:
   - Zero-scroll desktop constraint: `html, body { height: 100vh; overflow: hidden; }` for 1080p+ displays.
   - Modular spatial shell: Fixed workspace dock/header (`h-14`), flex-grow canvas (`flex-1 min-h-0 overflow-hidden`), internal scroll containers with custom sleek scrollbars (`spatial-scrollbar`).
   - Deep slate/zinc dark aesthetic (`oklch` tokens) with multi-layered glassmorphic acrylic panels (`backdrop-filter: blur(20px)` with specular highlights).
2. **React Bits Animation Suite (Milestone M2)**:
   - `ParticlesBackground.tsx`: Interactive canvas particles with cursor repulsion and 60fps lifecycle cleanup.
   - `SplitText.tsx`: Staggered typography reveals for primary headings and hero banners.
   - `SpotlightCard.tsx`: Cursor-following radial spotlight on glassmorphic borders and surfaces.
   - `MagneticButton.tsx`: Spring-damped physics pull for key action buttons.
   - All animations strictly adhere to `prefers-reduced-motion` media queries.
3. **Interactive Kanban & Inspector Canvas (Milestone M3)**:
   - Native HTML5/pointer drag-and-drop with GPU-composited micro-feedback (`scale(1.03)`, `rotate(1.5deg)`, drop zone border glows).
   - Contextual slide-over inspector sheet (`w-[480px]`) for editing task details, assignees, and comments without layout shift.
   - Mobile responsive adaptation: Swipeable column rail and slide-up bottom sheets (`max-h-[85vh]`).
4. **Generative UI & Agent Protocols (Milestone M4)**:
   - Workspace dock assistant bar with universal keyboard trigger (`Cmd+K`).
   - Natural language intent engine supporting 4 core intents: Task Filtering, Automated Sprint Summarization, Generative Quick Task Creation, and Project Health/Blocker Analysis.
   - Dynamic cards rendered in spatial overlays: `<SprintSummaryCard />`, `<TaskListCard />`, `<TaskCreationPreviewCard />`, and `<ProjectHealthCard />`.
5. **Quality & Verification Harness (Milestone M5 & Parallel Track)**:
   - Vitest unit tests covering React Bits components, utilities, and intent parsers.
   - Playwright E2E regression suite validating zero-scroll viewport constraints (`scrollHeight === innerHeight` at 1920x1080), mobile drawer behavior, and cross-browser resilience.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Visual Design System & Tokens | Modern typography tokens, deep slate/zinc neutral tones, glowing micro-accents, glassmorphic acrylic surfaces, and custom spatial scrollbars | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Zero-Scroll Spatial Shell & Layouts | Strict 100vh viewport containment for `/`, `/app`, `/app/projects`, and `/(auth)`; fixed header/dock, flex-grow canvas (`min-h-0`), mobile responsive drawer | M1 | ORIGINAL_REQUEST §R1, §R2 |
| 3 | React Bits Component Suite | At least 4 distinct components (`ParticlesBackground`, `SplitText`, `SpotlightCard`, `MagneticButton`) with 60fps loop and reduced-motion fallback | M2 | ORIGINAL_REQUEST §R3 |
| 4 | Fluid Kanban Drag-and-Drop | High-performance drag-and-drop task movements replacing `<select>` dropdown, with drag elevation, drop zone glow, and zero layout shift | M3 | ORIGINAL_REQUEST §R3 |
| 5 | Contextual Slide-Over Inspector | Accessible slide-over inspector sheet for viewing and editing task details, statuses, priorities, and comments without full page navigation | M3 | ORIGINAL_REQUEST §R2 |
| 6 | Generative UI Assistant Bar | Workspace dock conversational assistant with natural language intent recognition (filter, summarize, create, health check) | M4 | ORIGINAL_REQUEST §R4 |
| 7 | Dynamic Generative Cards | Structured card rendering for AI responses (`SprintSummaryCard`, `TaskListCard`, `TaskCreationPreviewCard`, `ProjectHealthCard`) in spatial overlays | M4 | ORIGINAL_REQUEST §R4 |
| 8 | E2E Testing Suite & Viewport Harness | Playwright opaque-box test suite for 1080p zero-scroll, mobile drawer adaptation, and feature flows; Vitest component tests; 100% test pass | M5 / Test Track | ORIGINAL_REQUEST §R5 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System & Zero-Scroll Spatial Shell | Design tokens in `globals.css`, zero-scroll layout shell in `/app/layout.tsx`, navigation dock, responsive mobile drawer, refactored `/`, `/app`, and `/(auth)` layouts | none | DONE |
| M2 | React Bits Component Suite | Implement `ParticlesBackground`, `SplitText`, enhanced `SpotlightCard`, and `MagneticButton` with 60fps cleanup and `prefers-reduced-motion` | M1 | PLANNED |
| M3 | Fluid Kanban & Contextual Inspector | Native drag-and-drop Kanban board with micro-interactions, drop target glows, contextual slide-over task inspector, mobile column rail | M1, M2 | PLANNED |
| M4 | Generative UI & Assistant Protocols | Assistant dock bar (`Cmd+K`), natural language intent parser, dynamic generative UI cards (`SprintSummaryCard`, etc.), and mock AI agent streaming | M1, M3 | PLANNED |
| M5 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Phase 1: Pass 100% of E2E test suite (Tiers 1-4); Phase 2: Adversarial coverage hardening (Tier 5) with Challenger stress testing | M1, M2, M3, M4, Test Track | PLANNED |

---

## Parallel Track: E2E Testing Track
The E2E Testing Orchestrator runs concurrently with implementation milestones:
- Published `TEST_INFRA.md` defining opaque-box test architecture, Playwright viewport invariants, and test runners.
- Developed Tier 1 & Tier 2 test suites (`viewport-zero-scroll.spec.ts`, `layout-interactive.spec.ts`, `challenger-m1-stress.spec.ts`).
- 63/63 Playwright tests passing cleanly.

---

## Interface Contracts

### Shell ↔ Pages
- Root container: `<div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">`
- Main canvas container: `<main className="flex-1 min-h-0 overflow-hidden relative">`
- Internal scroll zones: Must use `spatial-scrollbar overflow-y-auto h-full` or `overflow-x-auto` with flex containment.

### Kanban Board ↔ Task Inspector Sheet
- `selectedTaskId: string | null`
- `onSelectTask: (taskId: string) => void`
- `onCloseInspector: () => void`
- `onTaskUpdate: (taskId: string, patch: Partial<Task>) => Promise<void>`

### Workspace Dock ↔ Generative Assistant
- `isAssistantOpen: boolean`
- `onToggleAssistant: () => void`
- `onExecuteIntent: (intent: AssistantIntent) => void`
- Assistant intents:
  ```ts
  type AssistantIntent =
    | { type: "FILTER_TASKS"; query: string; filter: { status?: string; priority?: string } }
    | { type: "SUMMARIZE_SPRINT"; projectId: string }
    | { type: "CREATE_TASK"; task: { title: string; priority: string; status: string } }
    | { type: "PROJECT_HEALTH"; projectId: string };
  ```

---

## Code Layout
```
src/
├── app/
│   ├── globals.css                       # Design tokens, typography, glassmorphism, scrollbars
│   ├── layout.tsx                        # Root layout with 100vh lock
│   ├── page.tsx                          # Zero-scroll landing page with React Bits hero
│   ├── (auth)/
│   │   ├── sign-in/page.tsx              # Centered zero-scroll sign-in
│   │   └── sign-up/page.tsx              # Centered zero-scroll sign-up
│   └── app/
│       ├── layout.tsx                    # Authenticated spatial shell (dock + flex-1 canvas)
│       ├── page.tsx                      # Zero-scroll overview dashboard
│       └── projects/
│           ├── page.tsx                  # Projects directory canvas
│           └── [projectId]/page.tsx      # Kanban workspace & slide-over inspector
├── components/
│   ├── layout/
│   │   ├── workspace-dock.tsx            # Fixed top/bottom dock with nav & assistant trigger
│   │   ├── mobile-sheet.tsx              # Mobile responsive navigation/inspector sheet
│   │   └── user-nav.tsx                  # User profile and session status
│   ├── react-bits/
│   │   ├── ParticlesBackground.tsx       # 60fps ambient particle mesh
│   │   ├── SplitText.tsx                 # Staggered typography reveal
│   │   ├── SpotlightCard.tsx             # Cursor-following radial light card
│   │   ├── MagneticButton.tsx            # Spring-damped magnetic button
│   │   └── DragFeedback.tsx              # DND drag elevation and drop glow indicator
│   ├── projects/
│   │   ├── project-board.tsx             # Kanban canvas with native drag-and-drop
│   │   ├── task-card.tsx                 # Kanban card with micro-feedback
│   │   ├── task-inspector.tsx            # Slide-over inspector sheet for task details
│   │   └── project-comments.tsx          # Comments sheet/tab within inspector
│   └── generative/
│       ├── assistant-dock.tsx            # Conversational dock search/prompt bar
│       ├── intent-parser.ts              # Natural language prompt parser
│       └── cards/
│           ├── sprint-summary-card.tsx   # Dynamic sprint breakdown card
│           ├── task-list-card.tsx        # Filtered task results card
│           ├── task-creation-card.tsx    # Preview card for generated tasks
│           └── project-health-card.tsx   # Project metrics and blocker overview card
tests/
├── unit/
│   ├── utils.test.ts
│   ├── react-bits.test.tsx               # Component unit tests
│   └── intent-parser.test.ts             # Generative UI intent parser tests
└── e2e/
    ├── smoke.spec.ts                     # Smoke tests
    ├── viewport-zero-scroll.spec.ts      # 1080p+ zero-scroll regression suite
    ├── layout-interactive.spec.ts        # Interaction & navigation suite
    ├── kanban-interaction.spec.ts        # Drag-and-drop & inspector E2E tests
    └── generative-assistant.spec.ts      # Assistant bar & generative card tests
```

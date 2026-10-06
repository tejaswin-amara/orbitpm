# OrbitPM E2E Testing Infrastructure (`TEST_INFRA.md`)

## 1. Overview & Dual Track Principles

OrbitPM's redesign transitions the application into a bespoke, zero-scroll spatial intelligence platform. In accordance with the project engineering doctrine in `PROJECT.md`, testing is conducted via an independent, parallel **E2E Testing Track** that runs concurrently with feature implementation milestones (M1–M4) and culminates in Milestone M5 (100% E2E Pass & Adversarial Hardening).

### Key Architectural Principles
- **Opaque-Box Specification Verification**: Tests interact strictly with observable DOM elements, user events, and viewport boundaries. Tests never inspect component internal state or couple to transient CSS class names.
- **Progressive Testability**: Tests are authored per milestone. Initial tests validate universally accessible routes (`/`, `/sign-in`, `/sign-up`), expanding as authenticated mocks and feature milestones land.
- **Strict Viewport Geometry Invariants**: Mathematical invariants enforce zero document-level body scroll at 1080p+ (1920x1080) and zero horizontal overflow across all responsive screen sizes.
- **Independence & Isolation**: Every test is self-contained, sets up its own viewport parameters, and leaves no residual mutations.

---

## 2. Test Architecture Tiers

The OrbitPM testing pyramid is organized into five distinct verification tiers:

```
                  ┌──────────────────────────────┐
                  │ Tier 5: Adversarial Stress    │
                  ├──────────────────────────────┤
                  │ Tier 4: Generative UI & Bar   │
                  ├──────────────────────────────┤
                  │ Tier 3: Kanban & Micro-Inter  │
                  ├──────────────────────────────┤
                  │ Tier 2: Zero-Scroll Invariants│
                  ├──────────────────────────────┤
                  │ Tier 1: Smoke & Sanity        │
                  └──────────────────────────────┘
```

### Tier 1: Smoke & Static Viewport Sanity
- **Scope**: Core route availability (`/`, `/sign-in`, `/sign-up`), HTTP 200 responses, primary landmarks, brand identity, navigation links, and Axe accessibility compliance (`@axe-core/playwright`).
- **Target Routes**: `/`, `/sign-in`, `/sign-up`.
- **Exit Criteria**: 100% route availability, 0 Axe accessibility violations.

### Tier 2: Responsive Zero-Scroll Matrix & Spatial Containment
- **Scope**: Rigorous geometric verification of the zero-scroll spatial architecture.
  - **1080p Desktop Standard** (`1920 x 1080`): `scrollHeight <= 1080px`, `scrollWidth <= 1920px`, `scrollY === 0` under wheel event.
  - **1440p Desktop Widescreen** (`2560 x 1440`): Extended spatial canvas without document spill.
  - **Laptop Viewports** (`1440 x 900`, `1366 x 768`): Compact containment.
  - **Mobile Viewports** (`390 x 844` iPhone 14, `360 x 640` Android): Zero horizontal overflow (`scrollWidth <= clientWidth + 1px`), responsive drawer/sheet transformation.
- **Test Files**: `tests/e2e/viewport-zero-scroll.spec.ts`.

### Tier 3: Core Interactions & Micro-Interactions (Milestones M2 & M3)
- **Scope**:
  - React Bits animation suite (`ParticlesBackground`, `SplitText`, `SpotlightCard`, `MagneticButton`).
  - Strict compliance with `prefers-reduced-motion: reduce`.
  - Native HTML5/pointer drag-and-drop on Kanban cards with drag elevation (`scale(1.03)`), drop zone border glow, and task column transitions.
  - Contextual slide-over inspector sheet (`w-[480px]`) open/close lifecycle, keyboard escape, and focus trap.
- **Test Files**: `tests/e2e/kanban-interaction.spec.ts`, `tests/e2e/react-bits.spec.ts`.

### Tier 4: Generative UI & Assistant Protocols (Milestone M4)
- **Scope**:
  - Workspace dock assistant bar universal keyboard trigger (`Cmd+K` / `Ctrl+K`).
  - Natural language intent parser dispatching:
    - `FILTER_TASKS`
    - `SUMMARIZE_SPRINT`
    - `CREATE_TASK`
    - `PROJECT_HEALTH`
  - Dynamic generative cards rendering within spatial overlay without expanding document bounds:
    - `<SprintSummaryCard />`
    - `<TaskListCard />`
    - `<TaskCreationPreviewCard />`
    - `<ProjectHealthCard />`
- **Test Files**: `tests/e2e/generative-assistant.spec.ts`.

### Tier 5: Adversarial Verification & Hardening (Milestone M5)
- **Scope**:
  - Boundary stress: rapid viewport resize oscillations (mobile -> desktop -> mobile).
  - High-density Kanban boards (100+ task cards) verifying internal column virtual scrolling without body leak.
  - XSS, injection, and unicode escaping in task titles and assistant prompt queries.
  - Rapid repeated clicks, concurrent drag operations, and network latency resilience.

---

## 3. Mathematical Viewport Invariants

The zero-scroll spatial architecture is governed by formal geometric formulas asserted in Playwright:

### Invariant 1: Desktop Zero Document Body Scroll
For any standard desktop viewport where $W \ge 1920$ and $H \ge 1080$:

$$\max(H_{\text{doc}}, H_{\text{body}}) \le H_{\text{window}}$$

$$\max(W_{\text{doc}}, W_{\text{body}}) \le W_{\text{window}}$$

Where:
- $H_{\text{doc}} = \text{document.documentElement.scrollHeight}$
- $H_{\text{body}} = \text{document.body.scrollHeight}$
- $H_{\text{window}} = \text{window.innerHeight}$

**Wheel Invariance Check**:
Upon dispatching a vertical scroll delta $\Delta y = 500$:

$$\text{window.scrollY} \equiv 0$$

### Invariant 2: Mobile Zero Horizontal Overflow
For any mobile viewport where $W \le 768$:

$$\max(W_{\text{doc}}, W_{\text{body}}) \le W_{\text{client}} + 1\text{px}$$

Where $1\text{px}$ accounts for subpixel rendering variations on high-DPI displays.

### Invariant 3: Spatial Element Containment
For any fixed or pinned spatial shell container $E$ (e.g. dock, fixed header, modal sheet):

$$0 \le y_{\text{top}} \le y_{\text{bottom}} \le H_{\text{window}} + 1\text{px}$$

$$0 \le x_{\text{left}} \le x_{\text{right}} \le W_{\text{window}} + 1\text{px}$$

Internal scrollable children must explicitly declare `overflow-y: auto | scroll` with custom scrollbars (`spatial-scrollbar`) and flex containment (`min-h-0`).

---

## 4. Reusable Assertion Helper Library (`tests/e2e/helpers/viewport.ts`)

The test suite relies on three standardized, strongly typed assertions:

| Helper Function | Purpose | Key Assertion |
| :--- | :--- | :--- |
| `assertZeroBodyScroll(page, options)` | Verifies desktop views have zero vertical or horizontal body scroll bars. | `max(scrollHeight) <= innerHeight` and `scrollY === 0` after wheel. |
| `assertZeroHorizontalOverflow(page, options)` | Verifies mobile views do not bleed horizontally outside screen edges. | `max(scrollWidth) <= clientWidth + 1` with culprit element discovery. |
| `assertSpatialContainment(page, selector, options)` | Verifies specific spatial elements remain strictly within container or viewport bounds. | `rect.bottom <= innerHeight` and `rect.right <= innerWidth`. |

---

## 5. Standardized Viewport Matrix

All Playwright tests evaluate against standardized device profiles:

| Viewport Profile | Width $\times$ Height | Aspect Ratio | Device Emulation | Target Behavior |
| :--- | :--- | :---: | :--- | :--- |
| **Desktop 1080p Standard** | $1920 \times 1080$ | 16:9 | Desktop Chrome | Zero document body scroll (`scrollHeight <= 1080`) |
| **Desktop 1440p Widescreen**| $2560 \times 1440$ | 16:9 | Desktop Chrome | Zero document body scroll, expanded spatial canvas |
| **Laptop Standard** | $1440 \times 900$ | 16:10 | Desktop Chrome | Zero document body scroll |
| **Laptop Constrained** | $1366 \times 768$ | 16:9 | Desktop Chrome | Compact zero-scroll spatial layout |
| **Mobile Standard** | $390 \times 844$ | ~19.5:9 | iPhone 14 / Pixel 7 | Zero horizontal overflow, responsive drawer/sheet |
| **Mobile Compact** | $360 \times 640$ | 16:9 | Android Compact | Zero horizontal overflow, stacked mobile rail |

---

## 6. Execution Runbook & Toolchain Commands

### Running E2E Tests
```bash
# Run complete Playwright test suite
pnpm test:e2e

# Run only viewport zero-scroll tests
pnpm test:e2e tests/e2e/viewport-zero-scroll.spec.ts

# Run tests in interactive UI mode
pnpm test:e2e:ui

# Run with trace viewer enabled on failure
pnpm test:e2e --trace on
```

### Running Unit & Component Tests
```bash
# Run Vitest unit tests
pnpm test

# Run Vitest in watch mode
pnpm test:watch
```

### Full Verification Pipeline
```bash
pnpm typecheck && pnpm test && pnpm test:e2e
```

---

## 7. Traceability Matrix

| Feature / Requirement | Milestone | Target Route / Component | Primary Test File | Test Tier |
| :--- | :---: | :--- | :--- | :---: |
| **R1 / F1: Design Tokens & Typography** | M1 | `globals.css`, `/`, `/(auth)` | `tests/e2e/smoke.spec.ts` | Tier 1 |
| **R1 / F2: 1080p Zero-Scroll Spatial Shell** | M1 | `/`, `/sign-in`, `/sign-up`, `/app` | `tests/e2e/viewport-zero-scroll.spec.ts` | Tier 2 |
| **R1 / F2: Mobile Drawer Adaptation** | M1 | `/`, `/app` | `tests/e2e/viewport-zero-scroll.spec.ts` | Tier 2 |
| **R3 / F3: React Bits Animation Suite** | M2 | `ParticlesBackground`, `SplitText` | `tests/unit/react-bits.test.tsx`, `tests/e2e/react-bits.spec.ts` | Tier 3 |
| **R3 / F4: Fluid Kanban Drag-and-Drop** | M3 | `ProjectBoard`, `TaskCard` | `tests/e2e/kanban-interaction.spec.ts` | Tier 3 |
| **R2 / F5: Contextual Slide-Over Inspector** | M3 | `TaskInspector` | `tests/e2e/kanban-interaction.spec.ts` | Tier 3 |
| **R4 / F6: Generative UI Assistant Bar** | M4 | `AssistantDock`, `intent-parser` | `tests/unit/intent-parser.test.ts`, `tests/e2e/generative-assistant.spec.ts` | Tier 4 |
| **R4 / F7: Dynamic Generative Cards** | M4 | `SprintSummaryCard`, etc. | `tests/e2e/generative-assistant.spec.ts` | Tier 4 |
| **R5 / F8: E2E Regression & Adversarial Hardening** | M5 | Full application | `tests/e2e/*.spec.ts` | Tier 5 |

---

## 8. Defect Escalation & Verification Protocol

When an E2E test fails:
1. **Determine Failure Mode**:
   - If test assertion accurately reflects `PROJECT.md` or `ORIGINAL_REQUEST.md` specification and the application code deviates, it is an **Implementation Bug**.
   - As Test Writer, do NOT modify application source code. File an escalation in `handoff.md` and alert the orchestrator with exact metrics (e.g. `scrollHeight: 1169px > innerHeight: 1080px`).
2. **Deterministic Baseline Defect (Known M1 Gap)**:
   - Route `/` currently renders `<main className="min-h-screen px-6 py-8 ...">` with cumulative height of `1169px` at 1920x1080.
   - This causes an **89px vertical body scroll regression** in the baseline implementation.
   - Milestone M1 implementers are tasked with refactoring `/` into the zero-scroll spatial layout. Once M1 completes, `viewport-zero-scroll.spec.ts` will pass 100%.

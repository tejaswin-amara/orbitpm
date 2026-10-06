import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileNavContent, MobileSheet } from "@/components/layout/mobile-sheet";
import { UserNav } from "@/components/layout/user-nav";
import { WorkspaceDock } from "@/components/layout/workspace-dock";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockCurrentPathname = "/app";

vi.mock("next/navigation", () => ({
  usePathname: () => mockCurrentPathname,
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next/link to render a basic anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
  }) =>
    createElement(
      "a",
      {
        href,
        onClick,
        className,
        ...rest,
      },
      children,
    ),
}));

// Mock better-auth authClient
const mockSignOut = vi.fn().mockResolvedValue({});
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: () => mockSignOut(),
  },
}));

describe("WorkspaceDock Component & Interactions", () => {
  const dummyUser = {
    name: "Alex Vance",
    email: "alex@orbitpm.internal",
    image: null,
  };

  beforeEach(() => {
    mockCurrentPathname = "/app";
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders brand, navigation links, and assistant trigger", () => {
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
      }),
    );

    expect(screen.getByText("OrbitPM")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByLabelText(/Ask Orbit or search tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Open mobile navigation/i)).toBeInTheDocument();
  });

  it("renders breadcrumbs when on a project detail route", () => {
    mockCurrentPathname = "/app/projects/project-alpha";
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        projectName: "Alpha Mission",
      }),
    );

    expect(screen.getByText("Alpha Mission")).toBeInTheDocument();
  });

  it("falls back to 'Workspace' when projectName is missing on a project detail route", () => {
    mockCurrentPathname = "/app/projects/proj-123";
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
      }),
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });

  it("triggers onToggleAssistant on Cmd+K (macOS metaKey)", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("triggers onToggleAssistant on Ctrl+K (Windows/Linux ctrlKey)", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("triggers onToggleAssistant on uppercase 'K' with modifier", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "K",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does NOT trigger onToggleAssistant on plain 'k' without modifier key", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: false,
      metaKey: false,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does NOT trigger onToggleAssistant on other keys with modifier (e.g. Ctrl+J)", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "j",
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("cleans up keydown listener on unmount to prevent ghost calls or memory leaks", () => {
    const onToggle = vi.fn();
    const { unmount } = render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    unmount();

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("triggers onToggleAssistant when clicking the center dock button", () => {
    const onToggle = vi.fn();
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
        onToggleAssistant: onToggle,
      }),
    );

    const triggerBtn = screen.getByLabelText(/Ask Orbit or search tasks/i);
    fireEvent.click(triggerBtn);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("opens mobile navigation drawer on hamburger button click", () => {
    render(
      createElement(WorkspaceDock, {
        user: dummyUser,
      }),
    );

    const hamburgerBtn = screen.getByLabelText(/Open mobile navigation/i);
    fireEvent.click(hamburgerBtn);

    // The MobileSheet dialog should now be visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Close menu/i)).toBeInTheDocument();
  });
});

describe("MobileSheet Mechanics (Open, Close, Dismissal, Body Scroll Lock)", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("renders null when open is false", () => {
    const { container } = render(
      createElement(MobileSheet, {
        open: false,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Drawer Content"),
      }),
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog overlay with title and content when open is true", () => {
    render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange: vi.fn(),
        title: "Test Drawer",
        children: createElement("div", null, "Inner Drawer Content"),
      }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Test Drawer");
    expect(screen.getByText("Inner Drawer Content")).toBeInTheDocument();
  });

  it("dismisses via close button (X)", () => {
    const onOpenChange = vi.fn();
    render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange,
        children: createElement("div", null, "Content"),
      }),
    );

    const closeBtn = screen.getByLabelText("Close menu");
    fireEvent.click(closeBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dismisses via backdrop button click", () => {
    const onOpenChange = vi.fn();
    render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange,
        children: createElement("div", null, "Content"),
      }),
    );

    const backdropBtn = screen.getByLabelText("Close sheet overlay");
    fireEvent.click(backdropBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dismisses via Escape key press", () => {
    const onOpenChange = vi.fn();
    render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange,
        children: createElement("div", null, "Content"),
      }),
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does NOT dismiss on other keys like Enter or Tab", () => {
    const onOpenChange = vi.fn();
    render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange,
        children: createElement("div", null, "Content"),
      }),
    );

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Tab" });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("cleans up Escape keydown listener on unmount", () => {
    const onOpenChange = vi.fn();
    const { unmount } = render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange,
        children: createElement("div", null, "Content"),
      }),
    );

    unmount();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("locks document.body.style.overflow to 'hidden' when open and restores when closed", () => {
    document.body.style.overflow = "";

    const { rerender } = render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Content"),
      }),
    );

    expect(document.body.style.overflow).toBe("hidden");

    // Close the sheet
    rerender(
      createElement(MobileSheet, {
        open: false,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Content"),
      }),
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("restores pre-existing body overflow style (e.g. 'auto')", () => {
    document.body.style.overflow = "auto";

    const { rerender } = render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Content"),
      }),
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      createElement(MobileSheet, {
        open: false,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Content"),
      }),
    );

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores body overflow if unmounted while open", () => {
    document.body.style.overflow = "";

    const { unmount } = render(
      createElement(MobileSheet, {
        open: true,
        onOpenChange: vi.fn(),
        children: createElement("div", null, "Content"),
      }),
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("survives 50 rapid open/close toggle stress cycles without leaking overflow style", () => {
    document.body.style.overflow = "auto";
    const onOpenChange = vi.fn();

    const { rerender } = render(
      createElement(MobileSheet, {
        open: false,
        onOpenChange,
        children: createElement("div", null, "Stress Content"),
      }),
    );

    for (let i = 0; i < 50; i++) {
      act(() => {
        rerender(
          createElement(MobileSheet, {
            open: true,
            onOpenChange,
            children: createElement("div", null, `Cycle ${i}`),
          }),
        );
      });
      expect(document.body.style.overflow).toBe("hidden");

      act(() => {
        rerender(
          createElement(MobileSheet, {
            open: false,
            onOpenChange,
            children: createElement("div", null, `Cycle ${i}`),
          }),
        );
      });
      expect(document.body.style.overflow).toBe("auto");
    }

    expect(document.body.style.overflow).toBe("auto");
  });
});

describe("MobileNavContent Interactions", () => {
  const dummyUser = {
    name: "Dr. Gordon Freeman",
    email: "gordon@blackmesa.internal",
    image: null,
  };

  afterEach(() => {
    cleanup();
  });

  it("renders navigation links and user profile with initials", () => {
    render(
      createElement(MobileNavContent, {
        user: dummyUser,
        onClose: vi.fn(),
      }),
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Ask Orbit Assistant")).toBeInTheDocument();
    expect(screen.getByText("Dr. Gordon Freeman")).toBeInTheDocument();
    expect(screen.getByText("gordon@blackmesa.internal")).toBeInTheDocument();
    expect(screen.getByText("DG")).toBeInTheDocument(); // Initials
  });

  it("calls onClose when a navigation link is clicked", () => {
    const onClose = vi.fn();
    render(
      createElement(MobileNavContent, {
        user: dummyUser,
        onClose,
      }),
    );

    const overviewLink = screen.getByText("Overview");
    fireEvent.click(overviewLink);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose and onToggleAssistant when assistant button is clicked", () => {
    const onClose = vi.fn();
    const onToggle = vi.fn();
    render(
      createElement(MobileNavContent, {
        user: dummyUser,
        onClose,
        onToggleAssistant: onToggle,
      }),
    );

    const assistantBtn = screen.getByText("Ask Orbit Assistant");
    fireEvent.click(assistantBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("handles sign out flow", async () => {
    const onClose = vi.fn();
    render(
      createElement(MobileNavContent, {
        user: dummyUser,
        onClose,
      }),
    );

    const signOutBtn = screen.getByText("Sign out");
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});

describe("UserNav Session Popover Mechanics", () => {
  const dummyUser = {
    name: "Alyx Vance",
    email: "alyx@city17.internal",
    image: null,
  };

  afterEach(() => {
    cleanup();
  });

  it("renders user avatar and closed popover state initially", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    expect(triggerBtn).toHaveAttribute("aria-expanded", "false");
    expect(triggerBtn).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByText("AV")).toBeInTheDocument(); // Initials
  });

  it("opens popover menu on trigger button click", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    fireEvent.click(triggerBtn);

    expect(triggerBtn).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByText("Session Authenticated")).toBeInTheDocument();
    expect(screen.getByText("alyx@city17.internal")).toBeInTheDocument();
  });

  it("dismisses popover on Escape key", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    fireEvent.click(triggerBtn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(triggerBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses popover on outside click (mousedown)", () => {
    render(
      createElement(
        "div",
        null,
        createElement(UserNav, { user: dummyUser }),
        createElement("div", { "data-testid": "outside-area" }, "Outside"),
      ),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    fireEvent.click(triggerBtn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    const outsideArea = screen.getByTestId("outside-area");
    fireEvent.mouseDown(outsideArea);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does NOT dismiss popover when clicking inside the menu", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    fireEvent.click(triggerBtn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    const authBadge = screen.getByText("Session Authenticated");
    fireEvent.mouseDown(authBadge);

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes popover when a navigation item inside the menu is clicked", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });
    fireEvent.click(triggerBtn);

    const overviewLink = screen.getByRole("menuitem", { name: /Overview/i });
    fireEvent.click(overviewLink);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stress test: survives 100 rapid click toggles without state desync", () => {
    render(
      createElement(UserNav, {
        user: dummyUser,
      }),
    );

    const triggerBtn = screen.getByRole("button", { name: "User account menu" });

    for (let i = 0; i < 100; i++) {
      fireEvent.click(triggerBtn);
      const isOdd = i % 2 === 0;
      expect(triggerBtn).toHaveAttribute("aria-expanded", isOdd ? "true" : "false");
      if (isOdd) {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      } else {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      }
    }
  });

  it("adversarial initials test: handles single-name user correctly", () => {
    render(
      createElement(UserNav, {
        user: { name: "Cher", email: "cher@artist.internal" },
      }),
    );

    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("adversarial initials test: handles empty string fallback gracefully", () => {
    render(
      createElement(UserNav, {
        user: { name: "", email: "anonymous@orbitpm.internal" },
      }),
    );

    expect(screen.getByText("OP")).toBeInTheDocument();
  });
});

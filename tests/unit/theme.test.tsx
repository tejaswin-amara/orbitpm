import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSystemTheme,
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

function ThemeConsumer() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button type="button" onClick={toggleTheme} data-testid="toggle-btn">
        Toggle
      </button>
      <button type="button" onClick={() => setTheme("light")} data-testid="set-light">
        Set Light
      </button>
      <button type="button" onClick={() => setTheme("dark")} data-testid="set-dark">
        Set Dark
      </button>
      <button type="button" onClick={() => setTheme("system")} data-testid="set-system">
        Set System
      </button>
    </div>
  );
}

describe("Theme System & Provider Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("getSystemTheme defaults to 'dark' when OS does not prefer light", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getSystemTheme()).toBe("dark");
  });

  it("getSystemTheme returns 'light' when OS prefers-color-scheme is light", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: light)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(getSystemTheme()).toBe("light");
  });

  it("initializes with default dark theme when nothing in localStorage", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved-theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("initializes with light theme if stored in localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(screen.getByTestId("resolved-theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggleTheme switches between dark and light, persisting to localStorage", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Initial state is dark
    expect(screen.getByTestId("resolved-theme").textContent).toBe("dark");

    // Toggle to light
    await act(async () => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("resolved-theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    // Toggle back to dark
    await act(async () => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("resolved-theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("setTheme correctly updates state to system/auto", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("set-system"));
    });

    expect(screen.getByTestId("current-theme").textContent).toBe("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
});

describe("ThemeToggle UI Component Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders icon toggle button and switches theme on click", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByTestId("theme-toggle");
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.getAttribute("aria-label")).toBe("Switch to light theme");

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(toggleBtn.getAttribute("aria-label")).toBe("Switch to dark theme");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("renders pill variant with Dark, Light, and Auto buttons", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="pill" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: /dark/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /light/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /auto/i })).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /light/i }));
    });

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});

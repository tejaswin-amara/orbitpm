import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm, getAuthErrorMessage } from "@/components/auth/auth-form";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) =>
    createElement(
      "a",
      {
        href,
        className,
      },
      children,
    ),
}));

// Mock better-auth authClient
const mockSignInEmail = vi.fn();
const mockSignUpEmail = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: (...args: unknown[]) => mockSignInEmail(...args),
    },
    signUp: {
      email: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}));

describe("getAuthErrorMessage Helper Unit Tests", () => {
  describe("Sign-Up Error Normalization", () => {
    it("maps USER_ALREADY_EXISTS code to 'Email already in use.'", () => {
      const msg = getAuthErrorMessage("sign-up", { code: "USER_ALREADY_EXISTS" });
      expect(msg).toBe("Email already in use.");
    });

    it("maps 'User already exists' message to 'Email already in use.'", () => {
      const msg = getAuthErrorMessage("sign-up", { message: "User already exists." });
      expect(msg).toBe("Email already in use.");
    });

    it("maps 'Email is already in use' message to 'Email already in use.'", () => {
      const msg = getAuthErrorMessage("sign-up", { message: "Email is already in use" });
      expect(msg).toBe("Email already in use.");
    });

    it("maps PASSWORD_TOO_SHORT code to 'Password does not meet requirements.'", () => {
      const msg = getAuthErrorMessage("sign-up", { code: "PASSWORD_TOO_SHORT" });
      expect(msg).toBe("Password does not meet requirements.");
    });

    it("maps password length/character messages to 'Password does not meet requirements.'", () => {
      const msg = getAuthErrorMessage("sign-up", {
        message: "Password must be at least 10 characters",
      });
      expect(msg).toBe("Password does not meet requirements.");
    });

    it("maps invalid email code or message to 'Please enter a valid email address.'", () => {
      const msg = getAuthErrorMessage("sign-up", { code: "INVALID_EMAIL" });
      expect(msg).toBe("Please enter a valid email address.");
    });

    it("suppresses login error 'Authentication failed.' and converts to 'Failed to create account. Please try again.'", () => {
      const msg = getAuthErrorMessage("sign-up", { message: "Authentication failed." });
      expect(msg).toBe("Failed to create account. Please try again.");
    });

    it("suppresses 'Invalid email or password' on sign-up and converts to 'Failed to create account. Please try again.'", () => {
      const msg = getAuthErrorMessage("sign-up", { message: "Invalid email or password" });
      expect(msg).toBe("Failed to create account. Please try again.");
    });

    it("returns generic 'Failed to create account. Please try again.' for null/undefined or unknown error", () => {
      expect(getAuthErrorMessage("sign-up", null)).toBe(
        "Failed to create account. Please try again.",
      );
      expect(getAuthErrorMessage("sign-up", undefined)).toBe(
        "Failed to create account. Please try again.",
      );
      expect(getAuthErrorMessage("sign-up", { status: 500 })).toBe(
        "Failed to create account. Please try again.",
      );
    });
  });

  describe("Sign-In Error Normalization", () => {
    it("maps INVALID_EMAIL_OR_PASSWORD code to 'Invalid email or password.'", () => {
      const msg = getAuthErrorMessage("sign-in", { code: "INVALID_EMAIL_OR_PASSWORD" });
      expect(msg).toBe("Invalid email or password.");
    });

    it("maps invalid credentials messages to 'Invalid email or password.'", () => {
      const msg = getAuthErrorMessage("sign-in", { message: "Invalid credentials provided" });
      expect(msg).toBe("Invalid email or password.");
    });

    it("falls back to 'Authentication failed.' if no message or code is provided", () => {
      expect(getAuthErrorMessage("sign-in", null)).toBe("Authentication failed.");
      expect(getAuthErrorMessage("sign-in", undefined)).toBe("Authentication failed.");
    });
  });
});

describe("AuthForm Component Interactive Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders sign-up mode elements accurately", () => {
    render(<AuthForm mode="sign-up" />);
    expect(screen.getByRole("heading", { name: "Create account" })).toBeDefined();
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create account" })).toBeDefined();
  });

  it("surfaces 'Password does not meet requirements.' when submitting with a short password", async () => {
    render(<AuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Tejaswin Amara" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Create account" }));
    });

    const errorEl = screen.getByRole("alert");
    expect(errorEl.textContent).toBe("Password does not meet requirements.");
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it("surfaces 'Email already in use.' when API returns duplicate user error", async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      error: { code: "USER_ALREADY_EXISTS", message: "User already exists" },
    });

    render(<AuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Tejaswin Amara" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "tejaswinamara@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securePassword123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Create account" }));
    });

    const errorEl = screen.getByRole("alert");
    expect(errorEl.textContent).toBe("Email already in use.");
  });

  it("surfaces 'Failed to create account. Please try again.' instead of 'Authentication failed.' on generic sign-up error", async () => {
    // Simulating the bug reported by the user where "Authentication failed." was returned
    mockSignUpEmail.mockResolvedValueOnce({
      error: { message: "Authentication failed." },
    });

    render(<AuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Tejaswin Amara" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "tejaswinamara@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securePassword123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Create account" }));
    });

    const errorEl = screen.getByRole("alert");
    expect(errorEl.textContent).toBe("Failed to create account. Please try again.");
    expect(errorEl.textContent).not.toBe("Authentication failed.");
  });

  it("redirects to /app when registration succeeds", async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "tejaswinamara@gmail.com" } },
      error: null,
    });

    render(<AuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Tejaswin Amara" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "tejaswinamara@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securePassword123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Create account" }));
    });

    expect(screen.queryByRole("alert")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/app");
    expect(mockRefresh).toHaveBeenCalled();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockIsAuthenticated = false;

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
  }),
  Authenticated: ({ children }: { children: React.ReactNode }) =>
    mockIsAuthenticated ? <>{children}</> : null,
  Unauthenticated: ({ children }: { children: React.ReactNode }) =>
    !mockIsAuthenticated ? <>{children}</> : null,
}));

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn, signOut: mockSignOut }),
}));

import App from "./App";

describe("AUTH-1: Google OAuth Sign In/Sign Up", () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockSignIn.mockReset();
    mockSignOut.mockReset();
  });

  it("renders sign-in screen with branding for unauthenticated users", () => {
    render(<App />);

    expect(screen.getByText("SplitEase")).toBeInTheDocument();
    expect(
      screen.getByText("Split expenses with roommates"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("initiates Google OAuth on button click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    expect(mockSignIn).toHaveBeenCalledWith("google");
  });

  it("does not show sign-in screen for authenticated users", () => {
    mockIsAuthenticated = true;
    render(<App />);

    expect(
      screen.queryByRole("button", { name: /continue with google/i }),
    ).not.toBeInTheDocument();
  });

  it("signs out when sign-out button is clicked", async () => {
    mockIsAuthenticated = true;
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(mockSignOut).toHaveBeenCalled();
  });
});

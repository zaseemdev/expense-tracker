import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { test, renderWithConvex } from "./test/convex.setup";
import { api } from "../convex/_generated/api";
import {
  SignInScreen,
  AuthenticatedRouter,
} from "./App";

describe("AUTH-1: Google OAuth Sign In/Sign Up", () => {
  it("renders sign-in screen with branding for unauthenticated users", () => {
    render(<SignInScreen onSignIn={() => {}} />);

    expect(screen.getByText("SplitEase")).toBeInTheDocument();
    expect(
      screen.getByText("Split expenses with roommates"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("initiates Google OAuth on button click", async () => {
    const onSignIn = vi.fn();
    const user = userEvent.setup();
    render(<SignInScreen onSignIn={onSignIn} />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    expect(onSignIn).toHaveBeenCalled();
  });
});

describe("PROFILE-1: Display Name", () => {
  test("shows display name form for authenticated user without display name", async ({
    client,
  }) => {
    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByText("What should we call you?"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("This name will be visible to your roommates"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeInTheDocument();
  });

  test("continue button is disabled when input is empty", async ({
    client,
  }) => {
    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeDisabled();
    });
  });

  test("submitting display name calls setDisplayName mutation", async ({
    client,
  }) => {
    const user = userEvent.setup();

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Display Name"), "Jaseem");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Verify backend state
    const displayName = await client.query(api.users.getDisplayName, {});
    expect(displayName).toBe("Jaseem");
  });

  test("user with existing display name skips the form", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByText("Welcome to SplitEase")).toBeInTheDocument();
    });
    expect(
      screen.queryByText("What should we call you?"),
    ).not.toBeInTheDocument();
  });
});

describe("Backend guards: unauthenticated access", () => {
  test("getDisplayName returns null when unauthenticated", async ({
    testClient,
  }) => {
    const result = await testClient.query(api.users.getDisplayName, {});
    expect(result).toBeNull();
  });

  test("setDisplayName throws when unauthenticated", async ({
    testClient,
  }) => {
    await expect(
      testClient.mutation(api.users.setDisplayName, {
        displayName: "Jaseem",
      }),
    ).rejects.toThrow("Not authenticated");
  });
});

describe("Authenticated Shell", () => {
  test("does not show sign-in screen for authenticated users", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /continue with google/i }),
      ).not.toBeInTheDocument();
    });
  });

  test("signs out when sign-out button is clicked", async ({
    client,
    userId,
    testClient,
  }) => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={onSignOut} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign out/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(onSignOut).toHaveBeenCalled();
  });
});

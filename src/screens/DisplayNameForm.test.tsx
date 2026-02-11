import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { AuthenticatedRouter } from "../App";

beforeEach(cleanup);

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
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });
    expect(
      screen.queryByText("What should we call you?"),
    ).not.toBeInTheDocument();
  });
});

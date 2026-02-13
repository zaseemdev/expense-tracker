import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, vi } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { AuthenticatedRouter } from "../App";

beforeEach(cleanup);

describe("Authenticated Shell", () => {
  test("shows shell with sign-out for users in a room", async ({ client }) => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();

    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Test Room" });

    renderWithConvex(<AuthenticatedRouter onSignOut={onSignOut} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign out/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /continue with google/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalled();
  });

  test("shows room name in header, green '+' FAB, and copy invite copies code to clipboard", async ({
    client,
  }) => {
    const user = userEvent.setup();

    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy invite/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copy invite/i }));
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe(room!.inviteCode);
  });

  test("FAB opens add expense form, close returns to shell", async ({
    client,
  }) => {
    const user = userEvent.setup();

    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));

    expect(screen.getByText("Add Expense")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /×/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /×/i }));

    expect(screen.queryByText("Add Expense")).not.toBeInTheDocument();
    expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
  });

  test("navigating to /expenses/add shows add expense form directly", async ({
    client,
  }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client, {
      initialEntries: ["/expenses/add"],
    });

    await waitFor(() => {
      expect(screen.getByText("Add Expense")).toBeInTheDocument();
    });
  });

  test("submitting expense form creates expense in database and returns to shell", async ({
    client,
    userId,
  }) => {
    const user = userEvent.setup();

    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "450");
    await user.type(
      screen.getByLabelText("Description"),
      "Groceries - milk, bread",
    );
    await user.click(screen.getByRole("button", { name: /save/i }));

    // Form closes, returns to shell
    await waitFor(() => {
      expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
    });
    expect(screen.queryByText("Add Expense")).not.toBeInTheDocument();

    // Verify expense was created using getExpenses query
    const expenses = await client.query(api.expenses.getExpenses, {});
    expect(expenses).toHaveLength(1);
    expect(expenses[0].amount).toBe(450);
    expect(expenses[0].description).toBe("Groceries - milk, bread");
    expect(expenses[0].paidBy.userId).toEqual(userId);
  });
});

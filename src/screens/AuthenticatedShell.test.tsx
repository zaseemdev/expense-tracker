import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, vi } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { AuthenticatedRouter } from "../App";

beforeEach(cleanup);

describe("Authenticated Shell", () => {
  test("shows shell with sign-out for users in a room", async ({
    client,
    userId,
    testClient,
  }) => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Test Room",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

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

  test("shows room name in header and green '+' FAB", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /\+/i }),
    ).toBeInTheDocument();
  });

  test("FAB opens add expense form, close returns to shell", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

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

  test("Save button disabled when fields empty, enabled when filled", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    await user.type(screen.getByLabelText("Amount"), "450");
    await user.type(screen.getByLabelText("Description"), "Groceries");

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("navigating to /expenses/add shows add expense form directly", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(
      <AuthenticatedRouter onSignOut={() => {}} />,
      client,
      { initialEntries: ["/expenses/add"] },
    );

    await waitFor(() => {
      expect(screen.getByText("Add Expense")).toBeInTheDocument();
    });
  });

  test("submitting expense form creates expense in database and returns to shell", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    let roomId: any;
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Test User" });
      roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "450");
    await user.type(screen.getByLabelText("Description"), "Groceries - milk, bread");
    await user.click(screen.getByRole("button", { name: /save/i }));

    // Form closes, returns to shell
    await waitFor(() => {
      expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
    });
    expect(screen.queryByText("Add Expense")).not.toBeInTheDocument();

    // Verify database state
    await testClient.run(async (ctx: any) => {
      const expense = await ctx.db
        .query("expenses")
        .withIndex("roomId", (q: any) => q.eq("roomId", roomId))
        .first();
      expect(expense).not.toBeNull();
      expect(expense!.amount).toBe(450);
      expect(expense!.description).toBe("Groceries - milk, bread");
      expect(expense!.paidBy).toEqual(userId);
    });
  });

  test("add expense form shows split-with checkboxes for all room members", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Alice" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
      const bobId = await ctx.db.insert("users", { displayName: "Bob" });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: bobId,
        role: "member",
        joinedAt: Date.now(),
      });
      const charlieId = await ctx.db.insert("users", {
        displayName: "Charlie",
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: charlieId,
        role: "member",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "450");

    // "Split with" section with Unselect All button
    expect(screen.getByText("Split with")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    // All members shown with checkboxes, all checked
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());

    // Current user labelled "You"
    expect(screen.getByText("You")).toBeInTheDocument();

    // Each checked member shows split amount
    const amounts = screen.getAllByText("₹150.00");
    expect(amounts).toHaveLength(3);
  });

  test("Save button disabled when all members unchecked", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Alice" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
      const bobId = await ctx.db.insert("users", { displayName: "Bob" });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: bobId,
        role: "member",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "300");
    await user.type(screen.getByLabelText("Description"), "Groceries");

    // Save enabled with members checked
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();

    // Uncheck all members
    const checkboxes = screen.getAllByRole("checkbox");
    for (const cb of checkboxes) {
      await user.click(cb);
    }

    // Save disabled when no members selected
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    // Re-check one member re-enables Save
    await user.click(checkboxes[0]);
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("toggling members updates inline split amounts", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Alice" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
      const bobId = await ctx.db.insert("users", { displayName: "Bob" });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: bobId,
        role: "member",
        joinedAt: Date.now(),
      });
      const charlieId = await ctx.db.insert("users", {
        displayName: "Charlie",
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: charlieId,
        role: "member",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "450");

    // All 3 checked → ₹150.00 each
    expect(screen.getAllByText("₹150.00")).toHaveLength(3);

    // Uncheck Bob → Alice and Charlie show ₹225.00, Bob shows no amount
    const checkboxes = screen.getAllByRole("checkbox");
    // Bob is the second member checkbox
    await user.click(checkboxes[1]);
    expect(screen.queryByText("₹150.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹225.00")).toHaveLength(2);

    // Uncheck Alice (payer) → only Charlie checked, shows ₹450.00
    await user.click(checkboxes[0]);
    expect(screen.queryByText("₹225.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹450.00")).toHaveLength(1);

    // Re-check Bob → Bob and Charlie each show ₹225.00
    await user.click(checkboxes[1]);
    expect(screen.queryByText("₹450.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹225.00")).toHaveLength(2);
  });

  test("Select All / Unselect All toggles all members", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Alice" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "ABC123",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
      const bobId = await ctx.db.insert("users", { displayName: "Bob" });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: bobId,
        role: "member",
        joinedAt: Date.now(),
      });
      const charlieId = await ctx.db.insert("users", {
        displayName: "Charlie",
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: charlieId,
        role: "member",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+/i }));
    await user.type(screen.getByLabelText("Amount"), "300");

    // All checked → button says "Unselect All"
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    // Click "Unselect All" → all unchecked, button says "Select All"
    await user.click(
      screen.getByRole("button", { name: /unselect all/i }),
    );
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    expect(
      screen.getByRole("button", { name: /select all/i }),
    ).toBeInTheDocument();

    // Click "Select All" → all checked with ₹100.00, button says "Unselect All"
    await user.click(
      screen.getByRole("button", { name: /select all/i }),
    );
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
    expect(screen.getAllByText("₹100.00")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    // Uncheck one member manually → button switches to "Select All"
    await user.click(checkboxes[1]);
    expect(
      screen.getByRole("button", { name: /select all/i }),
    ).toBeInTheDocument();

    // Click "Select All" re-checks all
    await user.click(
      screen.getByRole("button", { name: /select all/i }),
    );
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();
  });
});

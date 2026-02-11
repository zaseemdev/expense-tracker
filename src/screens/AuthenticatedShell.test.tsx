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
});

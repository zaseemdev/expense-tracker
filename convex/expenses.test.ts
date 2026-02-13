import { describe, expect } from "vitest";
import { test } from "../src/test/convex.setup";
import { api } from "./_generated/api";

const expenseArgs = (
  overrides: { amount?: number; date?: string; description?: string; splits?: Array<{ userId: string; amount: number }> } = {},
) => ({
  amount: 450,
  date: "2026-02-11",
  description: "Groceries",
  splits: [] as Array<{ userId: string; amount: number }>,
  ...overrides,
});

describe("Backend guards: expenses", () => {
  test("createExpense throws when unauthenticated", async ({ testClient }) => {
    await expect(
      testClient.mutation(api.expenses.createExpense, expenseArgs()),
    ).rejects.toThrow("Not authenticated");
  });

  test("createExpense throws when not a room member", async ({ client }) => {
    await expect(
      client.mutation(api.expenses.createExpense, expenseArgs()),
    ).rejects.toThrow("Not a room member");
  });
});

describe("getExpenses", () => {
  test("returns empty array when unauthenticated", async ({ testClient }) => {
    const result = await testClient.query(api.expenses.getExpenses, {});
    expect(result).toEqual([]);
  });

  test("returns empty array when user has no room", async ({ client }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    const result = await client.query(api.expenses.getExpenses, {});
    expect(result).toEqual([]);
  });

  test("returns expenses with payer name and user's share", async ({
    client,
    userId,
  }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Alice",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    await client.mutation(api.expenses.createExpense, {
      amount: 300,
      date: "2026-02-12",
      description: "Groceries - milk",
      splits: [{ userId, amount: 150 }],
    });
    const result = await client.query(api.expenses.getExpenses, {});
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      description: "Groceries - milk",
      amount: 300,
      paidBy: { userId, displayName: "Alice" },
      myShare: 150,
    });
  });

  test("returns null myShare when user not in split", async ({
    client,
    createUser,
  }) => {
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});
    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    const bobId = await bob.query(api.users.getCurrentUserId, {});
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });
    await client.mutation(api.expenses.createExpense, {
      amount: 200,
      date: "2026-02-12",
      description: "Bob only split",
      splits: [{ userId: bobId, amount: 200 }],
    });
    const result = await client.query(api.expenses.getExpenses, {});
    expect(result).toHaveLength(1);
    expect(result[0].myShare).toBeNull();
    expect(result[0].paidBy.displayName).toBe("Alice");
  });

  test("createExpense persists splits to expenseSplits table", async ({
    client,
    userId,
    testClient,
    createUser,
  }) => {
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});
    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    const bobId = await bob.query(api.users.getCurrentUserId, {});
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });

    await client.mutation(api.expenses.createExpense, {
      amount: 600,
      date: "2026-02-12",
      description: "Dinner",
      splits: [
        { userId, amount: 200 },
        { userId: bobId, amount: 400 },
      ],
    });

    const expenses = await client.query(api.expenses.getExpenses, {});
    expect(expenses).toHaveLength(1);
    const expenseId = expenses[0]._id;

    // TODO: replace with client.query(api.expenses.getSplitsForExpense, { expenseId }) once that query exists
    const splits = await testClient.run(async (ctx: any) => {
      return await ctx.db
        .query("expenseSplits")
        .withIndex("expenseId", (q: any) => q.eq("expenseId", expenseId))
        .collect();
    });
    expect(splits).toHaveLength(2);
    const amounts = splits
      .map((s: { amount: number }) => s.amount)
      .sort((a: number, b: number) => a - b);
    expect(amounts).toEqual([200, 400]);
  });
});

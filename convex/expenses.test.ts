import { describe, expect } from "vitest";
import { test } from "../src/test/convex.setup";
import { api } from "./_generated/api";

describe("Backend guards: expenses", () => {
  test("createExpense throws when unauthenticated", async ({ testClient }) => {
    await expect(
      testClient.mutation(api.expenses.createExpense, {
        amount: 450,
        date: "2026-02-11",
        description: "Groceries",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  test("createExpense throws when not a room member", async ({ client }) => {
    await expect(
      client.mutation(api.expenses.createExpense, {
        amount: 450,
        date: "2026-02-11",
        description: "Groceries",
      }),
    ).rejects.toThrow("Not a room member");
  });
});

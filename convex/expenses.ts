import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const splitValidator = v.object({
  userId: v.id("users"),
  amount: v.number(),
});

export const createExpense = mutation({
  args: {
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    splits: v.array(splitValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership) throw new Error("Not a room member");

    const expenseId = await ctx.db.insert("expenses", {
      roomId: membership.roomId,
      paidBy: userId,
      amount: args.amount,
      date: args.date,
      description: args.description,
    });

    for (const split of args.splits) {
      await ctx.db.insert("expenseSplits", {
        expenseId,
        userId: split.userId,
        amount: split.amount,
      });
    }
    return null;
  },
});

// TODO: Need to verify if there is a better way to do this
const expenseListItemValidator = v.object({
  _id: v.id("expenses"),
  description: v.string(),
  amount: v.number(),
  date: v.string(),
  paidBy: v.object({
    userId: v.id("users"),
    displayName: v.union(v.string(), v.null()),
  }),
  myShare: v.union(v.number(), v.null()),
});

export const getExpenses = query({
  args: {},
  returns: v.array(expenseListItemValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // TODO: replace with client.query(api.rooms.getCurrentRoom, {})
    // Currently, this is not possible because there is a bug in the convex-test-provider
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership) return [];

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("roomId", (q) => q.eq("roomId", membership.roomId))
      .order("desc")
      .collect();

    const result = [];
    for (const expense of expenses) {
      const payer = await ctx.db.get(expense.paidBy);
      const mySplit = await ctx.db
        .query("expenseSplits")
        .withIndex("expenseId_userId", (q) =>
          q.eq("expenseId", expense._id).eq("userId", userId),
        )
        .first();
      result.push({
        _id: expense._id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        paidBy: {
          userId: expense.paidBy,
          displayName: payer!.displayName!,
        },
        myShare: mySplit?.amount ?? null,
      });
    }
    return result;
  },
});

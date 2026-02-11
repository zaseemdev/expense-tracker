import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createExpense = mutation({
  args: {
    amount: v.number(),
    date: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership) throw new Error("Not a room member");

    await ctx.db.insert("expenses", {
      roomId: membership.roomId,
      paidBy: userId,
      amount: args.amount,
      date: args.date,
      description: args.description,
    });
  },
});

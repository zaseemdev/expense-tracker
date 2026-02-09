import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentRoom = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (!membership) return null;
    const room = await ctx.db.get(membership.roomId);
    return room;
  },
});

export const createRoom = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    void args;
    throw new Error("Not implemented");
  },
});

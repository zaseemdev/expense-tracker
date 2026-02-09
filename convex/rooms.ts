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
// TODO: Will this always generate a unique code?
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createRoom = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("Already in a room");

    const inviteCode = generateInviteCode();
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      inviteCode,
      createdBy: userId,
    });

    await ctx.db.insert("roomMembers", {
      roomId,
      userId,
      role: "admin",
      joinedAt: Date.now(),
    });
  },
});

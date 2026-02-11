import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    displayName: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  rooms: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    createdBy: v.id("users"),
  }).index("inviteCode", ["inviteCode"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("roomId", ["roomId"]),

  expenses: defineTable({
    roomId: v.id("rooms"),
    paidBy: v.id("users"),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
  }).index("roomId", ["roomId"]),

  joinRequests: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  })
    .index("userId", ["userId"])
    .index("roomId_status", ["roomId", "status"]),
});

import { describe, expect } from "vitest";
import { test } from "../src/test/convex.setup";
import { api } from "./_generated/api";

describe("Backend guards: rooms", () => {
  test("getCurrentRoom returns null when unauthenticated", async ({
    testClient,
  }) => {
    const result = await testClient.query(api.rooms.getCurrentRoom, {});
    expect(result).toBeNull();
  });

  test("createRoom throws when unauthenticated", async ({ testClient }) => {
    await expect(
      testClient.mutation(api.rooms.createRoom, { name: "Test Room" }),
    ).rejects.toThrow("Not authenticated");
  });

  test("createRoom throws when user already in a room", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx: any) => {
      const roomId = await ctx.db.insert("rooms", {
        name: "Existing Room",
        inviteCode: "XYZ789",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    await expect(
      client.mutation(api.rooms.createRoom, { name: "Second Room" }),
    ).rejects.toThrow("Already in a room");
  });

  test("getPendingJoinRequest returns null when unauthenticated", async ({
    testClient,
  }) => {
    const result = await testClient.query(
      api.rooms.getPendingJoinRequest,
      {},
    );
    expect(result).toBeNull();
  });

  test("cancelJoinRequest throws when unauthenticated", async ({
    testClient,
  }) => {
    await expect(
      testClient.mutation(api.rooms.cancelJoinRequest, {}),
    ).rejects.toThrow("Not authenticated");
  });

  test("cancelJoinRequest throws when no pending request", async ({
    client,
  }) => {
    await expect(
      client.mutation(api.rooms.cancelJoinRequest, {}),
    ).rejects.toThrow("No pending request");
  });

  test("requestJoinRoom throws when unauthenticated", async ({
    testClient,
  }) => {
    await expect(
      testClient.mutation(api.rooms.requestJoinRoom, {
        inviteCode: "ABC123",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  test("requestJoinRoom throws with invalid invite code", async ({
    client,
  }) => {
    await expect(
      client.mutation(api.rooms.requestJoinRoom, { inviteCode: "ZZZZZ1" }),
    ).rejects.toThrow("Invalid invite code");
  });

  test("requestJoinRoom throws when user already in a room", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx: any) => {
      const roomId = await ctx.db.insert("rooms", {
        name: "Existing Room",
        inviteCode: "XYZ789",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    await expect(
      client.mutation(api.rooms.requestJoinRoom, { inviteCode: "XYZ789" }),
    ).rejects.toThrow("Already in a room");
  });

  test("requestJoinRoom throws when user has pending request", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx: any) => {
      const otherUserId = await ctx.db.insert("users", {
        displayName: "Admin",
      });
      const roomId = await ctx.db.insert("rooms", {
        name: "Room A",
        inviteCode: "AAA111",
        createdBy: otherUserId,
      });
      await ctx.db.insert("joinRequests", {
        roomId,
        userId,
        status: "pending",

      });
      await ctx.db.insert("rooms", {
        name: "Room B",
        inviteCode: "BBB222",
        createdBy: otherUserId,
      });
    });

    await expect(
      client.mutation(api.rooms.requestJoinRoom, { inviteCode: "BBB222" }),
    ).rejects.toThrow("Already have a pending request");
  });
});

describe("getRoomMembers", () => {
  test("returns empty array when unauthenticated", async ({ testClient }) => {
    const members = await testClient.query(api.rooms.getRoomMembers, {});
    expect(members).toEqual([]);
  });

  test("returns empty array when user has no room", async ({ client }) => {
    const members = await client.query(api.rooms.getRoomMembers, {});
    expect(members).toEqual([]);
  });

  test("returns only current room's members, not other rooms", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx: any) => {
      // Alice (the test user) in Flat 42
      await ctx.db.patch(userId, { displayName: "Alice" });
      const flat42 = await ctx.db.insert("rooms", {
        name: "Flat 42",
        inviteCode: "FLAT42",
        createdBy: userId,
      });
      await ctx.db.insert("roomMembers", {
        roomId: flat42,
        userId,
        role: "admin",
        joinedAt: Date.now(),
      });

      // Bob in Flat 42
      const bobId = await ctx.db.insert("users", { displayName: "Bob" });
      await ctx.db.insert("roomMembers", {
        roomId: flat42,
        userId: bobId,
        role: "member",
        joinedAt: Date.now(),
      });

      // Charlie and Dave in Villa 7
      const charlieId = await ctx.db.insert("users", {
        displayName: "Charlie",
      });
      const daveId = await ctx.db.insert("users", { displayName: "Dave" });
      const villa7 = await ctx.db.insert("rooms", {
        name: "Villa 7",
        inviteCode: "VILLA7",
        createdBy: charlieId,
      });
      await ctx.db.insert("roomMembers", {
        roomId: villa7,
        userId: charlieId,
        role: "admin",
        joinedAt: Date.now(),
      });
      await ctx.db.insert("roomMembers", {
        roomId: villa7,
        userId: daveId,
        role: "member",
        joinedAt: Date.now(),
      });
    });

    const members = await client.query(api.rooms.getRoomMembers, {});
    expect(members).toHaveLength(2);
    const names = members.map((m: any) => m.displayName).sort();
    expect(names).toEqual(["Alice", "Bob"]);
  });
});

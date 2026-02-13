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

  test("joinRoom throws when unauthenticated", async ({
    testClient,
  }) => {
    await expect(
      testClient.mutation(api.rooms.joinRoom, {
        inviteCode: "ABC123",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  test("joinRoom throws with invalid invite code", async ({
    client,
  }) => {
    await expect(
      client.mutation(api.rooms.joinRoom, { inviteCode: "ZZZZZ1" }),
    ).rejects.toThrow("Invalid invite code");
  });

  test("joinRoom throws when user already in a room", async ({
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
      client.mutation(api.rooms.joinRoom, { inviteCode: "XYZ789" }),
    ).rejects.toThrow("Already in a room");
  });

});

describe("joinRoom", () => {
  test("joinRoom adds user as member directly", async ({
    client,
    createUser,
  }) => {
    const admin = await createUser();
    await admin.mutation(api.users.setDisplayName, { displayName: "Admin" });
    await admin.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await admin.query(api.rooms.getCurrentRoom, {});

    const result = await client.mutation(api.rooms.joinRoom, {
      inviteCode: room!.inviteCode,
    });
    expect(result.roomName).toBe("Flat 42");

    const myRoom = await client.query(api.rooms.getCurrentRoom, {});
    expect(myRoom).not.toBeNull();
    expect(myRoom!.name).toBe("Flat 42");
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

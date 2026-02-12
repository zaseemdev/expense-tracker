import { describe, expect } from "vitest";
import { test } from "../src/test/convex.setup";
import { api } from "./_generated/api";

describe("Backend guards: users", () => {
  test("getDisplayName returns null when unauthenticated", async ({
    testClient,
  }) => {
    const result = await testClient.query(api.users.getDisplayName, {});
    expect(result).toBeNull();
  });

  test("getCurrentUserId returns authenticated user's ID", async ({
    client,
    userId,
  }) => {
    const result = await client.query(api.users.getCurrentUserId, {});
    expect(result).toEqual(userId);
  });

  test("setDisplayName throws when unauthenticated", async ({
    testClient,
  }) => {
    await expect(
      testClient.mutation(api.users.setDisplayName, {
        displayName: "Jaseem",
      }),
    ).rejects.toThrow("Not authenticated");
  });
});

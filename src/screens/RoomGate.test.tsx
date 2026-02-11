import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { AuthenticatedRouter } from "../App";

beforeEach(cleanup);

describe("ROOM-1: Create Room", () => {
  test("user without a room sees room choice screen", async ({
    client,
    userId,
    testClient,
  }) => {
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /create a room/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join a room/i }),
    ).toBeInTheDocument();
  });

  test("clicking 'Create a Room' shows the create room form with disabled button", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create a room/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /create a room/i }));

    expect(screen.getByLabelText("Room Name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create room/i }),
    ).toBeDisabled();
  });

  test("back button returns to room choice screen", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create a room/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /create a room/i }));
    expect(screen.getByLabelText("Room Name")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByLabelText("Room Name")).not.toBeInTheDocument();
  });

  test("submitting create room form creates room with admin role", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create a room/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /create a room/i }));
    await user.type(screen.getByLabelText("Room Name"), "Apartment 4B");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    // Wait for mutation to complete, then verify database state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let room: any = null;
    await waitFor(async () => {
      room = await client.query(api.rooms.getCurrentRoom, {});
      expect(room).not.toBeNull();
    });
    expect(room.name).toBe("Apartment 4B");
    expect(room.inviteCode).toMatch(/^[A-Za-z0-9]{6}$/);

    await testClient.run(async (ctx: any) => {
      const membership = await ctx.db
        .query("roomMembers")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .first();
      expect(membership).not.toBeNull();
      expect(membership!.role).toBe("admin");
    });
  });
});

describe("ROOM-2: Join Room", () => {
  test("clicking 'Join a Room' shows join form with disabled submit button", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /join a room/i }),
      ).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /join a room/i }));

    expect(screen.getByText("Join a Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Invite Code")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request to join/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /back/i }),
    ).toBeInTheDocument();
  });

  test("submitting valid invite code creates pending request and shows pending screen", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    // Create a room owned by another user
    let otherUserId: any;
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Joiner" });
      otherUserId = await ctx.db.insert("users", { displayName: "Admin" });
      const roomId = await ctx.db.insert("rooms", {
        name: "Apartment 4B",
        inviteCode: "ABC123",
        createdBy: otherUserId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: otherUserId,
        role: "admin",
        joinedAt: Date.now(),
      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /join a room/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /join a room/i }));
    await user.type(screen.getByLabelText("Invite Code"), "ABC123");
    await user.click(
      screen.getByRole("button", { name: /request to join/i }),
    );

    // Verify pending screen shows
    await waitFor(() => {
      expect(
        screen.getByText(
          "Your request to join Apartment 4B is pending approval",
        ),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("The room admin will review your request"),
    ).toBeInTheDocument();

    // Verify database state
    await testClient.run(async (ctx: any) => {
      const joinRequest = await ctx.db
        .query("joinRequests")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .first();
      expect(joinRequest).not.toBeNull();
      expect(joinRequest!.status).toBe("pending");
    });
  });

  test("cancel request deletes join request and returns to room choice", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    // Set up a pending join request
    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Joiner" });
      const otherUserId = await ctx.db.insert("users", {
        displayName: "Admin",
      });
      const roomId = await ctx.db.insert("rooms", {
        name: "Apartment 4B",
        inviteCode: "ABC123",
        createdBy: otherUserId,
      });
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: otherUserId,
        role: "admin",
        joinedAt: Date.now(),
      });
      await ctx.db.insert("joinRequests", {
        roomId,
        userId,
        status: "pending",

      });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    // Should auto-route to pending screen
    await waitFor(() => {
      expect(
        screen.getByText(
          "Your request to join Apartment 4B is pending approval",
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /cancel request/i }),
    );

    // Should return to room choice screen
    await waitFor(() => {
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    // Verify join request deleted from database
    await testClient.run(async (ctx: any) => {
      const joinRequest = await ctx.db
        .query("joinRequests")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .first();
      expect(joinRequest).toBeNull();
    });
  });

  test("back button on join form returns to room choice screen", async ({
    client,
    userId,
    testClient,
  }) => {
    const user = userEvent.setup();

    await testClient.run(async (ctx) => {
      await ctx.db.patch(userId, { displayName: "Jaseem" });
    });

    renderWithConvex(<AuthenticatedRouter onSignOut={() => {}} />, client);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /join a room/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /join a room/i }));
    expect(screen.getByLabelText("Invite Code")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByLabelText("Invite Code")).not.toBeInTheDocument();
  });
});

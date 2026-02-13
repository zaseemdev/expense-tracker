import { cleanup, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { HomeScreen } from "./HomeScreen";

beforeEach(cleanup);

describe("HomeScreen", () => {
  test("shows No expenses yet when no expenses exist", async ({ client }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    renderWithConvex(
      <HomeScreen
        roomName={room!.name}
        inviteCode={room!.inviteCode}
        onSignOut={() => {}}
        onAddExpense={() => {}}
      />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByText("Flat 42 Expenses")).toBeInTheDocument();
    });
    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
  });

  test("shows expense list with description, amount, payer name", async ({
    client,
    userId,
  }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Alice",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    await client.mutation(api.expenses.createExpense, {
      amount: 1200,
      date: "2026-02-12",
      description: "Electricity bill",
      splits: [{ userId, amount: 1200 }],
    });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    renderWithConvex(
      <HomeScreen
        roomName={room!.name}
        inviteCode={room!.inviteCode}
        onSignOut={() => {}}
        onAddExpense={() => {}}
      />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByText("Electricity bill")).toBeInTheDocument();
    });
    expect(screen.getByText("₹1,200")).toBeInTheDocument();
    expect(screen.getByText(/Alice paid/)).toBeInTheDocument();
  });

  test("shows Your share when current user is in the split", async ({
    client,
    userId,
  }) => {
    await client.mutation(api.users.setDisplayName, {
      displayName: "Alice",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    await client.mutation(api.expenses.createExpense, {
      amount: 300,
      date: "2026-02-12",
      description: "Groceries",
      splits: [{ userId, amount: 150 }],
    });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    renderWithConvex(
      <HomeScreen
        roomName={room!.name}
        inviteCode={room!.inviteCode}
        onSignOut={() => {}}
        onAddExpense={() => {}}
      />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });
    expect(screen.getByText(/Your share: ₹150/)).toBeInTheDocument();
  });
});

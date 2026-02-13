import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect } from "vitest";
import { test, renderWithConvex } from "../test/convex.setup";
import { api } from "../../convex/_generated/api";
import { AddExpenseForm } from "./AddExpenseForm";

beforeEach(cleanup);

describe("AddExpenseForm", () => {
  test("Save button disabled when fields empty, enabled when filled", async ({
    client,
  }) => {
    const user = userEvent.setup();
    await client.mutation(api.users.setDisplayName, {
      displayName: "Test User",
    });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });

    renderWithConvex(
      <AddExpenseForm onClose={() => {}} onSave={() => {}} />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    const dateInput = screen.getByLabelText("Date");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-02-12");
    await user.type(screen.getByLabelText("Amount"), "450");
    await user.type(screen.getByLabelText("Description"), "Groceries");

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("shows split-with checkboxes for all room members", async ({
    client,
    createUser,
  }) => {
    const user = userEvent.setup();
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });

    const charlie = await createUser();
    await charlie.mutation(api.users.setDisplayName, {
      displayName: "Charlie",
    });
    await charlie.mutation(api.rooms.joinRoom, {
      inviteCode: room!.inviteCode,
    });

    renderWithConvex(
      <AddExpenseForm onClose={() => {}} onSave={() => {}} />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Amount"), "450");

    expect(screen.getByText("Split with")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());

    expect(screen.getByText("You")).toBeInTheDocument();

    const amounts = screen.getAllByText("₹150.00");
    expect(amounts).toHaveLength(3);
  });

  test("Save button disabled when all members unchecked", async ({
    client,
    createUser,
  }) => {
    const user = userEvent.setup();
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });

    renderWithConvex(
      <AddExpenseForm onClose={() => {}} onSave={() => {}} />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Amount"), "300");
    await user.type(screen.getByLabelText("Description"), "Groceries");

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();

    const checkboxes = screen.getAllByRole("checkbox");
    for (const cb of checkboxes) {
      await user.click(cb);
    }

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    await user.click(checkboxes[0]);
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  test("toggling members updates inline split amounts", async ({
    client,
    createUser,
  }) => {
    const user = userEvent.setup();
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });

    const charlie = await createUser();
    await charlie.mutation(api.users.setDisplayName, {
      displayName: "Charlie",
    });
    await charlie.mutation(api.rooms.joinRoom, {
      inviteCode: room!.inviteCode,
    });

    renderWithConvex(
      <AddExpenseForm onClose={() => {}} onSave={() => {}} />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Amount"), "450");

    expect(screen.getAllByText("₹150.00")).toHaveLength(3);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    expect(screen.queryByText("₹150.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹225.00")).toHaveLength(2);

    await user.click(checkboxes[0]);
    expect(screen.queryByText("₹225.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹450.00")).toHaveLength(1);

    await user.click(checkboxes[1]);
    expect(screen.queryByText("₹450.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("₹225.00")).toHaveLength(2);
  });

  test("Select All / Unselect All toggles all members", async ({
    client,
    createUser,
  }) => {
    const user = userEvent.setup();
    await client.mutation(api.users.setDisplayName, { displayName: "Alice" });
    await client.mutation(api.rooms.createRoom, { name: "Flat 42" });
    const room = await client.query(api.rooms.getCurrentRoom, {});

    const bob = await createUser();
    await bob.mutation(api.users.setDisplayName, { displayName: "Bob" });
    await bob.mutation(api.rooms.joinRoom, { inviteCode: room!.inviteCode });

    const charlie = await createUser();
    await charlie.mutation(api.users.setDisplayName, {
      displayName: "Charlie",
    });
    await charlie.mutation(api.rooms.joinRoom, {
      inviteCode: room!.inviteCode,
    });

    renderWithConvex(
      <AddExpenseForm onClose={() => {}} onSave={() => {}} />,
      client,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Amount"), "300");

    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /unselect all/i }));
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    expect(
      screen.getByRole("button", { name: /select all/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /select all/i }));
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
    expect(screen.getAllByText("₹100.00")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();

    await user.click(checkboxes[1]);
    expect(
      screen.getByRole("button", { name: /select all/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /select all/i }));
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
    expect(
      screen.getByRole("button", { name: /unselect all/i }),
    ).toBeInTheDocument();
  });
});

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function RoomGate() {
  const [view, setView] = useState<"choice" | "create" | "join">("choice");

  if (view === "create") return <CreateRoomForm onBack={() => setView("choice")} />;
  if (view === "join") return <JoinRoomForm onBack={() => setView("choice")} />;
  return (
    <RoomChoiceScreen
      onCreateRoom={() => setView("create")}
      onJoinRoom={() => setView("join")}
    />
  );
}

function RoomChoiceScreen({
  onCreateRoom,
  onJoinRoom,
}: {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl mb-2">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Get Started</h1>
        <p className="text-zinc-400 text-sm">
          Create a room or join an existing one
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={onCreateRoom}
          className="w-full bg-emerald-600 text-white font-medium rounded-lg py-3 hover:bg-emerald-500 transition-colors"
        >
          Create a Room
        </button>
        <button
          onClick={onJoinRoom}
          className="w-full bg-zinc-800 text-white font-medium rounded-lg py-3 hover:bg-zinc-700 transition-colors"
        >
          Join a Room
        </button>
      </div>
    </div>
  );
}

function JoinRoomForm({ onBack }: { onBack: () => void }) {
  const [inviteCode, setInviteCode] = useState("");

  const trimmed = inviteCode.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl mb-2">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Join a Room</h1>
        <p className="text-zinc-400 text-sm">
          Enter the invite code shared by your roommate
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label
            htmlFor="inviteCode"
            className="block text-sm text-zinc-300 mb-1"
          >
            Invite Code
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="e.g. Xk9mP2"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          disabled={trimmed.length === 0}
          className="w-full bg-emerald-600 text-white font-medium rounded-lg py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
        >
          Request to Join
        </button>

        <button
          onClick={onBack}
          className="text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function CreateRoomForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const createRoom = useMutation(api.rooms.createRoom);

  const trimmed = name.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl mb-2">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Create a Room</h1>
        <p className="text-zinc-400 text-sm">
          Your roommates can join with an invite link
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label
            htmlFor="roomName"
            className="block text-sm text-zinc-300 mb-1"
          >
            Room Name
          </label>
          <input
            id="roomName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apartment 4B"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          disabled={trimmed.length === 0}
          onClick={() => void createRoom({ name: trimmed })}
          className="w-full bg-emerald-600 text-white font-medium rounded-lg py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
        >
          Create Room
        </button>

        <button
          onClick={onBack}
          className="text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

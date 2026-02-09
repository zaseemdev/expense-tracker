import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DisplayNameForm() {
  const [name, setName] = useState("");
  const setDisplayName = useMutation(api.users.setDisplayName);

  const trimmed = name.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl mb-2">
          👤
        </div>
        <h1 className="text-2xl font-bold">What should we call you?</h1>
        <p className="text-zinc-400 text-sm">
          This name will be visible to your roommates
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm text-zinc-300 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jaseem"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          disabled={trimmed.length === 0}
          onClick={() => void setDisplayName({ displayName: trimmed })}
          className="w-full bg-emerald-600 text-white font-medium rounded-lg py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
        >
          Continue
        </button>

        <p className="text-zinc-500 text-xs text-center">
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}

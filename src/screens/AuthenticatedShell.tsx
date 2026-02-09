export function AuthenticatedShell({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold">SplitEase</h1>
        <button
          onClick={onSignOut}
          className="text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>
      <main className="p-4">
        <p className="text-zinc-400">Welcome to SplitEase</p>
      </main>
    </div>
  );
}

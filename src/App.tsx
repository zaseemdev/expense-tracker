import {
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function App() {
  return (
    <>
      <Authenticated>
        <AuthenticatedShell />
      </Authenticated>
      <Unauthenticated>
        <SignInScreen />
      </Unauthenticated>
    </>
  );
}

function SignInScreen() {
  const { signIn } = useAuthActions();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-6">
      <div className="flex flex-col items-center gap-2 mb-10">
        <h1 className="text-3xl font-bold">SplitEase</h1>
        <p className="text-zinc-400 text-sm">Split expenses with roommates</p>
      </div>

      <button
        onClick={() => void signIn("google")}
        className="flex items-center gap-3 bg-white text-zinc-900 font-medium rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-shadow"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mt-6 w-64">
        <div className="flex-1 h-px bg-zinc-700" />
        <span className="text-zinc-500 text-xs">secure sign in</span>
        <div className="flex-1 h-px bg-zinc-700" />
      </div>

      <p className="absolute bottom-8 text-zinc-600 text-xs text-center px-8">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthenticatedShell() {
  const { signOut } = useAuthActions();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold">SplitEase</h1>
        <SignOutButton onSignOut={() => void signOut()} />
      </header>
      <main className="p-4">
        <p className="text-zinc-400">Welcome to SplitEase</p>
      </main>
    </div>
  );
}

function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  return (
    <button
      onClick={onSignOut}
      className="text-zinc-400 text-sm hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}

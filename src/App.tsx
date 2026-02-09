import {
  Authenticated,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { SignInScreen } from "./screens/SignInScreen";
import { DisplayNameForm } from "./screens/DisplayNameForm";
import { RoomGate } from "./screens/RoomGate";
import { AuthenticatedShell } from "./screens/AuthenticatedShell";

/* v8 ignore start -- auth wiring: tested via sub-components */
export default function App() {
  const { signIn, signOut } = useAuthActions();

  return (
    <>
      <Authenticated>
        <AuthenticatedRouter onSignOut={() => void signOut()} />
      </Authenticated>
      <Unauthenticated>
        <SignInScreen onSignIn={() => void signIn("google")} />
      </Unauthenticated>
    </>
  );
}
/* v8 ignore stop */

export function AuthenticatedRouter({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const displayName = useQuery(api.users.getDisplayName);

  if (displayName === undefined) return null;
  if (displayName === null) return <DisplayNameForm />;
  return <RoomRouter onSignOut={onSignOut} />;
}

function RoomRouter({ onSignOut }: { onSignOut: () => void }) {
  const currentRoom = useQuery(api.rooms.getCurrentRoom);

  /* v8 ignore start */
  if (currentRoom === undefined) return null;
  /* v8 ignore stop */
  if (currentRoom === null) return <RoomGate />;
  return <AuthenticatedShell onSignOut={onSignOut} />;
}

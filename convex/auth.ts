import { convexAuth } from "@convex-dev/auth/server";
import Google from "@convex-dev/auth/providers/Google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});

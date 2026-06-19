"use client";

import { useUser as useClerkUser, useClerk } from '@clerk/nextjs';

export function useUser() {
  const { user, isLoaded } = useClerkUser();
  const { signOut } = useClerk();

  return {
    user: user ? {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.fullName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || "User",
      sub: user.id,
      picture: user.imageUrl || "/vercel.svg",
    } : null,
    isSignedIn: !!user,
    isLoading: !isLoaded,
    error: null,
    signOut,
  };
}

export const loginHref = "/sign-in";
export const logoutHref = "/sign-in";

export default useUser;

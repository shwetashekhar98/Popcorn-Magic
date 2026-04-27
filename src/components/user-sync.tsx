"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const getOrCreate = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    getOrCreate({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? "Anonymous",
      imageUrl: user.imageUrl ?? "",
    }).catch(console.error);
  }, [isLoaded, isSignedIn, user, getOrCreate]);

  return null;
}

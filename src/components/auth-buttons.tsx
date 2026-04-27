"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton, SignUpButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <div className="w-16 h-8" />;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">Sign up</Button>
      </SignUpButton>
    </div>
  );
}

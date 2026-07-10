"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// The homepage is a front door, not a destination — a signed-in visitor
// should never be looking at the marketing hero, whether they just
// finished signing in here or landed on "/" some other way (bookmark, back
// button, a sign-in flow elsewhere that didn't specify `next`).
export function HomeAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/work");
    }
  }, [loading, user, router]);

  return null;
}

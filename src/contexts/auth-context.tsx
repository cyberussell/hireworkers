"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "facebook";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWith: (provider: OAuthProvider, next?: string) => Promise<string | null>;
  signUpWithEmail: (
    email: string,
    password: string,
    next?: string
  ) => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWith(provider: OAuthProvider, next = "/") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // Without this, Google silently re-authenticates with whichever
        // Google account still has an active browser session — after
        // signing out of HireWorkers, clicking "Continue with Google"
        // again can look like sign-out "didn't work" because it skips
        // straight back in with no account picker.
        queryParams:
          provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });
    return error?.message ?? null;
  }

  async function signUpWithEmail(email: string, password: string, next = "/") {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    return error?.message ?? null;
  }

  async function signInWithEmail(email: string, password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }

  async function signOut() {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Still force the navigation below even if the Supabase call itself
      // fails (network blip, etc.) — getting the user unstuck matters more
      // here than surfacing this error.
      console.error("sign out request failed", error);
    }
    // A full navigation (not just the reactive context update) guarantees
    // every cached Server Component render and client route is thrown away
    // — otherwise a page fetched while signed in can keep showing
    // signed-in content until its next unrelated re-render. `replace` (not
    // `href`) so this doesn't leave a stale signed-in entry in back-history.
    window.location.replace("/");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWith,
        signUpWithEmail,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

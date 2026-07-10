"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { GoogleIcon } from "@/components/auth/google-icon";

type Mode = "sign_in" | "sign_up";

export function SignInDialog({
  open,
  onOpenChange,
  next = "/",
  title = "Sign in to continue",
  description = "Use your Google account, or sign in with email.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next?: string;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const { signInWith, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function close(nextOpen: boolean) {
    if (!nextOpen) {
      setError(null);
      setConfirmationSent(false);
      setSubmitting(false);
      setEmail("");
      setPassword("");
      setMode("sign_in");
    }
    onOpenChange(nextOpen);
  }

  async function handleGoogle() {
    setError(null);
    const message = await signInWith("google", next);
    if (message) setError(message);
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "sign_up") {
      const message = await signUpWithEmail(email, password, next);
      setSubmitting(false);
      if (message) {
        setError(message);
        return;
      }
      setConfirmationSent(true);
      return;
    }

    const message = await signInWithEmail(email, password);
    setSubmitting(false);
    if (message) {
      setError(
        message.toLowerCase().includes("confirm")
          ? "Please confirm your email first — check your inbox for the link."
          : message
      );
      return;
    }
    close(false);
    router.push(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button variant="outline" onClick={() => void handleGoogle()}>
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          {confirmationSent ? (
            <p className="text-sm text-muted-foreground">
              Check <span className="font-medium text-foreground">{email}</span>{" "}
              for a confirmation link, then come back and sign in.
            </p>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "sign_up" ? "new-password" : "current-password"
                }
              />
              <Button type="submit" variant="outline" disabled={submitting}>
                {submitting
                  ? "Please wait…"
                  : mode === "sign_up"
                    ? "Create account"
                    : "Sign in with email"}
              </Button>
            </form>
          )}

          {!confirmationSent && (
            <button
              type="button"
              onClick={() => {
                setMode((current) =>
                  current === "sign_in" ? "sign_up" : "sign_in"
                );
                setError(null);
              }}
              className="text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {mode === "sign_in"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

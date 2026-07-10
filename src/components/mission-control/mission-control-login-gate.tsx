"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function MissionControlLoginGate() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("checking");
    const response = await fetch("/api/mission-control/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-20 text-center">
      <Lock className="size-6 text-muted-foreground" />
      <h1 className="text-lg font-semibold">Mission Control</h1>
      <p className="text-sm text-muted-foreground">
        Sign in with the admin login to continue.
      </p>
      <form onSubmit={submit} className="flex w-full flex-col gap-3">
        <input
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setStatus("idle");
          }}
          autoFocus
          autoComplete="username"
          placeholder="Username"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base"
          aria-label="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setStatus("idle");
          }}
          autoComplete="current-password"
          placeholder="Password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base"
          aria-label="Password"
        />
        <Button
          type="submit"
          disabled={status === "checking" || !username || !password}
        >
          {status === "checking" ? "Checking…" : "Enter"}
        </Button>
        {status === "error" && (
          <p className="text-sm text-danger">Incorrect username or password.</p>
        )}
      </form>
    </div>
  );
}

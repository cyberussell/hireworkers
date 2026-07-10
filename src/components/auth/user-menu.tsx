"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { useAuth } from "@/contexts/auth-context";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  if (loading) {
    return <div className="size-8" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => setSignInOpen(true)}>
          Sign in
        </Button>
        <SignInDialog
          open={signInOpen}
          onOpenChange={setSignInOpen}
          next="/work"
        />
      </>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Account";
  const firstName = name.trim().split(/\s+/)[0];
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 hover:bg-muted"
          />
        }
      >
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback>
            {initialsFor(name) || <UserIcon className="size-4" />}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">
          {firstName}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/work/dashboard" />}>
            <LayoutDashboard className="size-4" />
            My Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

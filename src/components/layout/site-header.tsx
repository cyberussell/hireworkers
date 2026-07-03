import Link from "next/link";
import { LogoWordmark } from "@/components/shared/logo-wordmark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/talent", label: "Find Talent" },
  { href: "/work", label: "Find Work" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <LogoWordmark />
        <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="text-base font-bold"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/hire" />}
          >
            Start Hiring
          </Button>
        </div>
      </div>
    </header>
  );
}

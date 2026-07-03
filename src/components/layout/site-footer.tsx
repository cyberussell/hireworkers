import Link from "next/link";
import { LogoWordmark } from "@/components/shared/logo-wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <LogoWordmark className="text-base" />
        <nav className="flex items-center gap-4" aria-label="Legal">
          <Link href="/help" className="hover:text-foreground">
            How To&apos;s
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms and Conditions
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </nav>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} HireWorkers.work Manpower Services. An AI
          Hiring Assistant.
        </p>
      </div>
    </footer>
  );
}

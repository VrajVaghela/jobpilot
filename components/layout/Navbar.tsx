"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import logo from "@/public/logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="JobPilot" className="h-8 w-auto" priority />
        </Link>

        <nav className="hidden h-full items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full items-center text-sm font-medium transition-colors hover:text-accent ${
                  isActive ? "text-accent" : "text-text-dark"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

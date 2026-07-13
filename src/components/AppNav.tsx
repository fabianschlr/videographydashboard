"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [{ href: "/today", label: "Today" }, { href: "/review", label: "Review" }, { href: "/progress", label: "Progress" }, { href: "/settings", label: "Settings" }];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#2a2d33] bg-[#101113]/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-44 md:border-r md:border-t-0 md:px-4 md:pt-8">
      <div className="mx-auto flex max-w-md justify-around md:flex-col md:gap-2">
        {items.map((item) => <Link key={item.href} href={item.href} className={`focus-ring rounded-lg px-3 py-2 text-center text-xs transition-colors duration-150 md:text-left md:text-sm ${pathname === item.href ? "accent-bg font-medium" : "muted hover:text-white"}`}>{item.label}</Link>)}
      </div>
    </nav>
  );
}

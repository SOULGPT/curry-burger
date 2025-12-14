"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, UserPlus, Crown, Settings } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Live Bracket",
      mobileName: "Bracket",
      href: "/",
      icon: Trophy,
    },
    {
      name: "Register",
      mobileName: "Join",
      href: "/register",
      icon: UserPlus,
    },
    {
      name: "Champions",
      mobileName: "Hall of Fame",
      href: "/champions",
      icon: Crown,
    },
    {
      name: "Admin",
      mobileName: "Admin",
      href: "/admin",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur-lg pb-safe md:top-0 md:bottom-auto md:border-b md:border-t-0 md:pb-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo/Title for Desktop */}
        <div className="hidden text-xl font-bold tracking-tight text-white md:block">
          <span className="text-amber-500">Curry & BurgerNow</span> FC 26
        </div>

        {/* Navigation Items */}
        <div className="flex w-full items-center justify-around md:w-auto md:justify-end md:space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center justify-center space-y-1 md:flex-row md:space-x-2 md:space-y-0 ${
                  isActive
                    ? "text-amber-500"
                    : "text-zinc-400 hover:text-amber-400"
                }`}
              >
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "bg-transparent group-hover:bg-zinc-800"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-500 md:hidden" />
                  )}
                </div>
                
                {/* Mobile Label */}
                <span
                  className={`text-[10px] font-medium transition-colors md:hidden ${
                    isActive ? "text-amber-500" : "text-zinc-500"
                  }`}
                >
                  {item.mobileName}
                </span>

                {/* Desktop Label */}
                <span className="hidden text-sm font-medium md:block">
                  {item.name}
                </span>
                
                {/* Desktop Active Indicator */}
                {isActive && (
                  <span className="absolute -bottom-[21px] hidden h-0.5 w-full bg-amber-500 md:block" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

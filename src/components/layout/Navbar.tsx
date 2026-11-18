"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AuthControls } from "./AuthControls";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4 border-b">
          <Logo />

          <nav aria-label={t("nav.mainNav")} className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-5 text-sm transition-colors hover:text-foreground",
                    active
                      ? "font-medium text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-terracotta"
                      : "text-muted-foreground"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageToggle />
            <AuthControls />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle />
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon-lg" aria-label={t("nav.openMenu")} />}
              >
                <Menu aria-hidden />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="px-4 pt-4">
                  <Logo />
                </SheetTitle>
                <nav aria-label={t("nav.mobileNav")} className="mt-2 flex flex-col px-3">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-base hover:bg-muted",
                          active ? "font-medium text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <span className={cn(active && "border-b-2 border-terracotta pb-0.5")}>
                          {t(link.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto p-4">
                  <AuthControls stacked />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

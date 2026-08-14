"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const select = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => select(l.code)}
          aria-pressed={l.code === locale}
          className={cn(
            l.code === locale ? "font-semibold text-foreground" : "text-muted-foreground",
            "hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

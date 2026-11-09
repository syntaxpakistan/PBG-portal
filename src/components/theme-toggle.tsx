"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle({ onDark }: { onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "grid size-9 place-items-center rounded-full border transition-colors",
        onDark
          ? "border-white/20 text-white/80 hover:border-white/50 hover:text-white"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
      )}
    >
      {mounted ? (dark ? <Sun className="size-4" /> : <Moon className="size-4" />) : <span className="size-4" />}
    </button>
  );
}

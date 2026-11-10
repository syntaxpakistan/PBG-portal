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
        "grid size-9 place-items-center rounded-lg transition-colors",
        onDark
          ? "text-[#a2c1d7] hover:bg-white/10 hover:text-white"
          : "text-muted hover:bg-line/50 hover:text-ink"
      )}
    >
      {mounted ? (dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />) : <span className="size-4.5" />}
    </button>
  );
}

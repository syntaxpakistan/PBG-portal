import { Dna } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-yellow text-navy">
        <Dna className="size-4.5" strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[13.5px] font-medium tracking-tight text-white">
          Biotech Gateway
        </span>
        <span className="block text-[8.5px] font-medium uppercase tracking-[0.22em] text-white/50">
          Pakistan
        </span>
      </span>
    </span>
  );
}

export function PlatformMarkText({ className }: { className?: string }) {
  return (
    <span className={cn("leading-tight", className)}>
      <span className="block font-display text-[10.5px] font-medium tracking-tight text-white">
        Biotech Gateway
      </span>
      <span className="block text-[7px] font-medium uppercase tracking-[0.2em] text-white/50">
        Pakistan
      </span>
    </span>
  );
}

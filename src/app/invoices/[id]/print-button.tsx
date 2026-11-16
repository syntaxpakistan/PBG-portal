"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary inline-flex items-center gap-1.5 !py-2 text-[12.5px]"
    >
      <Printer className="size-3.5" /> Print / PDF
    </button>
  );
}

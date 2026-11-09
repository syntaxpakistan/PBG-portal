"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-3 disabled:opacity-60">
      {pending ? <><Loader2 className="size-4 animate-spin" /> Routing to providers…</> : "Route to verified providers"}
    </button>
  );
}

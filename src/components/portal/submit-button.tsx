"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Submit button for server-action <form action={...}> — disables itself while the action runs so double-clicks can't duplicate submissions. */
export function SubmitButton({
  children,
  className = "btn-primary !py-2 text-[12px]",
  formAction,
  spinner = true,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  spinner?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "formAction" | "disabled" | "children" | "className">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" formAction={formAction} disabled={pending} className={className} aria-busy={pending} {...rest}>
      {pending && spinner ? <Loader2 className="size-3.5 animate-spin" /> : children}
    </button>
  );
}

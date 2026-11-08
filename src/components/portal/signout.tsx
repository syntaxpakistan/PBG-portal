"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-[#9fb9cd] transition-colors hover:bg-white/5 hover:text-white"
    >
      <LogOut className="size-3.5" /> Sign out
    </button>
  );
}

"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" className="gap-2" type="submit">
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}

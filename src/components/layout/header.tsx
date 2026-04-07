import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-card px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto">
        <LogoutButton />
      </div>
    </header>
  );
}

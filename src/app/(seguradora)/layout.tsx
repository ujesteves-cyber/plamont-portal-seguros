import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default function SeguradoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="seguradora" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

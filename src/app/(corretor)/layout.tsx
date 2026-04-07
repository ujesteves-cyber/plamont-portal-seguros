import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default async function CorretorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (!user.isApproved) redirect("/aguardando-aprovacao");
  if (user.role !== "corretor") redirect("/dashboard");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="corretor" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

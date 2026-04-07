import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default async function InternoLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (!user.isApproved) redirect("/aguardando-aprovacao");
  if (user.role === "corretor") redirect("/c/painel");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role={user.role as "diretor" | "analista" | "corretor"} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

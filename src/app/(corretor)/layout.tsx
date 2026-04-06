import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

export default async function CorretorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const [user] = await db
      .select({ isApproved: users.isApproved, role: users.role })
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user || !user.isApproved) {
      redirect("/aguardando-aprovacao");
    }

    if (user.role !== "corretor") {
      redirect("/dashboard");
    }
  } catch {
    redirect("/aguardando-aprovacao");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="corretor" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

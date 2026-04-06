import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

async function getUserData(clerkId: string) {
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const [user] = await db
      .select({ role: users.role, isApproved: users.isApproved })
      .from(users)
      .where(eq(users.clerkId, clerkId));
    return user ?? null;
  } catch {
    return null;
  }
}

export default async function InternoLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserData(userId);

  if (!user || !user.isApproved) {
    redirect("/aguardando-aprovacao");
  }

  if (user.role === "corretor") {
    redirect("/c/painel");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role={user.role as "diretor" | "analista" | "corretor"} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

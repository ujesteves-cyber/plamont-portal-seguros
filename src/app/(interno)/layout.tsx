import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";

async function getUserRole(clerkId: string): Promise<"diretor" | "analista" | "corretor"> {
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.clerkId, clerkId));
    return (user?.role as "diretor" | "analista" | "corretor") ?? "corretor";
  } catch {
    return "diretor";
  }
}

export default async function InternoLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole(userId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role={role} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

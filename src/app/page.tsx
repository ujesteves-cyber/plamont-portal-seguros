import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    let [user] = await db
      .select({ role: users.role, isApproved: users.isApproved })
      .from(users)
      .where(eq(users.clerkId, userId));

    // Auto-create user record if webhook hasn't fired yet
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

      await db.insert(users).values({
        clerkId: userId,
        email,
        name: name || null,
        role: "corretor",
        isApproved: false,
      }).onConflictDoNothing();

      redirect("/aguardando-aprovacao");
    }

    if (!user.isApproved) {
      redirect("/aguardando-aprovacao");
    }

    switch (user.role) {
      case "diretor":
      case "analista":
        redirect("/dashboard");
      case "corretor":
        redirect("/c/painel");
    }
  } catch {
    redirect("/aguardando-aprovacao");
  }
}

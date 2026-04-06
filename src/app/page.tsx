import { auth } from "@clerk/nextjs/server";
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

    const [user] = await db
      .select({ role: users.role, isApproved: users.isApproved })
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user || !user.isApproved) {
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

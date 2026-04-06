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
      .select({ role: users.role })
      .from(users)
      .where(eq(users.clerkId, userId));

    const role = user?.role ?? "seguradora";

    switch (role) {
      case "admin":
      case "corretor":
        redirect("/dashboard");
      case "seguradora":
        redirect("/s/painel");
    }
  } catch {
    // Fallback if DB is unavailable
    redirect("/dashboard");
  }
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
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
    default:
      redirect("/login");
  }
}

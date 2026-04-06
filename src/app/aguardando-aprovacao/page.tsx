import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SignOutButton } from "@clerk/nextjs";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AguardandoAprovacaoPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const [user] = await db
    .select({ isApproved: users.isApproved, role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId));

  // If user is approved, redirect to the correct area
  if (user?.isApproved) {
    switch (user.role) {
      case "diretor":
      case "analista":
        redirect("/dashboard");
      case "corretor":
        redirect("/c/painel");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center space-y-6 p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Cadastro em Análise
        </h1>
        <p className="text-muted-foreground">
          Seu cadastro foi recebido e está aguardando aprovação do administrador.
          Você receberá acesso assim que for aprovado.
        </p>
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          <p>
            Se você acredita que isso é um erro, entre em contato com o
            administrador do sistema.
          </p>
        </div>
        <SignOutButton>
          <Button variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}

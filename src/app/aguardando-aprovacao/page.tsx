import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AguardandoAprovacaoPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  if (user.isApproved) {
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
        <form action={logoutAction}>
          <Button variant="outline" className="gap-2" type="submit">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppHeader } from "@/components/layout/header";
import { UserManagementTable } from "@/components/usuarios/user-management-table";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!currentUser || currentUser.role !== "diretor") {
    redirect("/dashboard");
  }

  const allUsers = await db.select().from(users);

  const pendingUsers = allUsers.filter((u) => !u.isApproved);
  const approvedUsers = allUsers.filter((u) => u.isApproved);

  return (
    <>
      <AppHeader title="Gerenciamento de Usuários" />
      <div className="p-6 space-y-8">
        {pendingUsers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {pendingUsers.length}
              </span>
              Cadastros Pendentes
            </h2>
            <UserManagementTable users={pendingUsers} mode="pending" />
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Usuários Aprovados ({approvedUsers.length})
          </h2>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário aprovado ainda.
            </p>
          ) : (
            <UserManagementTable users={approvedUsers} mode="approved" />
          )}
        </div>
      </div>
    </>
  );
}

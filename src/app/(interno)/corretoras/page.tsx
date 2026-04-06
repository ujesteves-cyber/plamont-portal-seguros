import { AppHeader } from "@/components/layout/header";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CorretorasPage() {
  const corretoras = await db
    .select()
    .from(users)
    .where(eq(users.role, "corretor"));

  return (
    <>
      <AppHeader title="Corretoras Cadastradas" />
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {corretoras.length} corretora(s) cadastrada(s). Novas corretoras se
          cadastram via link público.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corretoras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name || "—"}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell className="font-mono">{c.cnpj || "—"}</TableCell>
                  <TableCell>{c.companyName || "—"}</TableCell>
                  <TableCell>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {corretoras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma corretora cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

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

export default async function SeguradorasPage() {
  const insurers = await db
    .select()
    .from(users)
    .where(eq(users.role, "seguradora"));

  return (
    <>
      <AppHeader title="Seguradoras Cadastradas" />
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          {insurers.length} seguradora(s) cadastrada(s). Novas seguradoras se
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
              {insurers.map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell className="font-medium">{ins.name || "—"}</TableCell>
                  <TableCell>{ins.email}</TableCell>
                  <TableCell className="font-mono">{ins.cnpj || "—"}</TableCell>
                  <TableCell>{ins.companyName || "—"}</TableCell>
                  <TableCell>
                    {ins.createdAt
                      ? new Date(ins.createdAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {insurers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma seguradora cadastrada.
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

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import { approveUser, rejectUser, updateUserRole, revokeUser } from "@/lib/actions/usuarios";

type User = {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  role: string | null;
  isApproved: boolean;
  cnpj: string | null;
  companyName: string | null;
  phone: string | null;
  createdAt: Date | null;
};

const roleLabels: Record<string, string> = {
  diretor: "Diretor",
  analista: "Analista",
  corretor: "Corretor",
};

export function UserManagementTable({
  users,
  mode,
}: {
  users: User[];
  mode: "pending" | "approved";
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});

  async function handleApprove(userId: number) {
    const role = (selectedRoles[userId] || "corretor") as "diretor" | "analista" | "corretor";
    setLoadingId(userId);
    try {
      await approveUser(userId, role);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(userId: number) {
    if (!confirm("Tem certeza que deseja rejeitar este cadastro? O usuário será removido.")) return;
    setLoadingId(userId);
    try {
      await rejectUser(userId);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRoleChange(userId: number, role: string) {
    if (mode === "approved") {
      setLoadingId(userId);
      try {
        await updateUserRole(userId, role as "diretor" | "analista" | "corretor");
      } finally {
        setLoadingId(null);
      }
    } else {
      setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
    }
  }

  async function handleRevoke(userId: number) {
    if (!confirm("Tem certeza que deseja revogar o acesso deste usuário?")) return;
    setLoadingId(userId);
    try {
      await revokeUser(userId);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Empresa / CNPJ</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name || "—"}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {u.companyName || "—"}
                  {u.cnpj && (
                    <span className="block text-xs text-muted-foreground font-mono">
                      {u.cnpj}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {mode === "pending" ? (
                  <Select
                    value={selectedRoles[u.id] || "corretor"}
                    onValueChange={(v) => v && handleRoleChange(u.id, v)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="corretor">Corretor</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={u.role || "corretor"}
                    onValueChange={(v) => v && handleRoleChange(u.id, v)}
                    disabled={loadingId === u.id}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="corretor">Corretor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("pt-BR")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                {mode === "pending" ? (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(u.id)}
                      disabled={loadingId === u.id}
                      className="gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(u.id)}
                      disabled={loadingId === u.id}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevoke(u.id)}
                    disabled={loadingId === u.id}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Ban className="h-4 w-4" />
                    Revogar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {mode === "pending"
                  ? "Nenhum cadastro pendente."
                  : "Nenhum usuário aprovado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

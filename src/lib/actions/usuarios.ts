"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";

async function requireDiretor() {
  const user = await getSessionUser();
  if (!user || !user.isApproved || user.role !== "diretor") {
    throw new Error("Acesso negado: apenas diretores");
  }
  return user;
}

export async function approveUser(userId: number, role: "diretor" | "analista" | "corretor") {
  await requireDiretor();

  await db
    .update(users)
    .set({ isApproved: true, role })
    .where(eq(users.id, userId));

  revalidatePath("/usuarios");
}

export async function rejectUser(userId: number) {
  await requireDiretor();

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/usuarios");
}

export async function updateUserRole(userId: number, role: "diretor" | "analista" | "corretor") {
  await requireDiretor();

  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));

  revalidatePath("/usuarios");
}

export async function revokeUser(userId: number) {
  await requireDiretor();

  await db
    .update(users)
    .set({ isApproved: false })
    .where(eq(users.id, userId));

  revalidatePath("/usuarios");
}

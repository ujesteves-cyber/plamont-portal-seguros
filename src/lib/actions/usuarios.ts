"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireDiretor() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");

  const [user] = await db
    .select({ id: users.id, role: users.role, isApproved: users.isApproved })
    .from(users)
    .where(and(eq(users.clerkId, userId), eq(users.isApproved, true)));

  if (!user || user.role !== "diretor") {
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

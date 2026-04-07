"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (!user) {
    return { error: "Email ou senha inválidos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Email ou senha inválidos." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isApproved: user.isApproved,
  });

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
      redirect("/");
  }
}

export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const cnpj = formData.get("cnpj") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password) {
    return { error: "Preencha os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (existing) {
    return { error: "Este email já está cadastrado." };
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
      role: "corretor",
      isApproved: false,
      companyName: companyName || null,
      cnpj: cnpj || null,
      phone: phone || null,
    })
    .returning();

  await createSession({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    isApproved: newUser.isApproved,
  });

  redirect("/aguardando-aprovacao");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  FileText,
  Building2,
  Send,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const diretorLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frota", label: "Frota", icon: Truck },
  { href: "/editais", label: "Editais", icon: FileText },
  { href: "/corretoras", label: "Corretoras", icon: Building2 },
  { href: "/usuarios", label: "Usuários", icon: Users },
];

const analistaLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frota", label: "Frota", icon: Truck },
  { href: "/editais", label: "Editais", icon: FileText },
];

const corretorLinks = [
  { href: "/c/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/c/editais", label: "Editais Abertos", icon: FileText },
  { href: "/c/propostas", label: "Minhas Propostas", icon: Send },
];

export function AppSidebar({ role }: { role: "diretor" | "analista" | "corretor" }) {
  const pathname = usePathname();

  const links = role === "diretor"
    ? diretorLinks
    : role === "analista"
      ? analistaLinks
      : corretorLinks;

  const roleLabel = role === "diretor"
    ? "Diretor"
    : role === "analista"
      ? "Analista"
      : "Corretor";

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/">
          <Image
            src="/logo-plamont.svg"
            alt="Plamont Engenharia - Portal de Seguros"
            width={180}
            height={45}
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider px-4 pt-4 pb-2 text-sidebar-foreground/50">
            {roleLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    render={<Link href={link.href} />}
                    isActive={pathname.startsWith(link.href)}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

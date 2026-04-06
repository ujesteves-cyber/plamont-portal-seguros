"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  FileText,
  Building2,
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

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frota", label: "Frota", icon: Truck },
  { href: "/editais", label: "Editais", icon: FileText },
  { href: "/seguradoras", label: "Seguradoras", icon: Building2 },
];

const corretorLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/editais", label: "Editais", icon: FileText },
  { href: "/seguradoras", label: "Seguradoras", icon: Building2 },
];

const insurerLinks = [
  { href: "/s/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/s/editais", label: "Editais Abertos", icon: FileText },
];

export function AppSidebar({ role }: { role: "admin" | "corretor" | "seguradora" }) {
  const pathname = usePathname();
  const links = role === "admin"
    ? adminLinks
    : role === "corretor"
      ? corretorLinks
      : insurerLinks;

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-plamont.png"
            alt="Plamont Engenharia"
            width={40}
            height={40}
            className="rounded"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground leading-tight">Plamont</span>
            <span className="text-xs text-sidebar-foreground/60 leading-tight">Portal de Seguros</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider px-4 pt-4 pb-2 text-sidebar-foreground/50">
            Menu
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

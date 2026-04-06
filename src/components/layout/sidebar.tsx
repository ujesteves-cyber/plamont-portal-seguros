"use client";

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
} from "@/components/ui/sidebar";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frota", label: "Frota", icon: Truck },
  { href: "/editais", label: "Editais", icon: FileText },
  { href: "/seguradoras", label: "Seguradoras", icon: Building2 },
];

const insurerLinks = [
  { href: "/s/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/s/editais", label: "Editais Abertos", icon: FileText },
];

export function AppSidebar({ role }: { role: "admin" | "corretor" | "seguradora" }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : insurerLinks;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
            Plamont Seguros
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

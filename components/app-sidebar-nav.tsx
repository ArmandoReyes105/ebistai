"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, LayoutDashboard, Settings } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-applications", label: "Postulaciones", icon: Briefcase },
  { href: "/configuration", label: "Configuración", icon: Settings },
]

const AppSidebarNav = () => {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            render={<Link href={href} />}
            isActive={pathname === href || pathname.startsWith(`${href}/`)}
            tooltip={label}
          >
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export default AppSidebarNav

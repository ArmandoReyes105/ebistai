"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, LayoutDashboard, Settings } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-applications", label: "Postulaciones", icon: Briefcase },
  { href: "/configuration", label: "Configuración", icon: Settings },
]

const AppSidebarNav = () => {
  const pathname = usePathname()

  return (
    <SidebarMenu className="gap-0.5">
      {navItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            render={<Link href={href} />}
            isActive={pathname === href || pathname.startsWith(`${href}/`)}
            tooltip={label}
            // Mockup: 44px rows, 15px text; the active item is solid ink
            // (red stays reserved for what needs attention).
            className="h-11 gap-3 px-3.5 text-[15px] text-sidebar-foreground/80 data-active:bg-foreground data-active:font-semibold data-active:text-background data-active:hover:bg-foreground data-active:hover:text-background"
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

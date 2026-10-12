import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import AppSidebarNav from "./app-sidebar-nav"

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              className="h-10 p-1 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
            >
              <div className="flex size-8 shrink-0 items-center justify-center">
                <Image src="/koi.png" alt="Ebistai logo" width={20} height={20} />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Ebistai</span>
                <span className="truncate text-xs text-muted-foreground">
                  Job tracker
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <AppSidebarNav />
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar

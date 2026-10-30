import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar"
import Link from "next/link"
import AppSidebarNav from "./app-sidebar-nav"
import TaiFigure from "./tai/tai-figure"

const AppSidebar = () => {
  return (
    // Dark mode: expanded it blends with the page background; collapsed it
    // keeps the lighter sidebar tone so the icon rail stands apart.
    <Sidebar
      collapsible="icon"
      className="dark:group-data-[state=expanded]:*:data-[slot=sidebar-inner]:bg-background"
    >
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              aria-label="Ebistai, ir al dashboard"
              className="h-10 gap-2.5 p-1 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
            >
              {/* Tai, the app's mascot, doubles as the logo. */}
              <div className="flex size-8 shrink-0 items-center justify-center">
                <TaiFigure
                  pose="neutral"
                  outlined={false}
                  tight
                  idle="blink"
                  className="w-7"
                />
              </div>
              <span className="truncate text-xl font-bold tracking-tight">
                Ebistai
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-4">
          <AppSidebarNav />
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar

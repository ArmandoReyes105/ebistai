import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toast"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import AppSidebar from "@/components/app-sidebar"
import UserNav from "@/components/user-nav"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ClerkProvider>
          <ThemeProvider>
            <TooltipProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <div className="ml-auto">
                      <UserNav />
                    </div>
                  </header>
                  {children}
                </SidebarInset>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  )
}

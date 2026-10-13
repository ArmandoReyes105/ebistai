import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { clerkLocalization } from "@/lib/clerk-localization"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Toaster } from "@/components/ui/toast"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })

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
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        <ClerkProvider
          localization={clerkLocalization}
          appearance={{ theme: shadcn, options: { logoImageUrl: "/koi.png" } }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  )
}

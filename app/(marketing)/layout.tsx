import SiteFooter from "./components/site-footer"
import SiteNav from "./components/site-nav"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#contenido"
        className="fixed top-4 left-4 z-60 -translate-y-24 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-fluid outline-none focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Saltar al contenido
      </a>
      <SiteNav />
      <main id="contenido" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

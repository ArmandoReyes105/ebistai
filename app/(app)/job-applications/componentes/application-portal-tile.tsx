import { portalHost } from "@/lib/domain/portal-list"
import { safeHttpUrl } from "@/lib/safe-url"
import { JobApplication } from "@/types/job-application.types"
import { ArrowUpRight, Globe } from "lucide-react"

interface ApplicationPortalTileProps {
  application: JobApplication
}

const ApplicationPortalTile = ({ application }: ApplicationPortalTileProps) => {
  const portalUrl = safeHttpUrl(application.portalUrl)
  if (!portalUrl) return null

  const host = portalHost(portalUrl)
  const name = application.portalName || host

  return (
    <section
      aria-labelledby="portal-tile-title"
      className="flex flex-col border border-border bg-card"
    >
      <div className="flex min-w-0 items-center gap-3.5 px-6 py-5">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center bg-foreground text-background"
        >
          <Globe className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Portal del candidato
          </span>
          <h2 id="portal-tile-title" className="truncate text-lg font-semibold">
            {name}
          </h2>
          <span className="truncate font-mono text-[13px] text-muted-foreground">
            {host}
          </span>
        </div>
      </div>
      <a
        href={portalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-between border-t border-border bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Abrir portal
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    </section>
  )
}

export default ApplicationPortalTile

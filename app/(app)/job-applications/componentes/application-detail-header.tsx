import { ApplicationStateBadge } from "@/components/application-state-badge"
import { JobApplication } from "@/types/job-application.types"
import { ArrowLeft, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { safeHttpUrl } from "@/lib/safe-url"

interface ApplicationDetailHeaderProps {
  application: JobApplication
}

const ApplicationDetailHeader = ({
  application,
}: ApplicationDetailHeaderProps) => {
  return (
    <header className="flex flex-col gap-3">
      <Link
        href="/job-applications"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a mis solicitudes
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{application.jobTitle}</h1>
        <ApplicationStateBadge application={application} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>{application.company}</span>
        {safeHttpUrl(application.jobPostingUrl) && (
          <a
            href={safeHttpUrl(application.jobPostingUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            Ver la oferta
            <SquareArrowOutUpRight className="size-4" />
          </a>
        )}
      </div>
    </header>
  )
}

export default ApplicationDetailHeader

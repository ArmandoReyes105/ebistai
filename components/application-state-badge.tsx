import { Badge } from "@/components/ui/badge"
import { stageBadgeConfig, statusBadgeConfig } from "@/lib/components/badge-config"
import { getCombinedLabel } from "@/lib/domain/application-rules"
import { Status } from "@/types/enums"
import { JobApplication } from "@/types/job-application.types"

interface ApplicationStateBadgeProps {
  application: Pick<JobApplication, "stage" | "status">
}

// One badge for the whole state, e.g. "Rechazada en Entrevista técnica".
export function ApplicationStateBadge({ application }: ApplicationStateBadgeProps) {
  const config =
    application.status === Status.Active
      ? stageBadgeConfig[application.stage]
      : statusBadgeConfig[application.status]

  return (
    <Badge variant="secondary" className={config.className}>
      {getCombinedLabel(application)}
    </Badge>
  )
}

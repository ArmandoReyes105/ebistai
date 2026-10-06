import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  stageBadgeConfig,
  statusBadgeConfig,
} from "@/lib/components/badge-config"
import { JobApplication } from "@/types/job-application.types"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react/jsx-runtime"

interface RecentApplicationsListProps {
  applications: JobApplication[]
}

const RecentApplicationsList = ({
  applications,
}: RecentApplicationsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Postulaciones recientes</CardTitle>
          <Link
            href="job-applications"
            className="flex items-center gap-2 text-xs font-bold text-[#f38d48]"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <Separator />

      <CardContent>
        {applications.map((application) => (
          <Fragment key={application.id}>
            <div className="mb-0.5 flex flex-row items-center justify-between p-2">
              <div className="flex flex-col">
                <span className="text-sm">{application.jobTitle}</span>
                <span className="text-xs text-muted-foreground">
                  {application.company}
                </span>
              </div>

              <div className="flex flex-row gap-5">
                <StatusBadge
                  value={application.stage}
                  config={stageBadgeConfig}
                />

                <span className="text-xs text-muted-foreground">
                  {new Date(application.dateApplied).toLocaleDateString(
                    "es-ES",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )}
                </span>
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

export default RecentApplicationsList

import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { modalityBadgeConfig } from "@/lib/components/badge-config"
import { JobApplication } from "@/types/job-application.types"
import type { ReactNode } from "react"

interface ApplicationInfoCardProps {
  application: JobApplication
}

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const ApplicationInfoCard = ({ application }: ApplicationInfoCardProps) => {
  const items: { label: string; value: ReactNode }[] = [
    { label: "Fuente", value: application.applicationSource },
    {
      label: "Modalidad",
      value: (
        <StatusBadge value={application.mode} config={modalityBadgeConfig} />
      ),
    },
    {
      label: "Fecha de aplicación",
      value: formatDate(application.dateApplied),
    },
    {
      label: "Último avance",
      value: formatDate(application.lastProgressAt ?? application.dateApplied),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="text-sm">{item.value}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Notas</dt>
            <dd className="text-sm whitespace-pre-wrap">
              {application.notes ? (
                application.notes
              ) : (
                <span className="text-muted-foreground">
                  Aún no tienes notas aquí.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export default ApplicationInfoCard

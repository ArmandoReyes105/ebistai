import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { JobApplication } from "@/types/job-application.types"
import {
  Check,
  EyeOff,
  Radar,
  SlidersHorizontal,
  SquareArrowOutUpRight,
} from "lucide-react"
import { Fragment } from "react"
import { safeHttpUrl } from "@/lib/safe-url"

interface AntiGhostingRadarProps {
  radarApplications: JobApplication[]
  radarGhostingThresholdDays: number
  onMarkAsIgnored: (id: string) => Promise<void>
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const getDaysSince = (date: Date): number =>
  Math.max(0, Math.floor((Date.now() - date.getTime()) / MS_PER_DAY))

// Inactivity counts from the last stage change; fall back to the apply date.
const getLastProgressDate = (application: JobApplication): Date =>
  new Date(application.lastProgressAt ?? application.dateApplied)

const AntiGhostingRadar = ({
  radarApplications,
  radarGhostingThresholdDays,
  onMarkAsIgnored,
}: AntiGhostingRadarProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center gap-4">
          <div className="bg-primary/20 p-2">
            <Radar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>
              Radar Anti-ghosting{" "}
              <span className="ml-1 bg-primary/20 p-1 text-primary">
                {radarApplications.length}
              </span>
            </CardTitle>
            <CardDescription>
              {radarApplications.length}{" "}
              {radarApplications.length !== 1
                ? `postulaciones llevan ${radarGhostingThresholdDays} días o más sin avances.`
                : `postulación lleva ${radarGhostingThresholdDays} días o más sin avances.`}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="flex flex-row items-center gap-2 text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Umbral: {radarGhostingThresholdDays} días</span>
          </div>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="max-h-52 overflow-auto">
        {radarApplications.length === 0 && (
          <div className="flex flex-row gap-4">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-muted-foreground">
              Todo en orden: nadie te ha dejado en visto.
            </span>
          </div>
        )}
        {radarApplications.map((application) => (
          <Fragment key={application.id}>
            <div className="mb-0.5 flex flex-row items-center justify-between gap-4 p-1">
              <div className="flex flex-col">
                <span className="text-sm">{application.jobTitle}</span>
                <span className="text-xs text-muted-foreground">
                  {application.company} · Sin avances desde el{" "}
                  {getLastProgressDate(application).toLocaleDateString(
                    "es-ES",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>

              <div className="flex flex-row items-center gap-5">
                {safeHttpUrl(application.jobPostingUrl) && (
                  <a
                    href={safeHttpUrl(application.jobPostingUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver oferta de ${application.jobTitle}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    <SquareArrowOutUpRight className="ml-1 inline h-4 w-4" />
                  </a>
                )}

                <div className="flex flex-col">
                  <span className="text-xl font-bold text-primary">
                    {getDaysSince(getLastProgressDate(application))}
                  </span>
                  <span className="text-xs text-muted-foreground">días</span>
                </div>

                <Button
                  variant={"secondary"}
                  onClick={() => onMarkAsIgnored(application.id)}
                >
                  <EyeOff /> Marcar como ignorada
                </Button>
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

export default AntiGhostingRadar

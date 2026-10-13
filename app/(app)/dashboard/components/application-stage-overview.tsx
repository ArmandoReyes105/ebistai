import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Stage } from "@/types/enums"

interface ApplicationStageOverviewProps {
  totalApplications: number
  byStage: Record<keyof typeof Stage, number>
}

const ApplicationStageOverview = ({
  totalApplications,
  byStage,
}: ApplicationStageOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de Conversión</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex flex-col gap-4">
          <Progress
            value={100}
            className="**:data-[slot=progress-indicator]:bg-amber-400"
          >
            <ProgressLabel>
              1. Total de postulaciones: {totalApplications}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress
            value={
              totalApplications > 0
                ? (byStage["Applied"] / totalApplications) * 100
                : 0
            }
            className="**:data-[slot=progress-indicator]:bg-violet-400"
          >
            <ProgressLabel>
              2. En postulación: {byStage["Applied"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress
            value={
              totalApplications > 0
                ? (byStage["Interview"] / totalApplications) * 100
                : 0
            }
            className="**:data-[slot=progress-indicator]:bg-blue-400"
          >
            <ProgressLabel>
              3. En Entrevista: {byStage["Interview"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress
            value={
              totalApplications > 0
                ? (byStage["TechnicalInterview"] / totalApplications) * 100
                : 0
            }
            className="**:data-[slot=progress-indicator]:bg-indigo-400"
          >
            <ProgressLabel>
              4. En Entrevista Técnica: {byStage["TechnicalInterview"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress
            value={
              totalApplications > 0
                ? (byStage["Offer"] / totalApplications) * 100
                : 0
            }
            className="**:data-[slot=progress-indicator]:bg-green-400"
          >
            <ProgressLabel>5. Ofertas: {byStage["Offer"]}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicationStageOverview

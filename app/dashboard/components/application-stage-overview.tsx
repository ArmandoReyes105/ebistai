import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface ApplicationStageOverviewProps {
  totalApplications: number
  byStage: Record<string, number>
}

const ApplicationStageOverview = ({
  totalApplications,
  byStage,
}: ApplicationStageOverviewProps) => {
  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle>Embudo de Conversión</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex flex-col gap-4">
          <Progress value={(totalApplications / totalApplications) * 100}>
            <ProgressLabel>
              1. Total de postulaciones: {totalApplications}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress value={(byStage["Applied"] / totalApplications) * 100}>
            <ProgressLabel>
              2. En postulación: {byStage["Applied"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress value={(byStage["Interview"] / totalApplications) * 100}>
            <ProgressLabel>
              3. En Entrevista: {byStage["Interview"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress
            value={(byStage["TechnicalInterview"] / totalApplications) * 100}
          >
            <ProgressLabel>
              4. En Entrevista Técnica: {byStage["TechnicalInterview"]}
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          <Progress value={(byStage["Offer"] / totalApplications) * 100}>
            <ProgressLabel>5. Ofertas: {byStage["Offer"]}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicationStageOverview

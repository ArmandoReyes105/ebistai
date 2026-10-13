import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Stage } from "@/types/enums"
import { BadgeCheck, Layers, MessagesSquare, Send } from "lucide-react"

interface StatsCardsProps {
  totalApplications: number
  byStage: Record<keyof typeof Stage, number>
}

const StatsCards = ({ totalApplications, byStage }: StatsCardsProps) => {
  const appliedPercentage = (byStage["Applied"] / totalApplications) * 100
  const interviewPercentage = (byStage["Interview"] / totalApplications) * 100
  const offerPercentage = (byStage["Offer"] / totalApplications) * 100

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Total de postulaciones</CardTitle>
            <div className="bg-amber-400/20 p-2">
              <Layers className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="mb-2 text-2xl font-bold">{totalApplications}</h2>
          <div className="mb-1 h-1 w-full bg-amber-500" />
          <span className="text-xs text-muted-foreground">
            Registradas en Ebistai
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Postulaciones aplicadas</CardTitle>
            <div className="bg-violet-400/20 p-2">
              <Send className="h-4 w-4 text-violet-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="mb-2 text-2xl font-bold">{byStage["Applied"]}</h2>
          <Progress
            value={appliedPercentage > 0 ? appliedPercentage : 0}
            className="**:data-[slot=progress-indicator]:bg-violet-400"
          />
          <span className="text-xs text-muted-foreground">
            Procesos abiertos
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Entrevistas</CardTitle>
            <div className="bg-blue-400/20 p-2">
              <MessagesSquare className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="mb-2 text-2xl font-bold">{byStage["Interview"]}</h2>
          <Progress
            value={interviewPercentage > 0 ? interviewPercentage : 0}
            className="**:data-[slot=progress-indicator]:bg-blue-400"
          />
          <span className="text-xs text-muted-foreground">
            Han llegado a la etapa de entrevista
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Ofertas recibidas</CardTitle>
            <div className="bg-green-400/20 p-2">
              <BadgeCheck className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="mb-2 text-2xl font-bold">{byStage["Offer"]}</h2>
          <Progress
            value={offerPercentage > 0 ? offerPercentage : 0}
            className="**:data-[slot=progress-indicator]:bg-green-400"
          />
          <span className="text-xs text-muted-foreground">
            Con oferta del empleador
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatsCards

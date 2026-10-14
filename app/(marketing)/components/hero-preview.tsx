import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// Static, non-interactive replica of the dashboard with sample data.
// Self-contained on purpose: swap this file for a browser frame screenshot
// mockup later without touching the rest of the landing page.

const STAGES = [
  { label: "Aplicada", count: 12 },
  { label: "Entrevista", count: 5 },
  { label: "Prueba técnica", count: 2 },
  { label: "Ent. técnica", count: 1 },
  { label: "Oferta", count: 1 },
]

const TOTAL = STAGES.reduce((sum, stage) => sum + stage.count, 0)

const RADAR_ROWS = [
  { title: "Desarrolladora frontend", company: "Taller Lumbre", days: 31 },
  { title: "Ingeniero full stack", company: "Nube Cobre", days: 27 },
  { title: "Desarrollador backend", company: "Fondeo Sur", days: 23 },
]

const HeroPreview = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-full max-w-4xl rounded-2xl border bg-card p-2 text-left select-none"
    >
      <div className="flex flex-col gap-4 overflow-hidden rounded-lg bg-muted/30 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{TOTAL}</CardTitle>
            </CardHeader>
          </Card>
          {STAGES.slice(1, 4).map((stage) => (
            <Card key={stage.label}>
              <CardHeader>
                <CardDescription>{stage.label}</CardDescription>
                <CardTitle className="text-2xl">{stage.count}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Etapas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {STAGES.map((stage) => (
                <div key={stage.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span>{stage.label}</span>
                    <span className="text-muted-foreground">{stage.count}</span>
                  </div>
                  <Progress value={Math.round((stage.count / TOTAL) * 100)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar anti-ghosting</CardTitle>
              <CardDescription>3 postulaciones sin noticias.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-2">
              {RADAR_ROWS.map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{row.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.company}
                    </span>
                  </div>
                  <Badge variant="secondary">{row.days} días</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HeroPreview

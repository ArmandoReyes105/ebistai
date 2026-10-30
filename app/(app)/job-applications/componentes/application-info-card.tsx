import { modalityBadgeConfig } from "@/lib/components/badge-config"
import { JobApplication } from "@/types/job-application.types"

interface ApplicationInfoCardProps {
  application: JobApplication
  onEdit: () => void
}

// "30 sept 2026"
const formatDate = (value: Date | string) =>
  new Date(value)
    .toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "")

const ApplicationInfoCard = ({
  application,
  onEdit,
}: ApplicationInfoCardProps) => {
  const items = [
    { label: "Fuente", value: application.applicationSource },
    { label: "Modalidad", value: modalityBadgeConfig[application.mode].label },
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
    <section className="flex flex-col gap-2 border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Detalles</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium hover:underline"
        >
          Editar
        </button>
      </div>

      <dl className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-3 border-t border-muted py-3"
          >
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="text-right font-medium">{item.value}</dd>
          </div>
        ))}
        <div className="flex flex-col gap-2 border-t border-muted py-3">
          <dt className="text-sm text-muted-foreground">Notas</dt>
          <dd className="bg-muted px-3.5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap wrap-anywhere">
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
    </section>
  )
}

export default ApplicationInfoCard

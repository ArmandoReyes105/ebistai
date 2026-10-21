import { Button } from "@/components/ui/button"
import { safeHttpUrl } from "@/lib/safe-url"
import { JobApplication } from "@/types/job-application.types"
import { ArrowLeft, ArrowUpRight, Trash2 } from "lucide-react"
import Link from "next/link"

interface ApplicationDetailHeaderProps {
  application: JobApplication
  isDeleting?: boolean
  onEdit: () => void
  onDelete: () => void
}

const formatAppliedDate = (value: Date) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const ApplicationDetailHeader = ({
  application,
  isDeleting = false,
  onEdit,
  onDelete,
}: ApplicationDetailHeaderProps) => {
  const postingUrl = safeHttpUrl(application.jobPostingUrl)
  const initial = application.company.trim().charAt(0).toUpperCase() || "?"

  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/job-applications"
        className="inline-flex min-h-8 w-fit items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Postulaciones
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 items-center gap-5">
          {/* Company mark: its initial on an ink square. */}
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center bg-foreground text-[28px] font-bold text-background"
          >
            {initial}
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {application.company} · aplicada el{" "}
              {formatAppliedDate(application.dateApplied)}
            </span>
            <h1 className="text-4xl leading-none font-semibold tracking-[-0.04em] break-words md:text-5xl">
              {application.jobTitle}
              <span className="text-primary">.</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {postingUrl && (
            <Button
              variant="outline"
              className="h-11 gap-2 border-foreground bg-card px-[18px] text-sm font-medium"
              nativeButton={false}
              render={
                <a
                  href={postingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Ver vacante
              <ArrowUpRight className="size-3.5" />
            </Button>
          )}
          <Button
            className="h-11 bg-foreground px-[18px] text-sm font-semibold text-background hover:bg-foreground/90"
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            className="size-11 border-input bg-card p-0 text-muted-foreground hover:text-foreground"
            aria-label="Eliminar postulación"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="size-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default ApplicationDetailHeader

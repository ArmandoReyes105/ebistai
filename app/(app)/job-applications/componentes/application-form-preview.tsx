import { ReactNode } from "react"
import { previewInitial } from "@/lib/domain/application-preview"

const PANEL_CAPTION_CLASS =
  "font-mono text-xs tracking-wider text-background/70 uppercase"

interface ApplicationFormPreviewProps {
  label: string
  company: string
  caption: string
  title: string
  tags: string[]
  // Bottom of the side panel; it only shows from lg.
  children: ReactNode
}

// A compact band on small screens and the side panel from lg. Short screens,
// such as a phone in landscape, drop it to leave room for the form.
const ApplicationFormPreview = ({
  label,
  company,
  caption,
  title,
  tags,
  children,
}: ApplicationFormPreviewProps) => (
  <aside
    aria-label="Vista previa"
    className="flex min-w-0 shrink-0 items-center gap-3 bg-foreground px-4 py-3 text-background sm:px-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex-col lg:items-stretch lg:gap-6 lg:overflow-hidden lg:p-6 xl:p-8 [@media(max-height:480px)]:hidden"
  >
    <span className={`hidden lg:block ${PANEL_CAPTION_CLASS}`}>{label}</span>

    <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:flex-col lg:items-start lg:gap-4">
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center bg-background text-xl font-bold text-foreground lg:size-16 lg:text-3xl"
      >
        {previewInitial(company)}
      </span>

      <div className="flex min-w-0 max-w-full flex-col gap-1 lg:gap-2">
        <span className={`truncate ${PANEL_CAPTION_CLASS}`}>{caption}</span>
        <strong className="truncate text-lg font-semibold tracking-tight lg:line-clamp-4 lg:text-3xl lg:wrap-anywhere lg:whitespace-normal xl:text-4xl">
          {title}
          <span className="text-primary">.</span>
        </strong>
      </div>
    </div>

    <ul className="hidden shrink-0 flex-wrap gap-1 sm:flex">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border border-background/30 px-2 py-1 font-mono text-xs tracking-wider uppercase"
        >
          {tag}
        </li>
      ))}
    </ul>

    <div className="mt-auto hidden lg:flex lg:flex-col">{children}</div>
  </aside>
)

export default ApplicationFormPreview

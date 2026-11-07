import { previewInitial } from "@/lib/domain/application-preview"

export const PORTAL_DIALOG_HEADER_CLASS =
  "flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6 sm:py-4"

export const PORTAL_DIALOG_FOOTER_CLASS =
  "flex shrink-0 flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"

interface PortalPreviewProps {
  label: string
  name: string
  host: string
  tags: string[]
}

// The ink band of the dialogs, the same preview the application form shows.
const PortalPreview = ({ label, name, host, tags }: PortalPreviewProps) => (
  <aside
    aria-label={label}
    className="flex min-w-0 shrink-0 items-center gap-3 bg-foreground px-4 py-3 text-background sm:gap-4 sm:px-6 sm:py-4"
  >
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center bg-background text-xl font-bold text-foreground"
    >
      {previewInitial(name)}
    </span>

    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="truncate font-mono text-xs tracking-wider text-background/70 uppercase">
        {host}
      </span>
      <strong className="truncate text-lg font-semibold tracking-tight sm:text-xl">
        {name}
        <span className="text-primary">.</span>
      </strong>
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
  </aside>
)

export default PortalPreview

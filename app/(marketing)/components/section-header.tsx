import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  eyebrow: string
  title: string
  titleId: string
  description?: string
  className?: string
}

// Numbered eyebrow, heading and optional lead paragraph shared by the
// landing sections so they all read as one system.
const SectionHeader = ({
  eyebrow,
  title,
  titleId,
  description,
  className,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className
      )}
    >
      <div className="flex max-w-170 flex-col gap-4 lg:flex-1">
        <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {eyebrow}
        </span>
        <h2
          id={titleId}
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-lg text-base text-pretty text-muted-foreground lg:flex-1 lg:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeader

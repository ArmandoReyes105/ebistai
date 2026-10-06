import { Badge } from "./ui/badge"

type BadgeConfig = {
  label: string
  className: string
}

type StatusBadgeProps<T extends number> = {
  value: T
  config: Record<T, BadgeConfig>
}

export function StatusBadge<T extends number>({
  value,
  config,
}: StatusBadgeProps<T>) {
  const badgeConfig = config[value]

  if (!badgeConfig) {
    return <Badge variant="secondary">{value}</Badge>
  }

  return (
    <Badge variant="secondary" className={badgeConfig.className}>
      <div className="mr-2 h-1.25 w-1.25 bg-current" />
      {badgeConfig.label}
    </Badge>
  )
}

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
      {badgeConfig.label}
    </Badge>
  )
}

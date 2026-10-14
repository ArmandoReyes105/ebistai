"use client"

import { EnumOption } from "@/types/enums-options"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "./ui/select"
import { BadgeConfig } from "@/lib/components/badge-config"
import { StatusBadge } from "./status-badge"
import { useState } from "react"

interface StatusSelectProps<T extends number> {
  value: T
  // Only the targets the user may pick; the current value does not need to be in here.
  items: EnumOption<T>[]
  config: Record<T, BadgeConfig>
  onChange: (newValue: T) => Promise<unknown>
  disabled?: boolean
  "aria-label"?: string
}

// Controlled by `value`: the parent updates it from the server response.
const StatusSelect = <T extends number>({
  value,
  items,
  config,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: StatusSelectProps<T>) => {
  const [isPending, setIsPending] = useState(false)

  const handleChange = async (newValue: T | null) => {
    if (newValue === null || newValue === value) return

    setIsPending(true)
    try {
      await onChange(newValue)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(newVal) => handleChange(newVal)}
      disabled={disabled || isPending || items.length === 0}
    >
      <SelectTrigger aria-label={ariaLabel}>
        <StatusBadge value={value} config={config} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <StatusBadge value={item.value} config={config} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default StatusSelect

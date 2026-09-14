"use client"

import { EnumOption } from "@/types/enums-options"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { BadgeConfig } from "@/lib/components/badge-config"
import { StatusBadge } from "./status-badge"
import { useState } from "react"

interface StatusSelectProps<T extends number> {
  value: T
  items: EnumOption<T>[]
  config: Record<T, BadgeConfig>
  onChange: (newValue: T) => Promise<void>
}

const StatusSelect = <T extends number>({
  value,
  items,
  config,
  onChange,
}: StatusSelectProps<T>) => {
  const [state, setState] = useState<T>(value)

  const handleChange = async (newValue: T | null) => {
    if (newValue === value) return

    try {
      setState(newValue!)
      await onChange(newValue!)
    } finally {
    }
  }

  return (
    <Select
      items={items}
      value={state}
      onValueChange={(newVal) => handleChange(newVal)}
    >
      <SelectTrigger>
        <StatusBadge value={state} config={config} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.value}>
              <StatusBadge value={item.value} config={config} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default StatusSelect

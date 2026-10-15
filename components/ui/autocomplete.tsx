"use client"

import * as React from "react"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

// Free-text autocomplete: the server filters, so the list is static (mode
// "none"), nothing is highlighted until the user navigates, and clicking the
// input does not open the popup.
function Autocomplete({
  mode = "none",
  autoHighlight = false,
  ...props
}: Omit<AutocompletePrimitive.Root.Props<string>, "items"> & {
  items?: readonly string[]
}) {
  return (
    <AutocompletePrimitive.Root
      mode={mode}
      autoHighlight={autoHighlight}
      {...props}
    />
  )
}

function AutocompleteInput({
  ...props
}: Omit<AutocompletePrimitive.Input.Props, "render">) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      render={<Input />}
      {...props}
    />
  )
}

// The Dialog popup is z-50 and fixed, so a portal sibling without a z-index
// would paint behind it. Same stacking as Select and Popover.
function AutocompleteContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  children,
  ...props
}: AutocompletePrimitive.Popup.Props &
  Pick<
    AutocompletePrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 data-empty:hidden"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            "max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn("p-1", className)}
      {...props}
    />
  )
}

function AutocompleteItem({
  className,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn("px-2 py-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
}

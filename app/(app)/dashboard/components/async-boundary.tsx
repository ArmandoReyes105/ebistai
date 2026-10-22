import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { AsyncState } from "@/types/async-state.types"
import { cn } from "cn"
import { TriangleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

interface AsyncBoundaryProps<T> {
  state: AsyncState<T>
  onRetry: () => void
  // Shaped like the final content so the layout does not jump.
  skeleton: ReactNode
  className?: string
  children: (data: T) => ReactNode
}

// One data source, three outcomes: skeleton while loading, an Empty with
// "Reintentar" on error (retrying only this source), the content when ready.
const AsyncBoundary = <T,>({
  state,
  onRetry,
  skeleton,
  className,
  children,
}: AsyncBoundaryProps<T>) => {
  if (state.status === "loading") return skeleton

  if (state.status === "error") {
    return (
      <Empty
        role="alert"
        className={cn("h-full border border-border bg-card", className)}
      >
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Uy, se nos atoró esta sección</EmptyTitle>
          <EmptyDescription>
            No pudimos traer estos datos. ¿Lo intentamos de nuevo?
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return children(state.data)
}

export default AsyncBoundary

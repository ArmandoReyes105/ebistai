import { Skeleton } from "@/components/ui/skeleton"
import { METRIC_CELL, RADAR_CELL, RESPONSE_CELL, TILES_GRID } from "./styles"

// Section skeletons are shaped like the final content so nothing jumps when
// the data arrives. They are decorative: hidden from assistive technology.

export const RadarSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[420px]" />
)

export const ResponseTileSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[180px]" />
)

export const MetricTileSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[180px]" />
)

export const ActivityLogSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[300px]" />
)

export const ConversionSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[180px]" />
)

export const FeedSkeleton = () => (
  <Skeleton aria-hidden="true" className="min-h-[260px]" />
)

// Whole page (header included): the Suspense fallback of the server page.
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4" aria-busy="true">
    <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-10 w-48 sm:h-12 lg:h-14" />
      </div>
      <Skeleton className="h-12 w-48" />
    </div>
    <div className={TILES_GRID}>
      <div className={RADAR_CELL}>
        <RadarSkeleton />
      </div>
      <div className={RESPONSE_CELL}>
        <ResponseTileSkeleton />
      </div>
      <div className={METRIC_CELL}>
        <MetricTileSkeleton />
      </div>
      <div className={METRIC_CELL}>
        <MetricTileSkeleton />
      </div>
    </div>
    <ActivityLogSkeleton />
    <ConversionSkeleton />
    <FeedSkeleton />
  </div>
)

export default DashboardSkeleton

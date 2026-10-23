"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useActivityStats } from "@/hooks/use-activity-stats"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useLocalTimeZone } from "@/hooks/use-local-time-zone"
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus"
import { countLast7LocalDays } from "@/lib/domain/activity-dates"
import { formatHeaderDate } from "@/lib/domain/dashboard-format"
import type { AsyncState } from "@/types/async-state.types"
import type { ActivityStats, DashboardStats } from "@/types/stats.types"
import { ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import ActivityLog from "./activity-log"
import AsyncBoundary from "./async-boundary"
import {
  ActivityLogSkeleton,
  ConversionSkeleton,
  FeedSkeleton,
  MetricTileSkeleton,
  RadarSkeleton,
  ResponseTileSkeleton,
} from "./dashboard-skeleton"
import Greeting from "./greeting"
import MetricTile from "./metric-tile"
import RadarTile from "./radar-tile"
import RecentActivity from "./recent-activity"
import ResponseTile from "./response-tile"
import StageConversion from "./stage-conversion"
import {
  LABEL,
  METRIC_CELL,
  RADAR_CELL,
  RESPONSE_CELL,
  TILES_GRID,
} from "./styles"

// Code-split: the form is only needed once the user opens the dialog.
const JobApplicationDialog = dynamic(
  () =>
    import("@/app/(app)/job-applications/componentes/job-application-dialog"),
  { loading: () => <Skeleton className="h-12 w-48" /> }
)

interface DashboardProps {
  // null when the server fetch failed or timed out: the hook fetches once.
  initialStats: DashboardStats | null
  // Streamed from the server page; resolves to null on failure or timeout.
  initialActivity: Promise<ActivityStats | null>
}

// Everything that depends on the browser's local day (header date, chart,
// heatmap, 7-day count, feed times) needs the zone AND the activity.
interface BucketedData {
  activity: ActivityStats
  timeZone: string
}

const Dashboard = ({ initialStats, initialActivity }: DashboardProps) => {
  const timeZone = useLocalTimeZone()
  // Injected clock for the pure helpers; renewed on every refresh.
  const [now, setNow] = useState(() => new Date())

  const {
    state: activityState,
    retry: retryActivity,
    refresh: refreshActivity,
  } = useActivityStats(initialActivity)

  const refreshActivityAndClock = useCallback(() => {
    setNow(new Date())
    void refreshActivity()
  }, [refreshActivity])

  const {
    state: statsState,
    retry: retryStats,
    refresh,
    markAsIgnored,
    pendingIds,
  } = useDashboardStats(initialStats, refreshActivityAndClock)

  useRefreshOnFocus(refresh)

  const bucketedState = useMemo<AsyncState<BucketedData>>(() => {
    if (activityState.status !== "ready") return activityState
    if (timeZone === null) return { status: "loading" }
    return { status: "ready", data: { activity: activityState.data, timeZone } }
  }, [activityState, timeZone])

  // The radar reads SSR-safe: before the zone is known it falls back to UTC.
  const radarTimeZone = timeZone ?? "UTC"

  return (
    <div className="flex flex-col gap-4">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          {timeZone ? (
            <span className={LABEL}>{formatHeaderDate(now, timeZone)}</span>
          ) : (
            <Skeleton aria-hidden="true" className="h-4 w-44" />
          )}
          <Greeting />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/job-applications" />}
            className="h-12 gap-2.5 px-[22px] text-[15px] font-semibold"
          >
            Ver postulaciones <ArrowRight />
          </Button>
          <JobApplicationDialog onCreated={refresh} />
        </div>
      </header>

      <div className={TILES_GRID}>
        <div className={RADAR_CELL}>
          <AsyncBoundary
            state={statsState}
            onRetry={retryStats}
            skeleton={<RadarSkeleton />}
          >
            {(stats) => (
              <RadarTile
                applications={stats.antiGhostingRadar}
                thresholdDays={stats.radarGhostingThresholdDays}
                now={now}
                timeZone={radarTimeZone}
                pendingIds={pendingIds}
                onMarkAsIgnored={markAsIgnored}
              />
            )}
          </AsyncBoundary>
        </div>

        <div className={RESPONSE_CELL}>
          <AsyncBoundary
            state={activityState}
            onRetry={retryActivity}
            skeleton={<ResponseTileSkeleton />}
          >
            {(activity) => (
              <ResponseTile
                median={activity.medianDaysToFirstResponse}
                rate={activity.responseRate}
                responded={activity.respondedCount}
                total={activity.applicationsCount}
              />
            )}
          </AsyncBoundary>
        </div>

        <div className={METRIC_CELL}>
          <AsyncBoundary
            state={statsState}
            onRetry={retryStats}
            skeleton={<MetricTileSkeleton />}
          >
            {(stats) => (
              <MetricTile label="Procesos activos" value={stats.activeCount} />
            )}
          </AsyncBoundary>
        </div>

        <div className={METRIC_CELL}>
          <AsyncBoundary
            state={bucketedState}
            onRetry={retryActivity}
            skeleton={<MetricTileSkeleton />}
          >
            {({ activity, timeZone: zone }) => (
              <MetricTile
                tone="muted"
                label="Últimos 7 días"
                value={countLast7LocalDays(activity.movements, now, zone)}
                caption="postulaciones enviadas"
              />
            )}
          </AsyncBoundary>
        </div>
      </div>

      <AsyncBoundary
        state={bucketedState}
        onRetry={retryActivity}
        skeleton={<ActivityLogSkeleton />}
      >
        {({ activity, timeZone: zone }) => (
          <ActivityLog
            movements={activity.movements}
            now={now}
            timeZone={zone}
          />
        )}
      </AsyncBoundary>

      <AsyncBoundary
        state={activityState}
        onRetry={retryActivity}
        skeleton={<ConversionSkeleton />}
      >
        {(activity) => <StageConversion conversion={activity.conversion} />}
      </AsyncBoundary>

      <AsyncBoundary
        state={bucketedState}
        onRetry={retryActivity}
        skeleton={<FeedSkeleton />}
      >
        {({ activity, timeZone: zone }) => (
          <RecentActivity
            events={activity.recentEvents}
            now={now}
            timeZone={zone}
          />
        )}
      </AsyncBoundary>
    </div>
  )
}

export default Dashboard

import { statsService } from "@/services/stats-service"
import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import Dashboard from "./components/dashboard"
import DashboardSkeleton from "./components/dashboard-skeleton"

const TIMEOUT_MS = 10_000

// Both requests start in the same tick. /stats is awaited (radar and counts
// in the first HTML); /stats/activity is NOT awaited: its promise streams to
// the client island. A failure or timeout resolves to null, so the client
// takes over with its own fetch and per-section "Reintentar".
const DashboardData = async ({ token }: { token: string | undefined }) => {
  const activityPromise = statsService
    .getActivity({
      token,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    .catch((error: unknown) => {
      console.error(error)
      return null
    })

  const stats = await statsService
    .getDashboardStats({
      token,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    .catch((error: unknown) => {
      console.error(error)
      return null
    })

  return <Dashboard initialStats={stats} initialActivity={activityPromise} />
}

const DashboardPage = async () => {
  // Outside Suspense: unauthenticated visitors never see the skeleton.
  const { getToken } = await auth.protect()
  const token = (await getToken()) ?? undefined

  return (
    <div className="w-full px-4 py-4 sm:px-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData token={token} />
      </Suspense>
    </div>
  )
}

export default DashboardPage

import { Suspense } from "react"
import JobApplicationList from "./componentes/job-application-list"
import { auth } from "@clerk/nextjs/server"

const JobApplicationsPage = async () => {
  await auth.protect()

  return (
    // flex-1 + min-h-0: the list fills the space under the header and owns its
    // own scroll. On short screens the table's min-height overflows this box
    // and the app's content area scrolls the page instead.
    <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-4 sm:px-8">
      {/* useSearchParams needs a Suspense boundary for the production build. */}
      <Suspense fallback={null}>
        <JobApplicationList />
      </Suspense>
    </div>
  )
}

export default JobApplicationsPage

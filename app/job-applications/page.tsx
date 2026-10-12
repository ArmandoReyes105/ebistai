import JobApplicationList from "./componentes/job-application-list"
import { auth } from "@clerk/nextjs/server"

const JobApplicationsPage = async () => {
  await auth.protect()

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-4">
      <JobApplicationList />
    </div>
  )
}

export default JobApplicationsPage

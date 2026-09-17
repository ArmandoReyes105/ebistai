import JobApplicationList from "./componentes/job-application-list"
import { auth } from "@clerk/nextjs/server"

const JobApplicationsPage = async () => {
  await auth.protect()

  return (
    <div className="mx-auto max-w-7xl">
      <JobApplicationList />
    </div>
  )
}

export default JobApplicationsPage

import { auth } from "@clerk/nextjs/server"
import JobApplicationDetail from "../componentes/job-application-detail"

interface JobApplicationDetailPageProps {
  // Next 16: dynamic route params are async and must be awaited.
  params: Promise<{ id: string }>
}

const JobApplicationDetailPage = async ({
  params,
}: JobApplicationDetailPageProps) => {
  await auth.protect()
  const { id } = await params

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-4">
      <JobApplicationDetail id={id} />
    </div>
  )
}

export default JobApplicationDetailPage

import { auth } from "@clerk/nextjs/server"
import JobApplicationDialog from "../job-applications/componentes/job-application-dialog"
import Dashboard from "./components/dashboard"

const DashboardPage = async () => {
  await auth.protect()

  return (
    <div className="mx-auto px-8 py-4">
      <div className="mb-2 flex flex-row justify-between">
        <h1>Dashboard de postulaciones</h1>
        <JobApplicationDialog />
      </div>
      <Dashboard />
    </div>
  )
}

export default DashboardPage

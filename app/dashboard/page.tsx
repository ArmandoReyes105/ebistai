import { auth, currentUser } from "@clerk/nextjs/server"
import JobApplicationDialog from "../job-applications/componentes/job-application-dialog"
import Dashboard from "./components/dashboard"

const DashboardPage = async () => {
  await auth.protect()
  const user = await currentUser()
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-4">
        <p className="text-sm text-muted-foreground">
          No pudimos cargar tu información. Por favor, recargá la página.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-4">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold">Hola, {user.firstName}</h1>
        <JobApplicationDialog />
      </div>
      <Dashboard />
    </div>
  )
}

export default DashboardPage

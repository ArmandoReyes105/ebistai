import { auth, currentUser } from "@clerk/nextjs/server"
import JobApplicationDialog from "../job-applications/componentes/job-application-dialog"
import Dashboard from "./components/dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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

        <div className="flex flex-row gap-3">
          <Button
            variant={"outline"}
            nativeButton={false}
            render={<Link href={"/job-applications"} />}
          >
            Ver postulaciones <ArrowRight className="h-4 w-4" />
          </Button>
          <JobApplicationDialog />
        </div>
      </div>
      <Dashboard />
    </div>
  )
}

export default DashboardPage

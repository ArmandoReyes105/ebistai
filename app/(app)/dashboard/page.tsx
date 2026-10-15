import { auth, currentUser } from "@clerk/nextjs/server"
import Dashboard from "./components/dashboard"

const DashboardPage = async () => {
  await auth.protect()
  const user = await currentUser()
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-8 py-4">
        <p className="text-sm text-muted-foreground">
          Uy, se nos atoró algo al traer tu información. ¿Recargas la página y
          lo intentamos de nuevo?
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-4">
      <Dashboard firstName={user.firstName} />
    </div>
  )
}

export default DashboardPage

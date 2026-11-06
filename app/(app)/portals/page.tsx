import { auth } from "@clerk/nextjs/server"
import PortalsView from "./components/portals-view"

const PortalsPage = async () => {
  await auth.protect()

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-4 sm:px-8">
      <PortalsView />
    </div>
  )
}

export default PortalsPage

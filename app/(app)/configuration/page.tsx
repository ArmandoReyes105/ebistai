import { auth } from "@clerk/nextjs/server"
import Configuration from "./components/configuration"

const ConfigurationPage = async () => {
  await auth.protect()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <span className="text-sm text-muted-foreground">
          Tu cuenta y tus preferencias de visualización.
        </span>
      </div>
      <Configuration />
    </div>
  )
}

export default ConfigurationPage

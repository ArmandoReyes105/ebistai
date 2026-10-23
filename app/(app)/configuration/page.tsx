import { auth } from "@clerk/nextjs/server"
import { LABEL } from "./components/styles"
import Configuration from "./components/configuration"

const ConfigurationPage = async () => {
  await auth.protect()

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-4 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className={LABEL}>Tu cuenta y tus preferencias</span>
          <h1 className="text-4xl leading-none font-semibold tracking-tighter">
            Configuración<span className="text-primary">.</span>
          </h1>
        </div>
        <span className={LABEL}>Los cambios se guardan solos</span>
      </header>
      <Configuration />
    </div>
  )
}

export default ConfigurationPage

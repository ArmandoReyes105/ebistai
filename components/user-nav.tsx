import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { Button } from "./ui/button"

const UserNav = async () => {
  const user = await currentUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton>
          <Button variant="outline">Iniciar sesión</Button>
        </SignInButton>
        <SignUpButton>
          <Button>Registrarse</Button>
        </SignUpButton>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="hidden min-w-0 text-right leading-tight sm:grid">
        <span className="truncate text-sm text-foreground">
          {user.fullName}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {user.primaryEmailAddress?.emailAddress}
        </span>
      </div>
      <UserButton />
    </div>
  )
}

export default UserNav

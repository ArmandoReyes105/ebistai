"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { avatarInitial } from "@/lib/domain/config-settings"
import { useClerk, useUser } from "@clerk/nextjs"
import { cn } from "cn"
import { BUTTON_SIZE, LABEL, NARROW_TILE, TILE_TITLE } from "./styles"

const AccountTile = () => {
  const { isLoaded, user } = useUser()
  const { openUserProfile, signOut } = useClerk()

  const email = user?.primaryEmailAddress?.emailAddress
  const name = user?.fullName ?? user?.username ?? email
  // The section is labelled by this heading, so it always has text.
  const heading = name ?? "Tu cuenta"

  return (
    <section aria-labelledby="account-heading" className={NARROW_TILE}>
      <div className="flex flex-col gap-2.5">
        <span className={LABEL}>04 · Cuenta</span>
        {isLoaded ? (
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden="true"
              className="flex size-12 flex-none items-center justify-center bg-foreground text-xl font-bold text-background"
            >
              {avatarInitial(name, email)}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id="account-heading" className={cn(TILE_TITLE, "truncate")}>
                {heading}
              </h2>
              {email && (
                <span className="truncate text-sm text-muted-foreground">
                  {email}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            {/* Keeps the section's label target while the user loads. */}
            <h2 id="account-heading" className="sr-only">
              Tu cuenta
            </h2>
            <Skeleton aria-hidden="true" className="size-12 flex-none" />
            <Skeleton aria-hidden="true" className="h-10 w-40" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={() => openUserProfile()}
          className={cn(
            "flex-auto border-foreground px-4 text-sm",
            BUTTON_SIZE
          )}
        >
          Gestionar cuenta
        </Button>
        <Button
          variant="outline"
          onClick={() => void signOut()}
          className={cn(
            "flex-auto px-4 text-sm text-muted-foreground",
            BUTTON_SIZE
          )}
        >
          Cerrar sesión
        </Button>
      </div>
    </section>
  )
}

export default AccountTile

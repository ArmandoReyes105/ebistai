import { SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Single source for the primary action, reused by the hero and the final CTA
// so both stay identical.
const SignupCta = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <SignUpButton>
        <Button
          size="lg"
          className="h-auto rounded-full px-3 py-2 text-base font-semibold duration-300 ease-fluid hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px"
        >
          Crear mi cuenta en la beta
          <ArrowRight />
        </Button>
      </SignUpButton>
      <p className="text-sm text-muted-foreground">
        Beta privada, gratis y sin tarjeta de crédito.
      </p>
    </div>
  )
}

export default SignupCta

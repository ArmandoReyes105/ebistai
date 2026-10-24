import { SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SignupCtaProps = {
  className?: string
  /** Use "inverted" on a section painted with the foreground color. */
  tone?: "default" | "inverted"
}

// Single source for the primary action, reused by the hero and the final CTA
// so both stay identical.
const SignupCta = ({ className, tone = "default" }: SignupCtaProps) => {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <SignUpButton>
        <Button
          size="lg"
          className="h-9 px-3 text-base font-semibold duration-300 ease-fluid hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background pointer-coarse:h-11"
        >
          Crear mi cuenta en la beta
          <ArrowRight data-icon="inline-end" />
        </Button>
      </SignUpButton>
      <p
        className={cn(
          "text-sm",
          tone === "inverted" ? "text-background/70" : "text-muted-foreground"
        )}
      >
        Beta privada, gratis y sin tarjeta de crédito.
      </p>
    </div>
  )
}

export default SignupCta

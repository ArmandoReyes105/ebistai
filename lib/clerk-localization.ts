import { esMX } from "@clerk/localizations"

// Start from Clerk's Mexican Spanish strings and only override the copy
// that carries the Ebistai voice (short, warm and encouraging).
export const clerkLocalization = {
  ...esMX,
  signIn: {
    ...esMX.signIn,
    start: {
      ...esMX.signIn?.start,
      title: "¡Qué bueno verte de vuelta!",
      subtitle: "Entra a {{applicationName}} y retomemos tu búsqueda.",
    },
  },
  signUp: {
    ...esMX.signUp,
    start: {
      ...esMX.signUp?.start,
      title: "Crea tu cuenta",
      subtitle: "Empecemos a darle orden a tu búsqueda en {{applicationName}}.",
    },
  },
}

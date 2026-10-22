"use client"

import { useUser } from "@clerk/nextjs"

// "Hola." until Clerk has loaded the user (or when there is no first name),
// then "Hola, {firstName}." The red period is part of the design.
const Greeting = () => {
  const { isLoaded, user } = useUser()
  const firstName = isLoaded ? user?.firstName?.trim() : null

  return (
    <h1 className="text-4xl leading-none font-semibold tracking-tighter sm:text-5xl lg:text-[56px]">
      {firstName ? `Hola, ${firstName}` : "Hola"}
      <span className="text-primary">.</span>
    </h1>
  )
}

export default Greeting

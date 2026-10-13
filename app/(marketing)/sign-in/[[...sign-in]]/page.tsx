import { SignIn } from "@clerk/nextjs"

const SignInPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-24 pb-12">
      <SignIn />
    </div>
  )
}

export default SignInPage

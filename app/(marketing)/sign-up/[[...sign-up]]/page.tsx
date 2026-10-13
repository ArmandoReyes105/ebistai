import { SignUp } from "@clerk/nextjs"

const SignUpPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-24 pb-12">
      <SignUp />
    </div>
  )
}

export default SignUpPage

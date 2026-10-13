# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Authentication (Clerk)

Ebistai uses `@clerk/nextjs` v7 with the shadcn theme from `@clerk/ui`.
Add these keys to your `.env` (it is gitignored) next to the Clerk publishable
and secret keys:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

Route protection lives in each page (`await auth.protect()`), not in
`proxy.ts`. The proxy only redirects signed-in visitors from `/` to
`/dashboard`.

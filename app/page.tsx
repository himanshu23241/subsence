// app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  // This automatically redirects anyone who visits "/" to "/dashboard"
  // If they aren't logged in, the middleware will bounce them to "/login"
  redirect('/dashboard')
}
import { redirect } from 'next/navigation'

export default function SignupPage() {
  // Redirect to the auth page with signup tab
  redirect('/auth?tab=signup')
}



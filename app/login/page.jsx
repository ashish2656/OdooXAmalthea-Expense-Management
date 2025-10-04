import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to the auth page where the actual login form is located
  redirect('/auth')
}




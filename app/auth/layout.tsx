import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChickAPI - Authentication',
  description: 'Sign in to ChickAPI',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}

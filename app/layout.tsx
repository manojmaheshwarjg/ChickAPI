import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ChickAPI - Visual API Flow Designer',
  description: 'Enterprise-grade visual API workflow designer and testing platform',
  keywords: 'API, testing, workflow, visual programming, REST, GraphQL',
  authors: [{ name: 'ChickAPI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#18181b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}

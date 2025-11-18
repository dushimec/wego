'use client'

import type { ReactNode } from 'react'
import { FirebaseClientProvider } from '@/firebase/client-provider'

interface RootLayoutClientProps {
  children: ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <FirebaseClientProvider>
      {children}
    </FirebaseClientProvider>
  )
}

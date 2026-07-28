"use client"

import { RootLayout } from "@/core/layouts/RootLayout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>
}

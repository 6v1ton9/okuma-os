"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { RootLayout } from "@/core/layouts/RootLayout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("okuma_token")
    if (!token) {
      router.replace("/login")
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return <RootLayout>{children}</RootLayout>
}

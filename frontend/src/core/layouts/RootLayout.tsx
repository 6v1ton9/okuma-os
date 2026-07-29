"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/core/hooks/useTheme"
import { useState, useMemo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FloatingFormProvider } from "@/shared/components/FloatingFormManager"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/machines/models": "Modelos de Máquinas",
  "/machines/customer": "Máquinas de Clientes",
  "/technicians": "Técnicos",
  "/calendar": "Agenda",
  "/settings": "Configurações",
}

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      })
  )

  const pathname = usePathname()

  const pageTitle = useMemo(() => {
    for (const [prefix, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(prefix)) return title
    }
    return "OKUMA OS"
  }, [pathname])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <FloatingFormProvider>
            <div className="flex h-screen bg-white dark:bg-neutral-950">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar title={pageTitle} />
                <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-900">
                  {children}
                </main>
              </div>
            </div>
          </FloatingFormProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

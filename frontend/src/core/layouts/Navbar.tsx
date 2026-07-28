"use client"

import { Moon, Sun, Bell, User } from "lucide-react"
import { useTheme } from "@/core/hooks/useTheme"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center bg-neutral-100 dark:bg-neutral-800">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden md:inline">Admin</span>
        </Button>
      </div>
    </header>
  )
}

"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const saved = localStorage.getItem("okuma_theme") as Theme | null
  if (saved === "light" || saved === "dark") return saved
  // Check OS preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "light"
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  // Apply the theme class on mount and whenever it changes
  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("okuma_theme", theme)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  // Prevent hydration mismatch by not rendering children until mounted
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {mounted ? children : <div className="contents">{children}</div>}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

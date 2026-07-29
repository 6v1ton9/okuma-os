"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { FloatingWindow, MinimizedWindowBar } from "./FloatingWindow"

// =============================================================================
// Types
// =============================================================================

export interface OpenForm {
  id: string
  title: string
  minimized: boolean
  component: ReactNode
}

interface FloatingFormContextType {
  openForm: (id: string, title: string, component: ReactNode) => void
  closeForm: (id: string) => void
  minimizeForm: (id: string) => void
  restoreForm: (id: string) => void
}

// =============================================================================
// Context
// =============================================================================

const FloatingFormContext = createContext<FloatingFormContextType>({
  openForm: () => {},
  closeForm: () => {},
  minimizeForm: () => {},
  restoreForm: () => {},
})

export function useFloatingForm() {
  return useContext(FloatingFormContext)
}

// =============================================================================
// Provider
// =============================================================================

export function FloatingFormProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<OpenForm[]>([])

  const openForm = useCallback(
    (id: string, title: string, component: ReactNode) => {
      setForms((prev) => {
        // If already open, just bring it back (un-minimize)
        const existing = prev.find((f) => f.id === id)
        if (existing) {
          return prev.map((f) =>
            f.id === id ? { ...f, minimized: false } : f
          )
        }
        // Otherwise add new form
        return [...prev, { id, title, minimized: false, component }]
      })
    },
    []
  )

  const closeForm = useCallback((id: string) => {
    setForms((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const minimizeForm = useCallback((id: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, minimized: true } : f))
    )
  }, [])

  const restoreForm = useCallback((id: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, minimized: false } : f))
    )
  }, [])

  const activeForms = forms.filter((f) => !f.minimized)
  const minimizedForms = forms
    .filter((f) => f.minimized)
    .map((f) => ({ id: f.id, title: f.title }))

  return (
    <FloatingFormContext.Provider
      value={{ openForm, closeForm, minimizeForm, restoreForm }}
    >
      {children}

      {/* Active (non-minimized) windows */}
      {activeForms.map((form) => (
        <FloatingWindow
          key={form.id}
          id={form.id}
          title={form.title}
          onClose={() => closeForm(form.id)}
          initialPosition={{
            x: 80 + activeForms.indexOf(form) * 30,
            y: 60 + activeForms.indexOf(form) * 30,
          }}
        >
          {form.component}
        </FloatingWindow>
      ))}

      {/* Minimized window bar at bottom */}
      <MinimizedWindowBar
        items={minimizedForms}
        onRestore={restoreForm}
        onClose={closeForm}
      />
    </FloatingFormContext.Provider>
  )
}

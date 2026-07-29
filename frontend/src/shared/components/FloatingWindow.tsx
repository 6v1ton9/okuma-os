"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Minus, GripHorizontal, Maximize2 } from "lucide-react"

interface FloatingWindowProps {
  id: string
  title: string
  onClose: () => void
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  width?: number
  height?: number
}

export function FloatingWindow({
  id,
  title,
  onClose,
  children,
  initialPosition = { x: 100, y: 80 },
  width = 640,
  height = 480,
}: FloatingWindowProps) {
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState({ width, height })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [resizeStartSize, setResizeStartSize] = useState({ width, height })

  const dragRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  // Bring to front on click
  const [zIndex, setZIndex] = useState(100)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setZIndex((prev) => Math.max(prev + 1, 100))
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    },
    [position]
  )

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizing(true)
      setResizeStart({ x: e.clientX, y: e.clientY })
      setResizeStartSize({ width: size.width, height: size.height })
    },
    [size]
  )

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        setPosition({
          x: Math.max(0, Math.min(newX, window.innerWidth - 200)),
          y: Math.max(0, Math.min(newY, window.innerHeight - 100)),
        })
      }
      if (isResizing) {
        const dx = e.clientX - resizeStart.x
        const dy = e.clientY - resizeStart.y
        setSize({
          width: Math.max(400, resizeStartSize.width + dx),
          height: Math.max(300, resizeStartSize.height + dy),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeStartSize])

  if (minimized) return null

  return (
    <div
      ref={windowRef}
      className="fixed shadow-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        maxHeight: Math.min(size.height, window.innerHeight - 40),
        zIndex,
      }}
    >
      {/* Title bar */}
      <div
        ref={dragRef}
        className="flex items-center justify-between px-3 py-2 bg-neutral-100 dark:bg-neutral-800 cursor-move select-none border-b border-neutral-200 dark:border-neutral-700"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMinimized(true)
            }}
            className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Minimizar"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            title="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: size.height - 40 }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-neutral-300 dark:border-neutral-600" />
      </div>
    </div>
  )
}

// =============================================================================
// Minimized window bar (appears at bottom of screen)
// =============================================================================

interface MinimizedWindow {
  id: string
  title: string
}

export function MinimizedWindowBar({
  items,
  onRestore,
  onClose,
}: {
  items: MinimizedWindow[]
  onRestore: (id: string) => void
  onClose: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] flex items-center gap-2 border-t border-neutral-200 bg-white/95 px-4 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          <button
            onClick={() => onRestore(item.id)}
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          >
            <span className="truncate max-w-[160px]">{item.title}</span>
          </button>
          <button
            onClick={() => onClose(item.id)}
            className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

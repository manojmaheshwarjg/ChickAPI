import { useState, useCallback, useRef } from 'react'

interface UseCanvasInteractionOptions {
  viewBox: { x: number; y: number; width: number; height: number }
  zoom: number
  onPan: (dx: number, dy: number) => void
  onNodeMove: (nodeId: string, dx: number, dy: number) => void
}

export function useCanvasInteraction({ 
  viewBox, 
  zoom, 
  onPan, 
  onNodeMove 
}: UseCanvasInteractionOptions) {
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Check if clicking on empty canvas (not on a node)
    if ((e.target as HTMLElement).classList.contains('canvas')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      onPan(dx, dy)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
  }, [isPanning, onPan])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setSelectedNodeId(null)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    // Zoom functionality can be added here if needed
  }, [])

  return {
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  }
}

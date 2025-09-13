import { useState, useCallback } from 'react'

interface UseDragDropOptions {
  onDrop: (nodeType: string, position: { x: number; y: number }) => void
}

export function useDragDrop({ onDrop }: UseDragDropOptions) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDraggingOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)

    const nodeType = e.dataTransfer.getData('nodeType')
    if (nodeType) {
      onDrop(nodeType, { x: e.clientX, y: e.clientY })
    }
  }, [onDrop])

  return {
    isDraggingOver,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}

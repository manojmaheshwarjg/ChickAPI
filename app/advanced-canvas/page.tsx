'use client'

import React from 'react'
import { AdvancedCanvasProvider } from '@/components/advanced-canvas/AdvancedCanvasContext'
import { AdvancedCanvasLayout } from '@/components/advanced-canvas/AdvancedCanvasLayout'

export default function AdvancedCanvasPage() {
  return (
    <div className="w-full h-screen bg-gray-50">
      <AdvancedCanvasProvider>
        <AdvancedCanvasLayout />
      </AdvancedCanvasProvider>
    </div>
  )
}
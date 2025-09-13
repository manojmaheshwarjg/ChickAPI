'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { NodeAnimation, TransitionConfig } from '@/lib/grouping-types'

export interface AnimationQueue {
  id: string
  animation: NodeAnimation
  startTime?: number
  promise?: Promise<void>
  resolve?: () => void
}

export function useNodeAnimations() {
  const [activeAnimations, setActiveAnimations] = useState<AnimationQueue[]>([])
  const animationFrameRef = useRef<number>(0)
  const animationQueueRef = useRef<AnimationQueue[]>([])

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t: number) => {
      if (t < (1/2.75)) {
        return (7.5625 * t * t)
      } else if (t < (2/2.75)) {
        return (7.5625 * (t -= (1.5/2.75)) * t + 0.75)
      } else if (t < (2.5/2.75)) {
        return (7.5625 * (t -= (2.25/2.75)) * t + 0.9375)
      } else {
        return (7.5625 * (t -= (2.625/2.75)) * t + 0.984375)
      }
    }
  }

  // Interpolate between two values
  const interpolate = useCallback((from: any, to: any, progress: number, property: string) => {
    if (property === 'position') {
      return {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress
      }
    }
    
    if (property === 'size') {
      return {
        width: from.width + (to.width - from.width) * progress,
        height: from.height + (to.height - from.height) * progress
      }
    }
    
    if (property === 'opacity' || typeof from === 'number') {
      return from + (to - from) * progress
    }
    
    if (property === 'color') {
      // Simple color interpolation (assumes hex colors)
      const fromRgb = hexToRgb(from)
      const toRgb = hexToRgb(to)
      if (fromRgb && toRgb) {
        const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress)
        const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress)
        const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress)
        return rgbToHex(r, g, b)
      }
    }
    
    return to // Fallback for non-animatable properties
  }, [])

  // Color utility functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  // Animation loop
  const animate = useCallback(() => {
    const now = performance.now()
    const activeQueue = animationQueueRef.current.filter(item => item.startTime && item.startTime <= now)
    const completedAnimations: string[] = []

    activeQueue.forEach(item => {
      if (!item.startTime) return

      const elapsed = now - item.startTime
      const duration = item.animation.duration
      const progress = Math.min(elapsed / duration, 1)
      
      // Apply easing
      const easingFunc = easingFunctions[item.animation.easing] || easingFunctions.linear
      const easedProgress = easingFunc(progress)
      
      // Calculate current value
      const currentValue = interpolate(
        item.animation.from,
        item.animation.to,
        easedProgress,
        item.animation.property
      )

      // Apply the animation to the DOM element
      const nodeElement = document.querySelector(`[data-id="${item.animation.nodeId}"]`)
      if (nodeElement) {
        applyAnimationToElement(nodeElement as HTMLElement, item.animation.property, currentValue)
      }

      // Check if animation is complete
      if (progress >= 1) {
        completedAnimations.push(item.id)
        item.resolve?.()
      }
    })

    // Remove completed animations
    if (completedAnimations.length > 0) {
      animationQueueRef.current = animationQueueRef.current.filter(
        item => !completedAnimations.includes(item.id)
      )
      setActiveAnimations(prev => prev.filter(item => !completedAnimations.includes(item.id)))
    }

    // Continue animation loop if there are active animations
    if (animationQueueRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [interpolate])

  // Apply animation to DOM element
  const applyAnimationToElement = useCallback((element: HTMLElement, property: string, value: any) => {
    switch (property) {
      case 'position':
        element.style.transform = `translate(${value.x}px, ${value.y}px)`
        break
      case 'size':
        element.style.width = `${value.width}px`
        element.style.height = `${value.height}px`
        break
      case 'opacity':
        element.style.opacity = value.toString()
        break
      case 'color':
        element.style.backgroundColor = value
        break
    }
  }, [])

  // Add animation to queue
  const addAnimation = useCallback((animation: NodeAnimation): Promise<void> => {
    return new Promise<void>((resolve) => {
      const animationItem: AnimationQueue = {
        id: `anim_${Date.now()}_${Math.random()}`,
        animation,
        startTime: performance.now() + (animation.delay || 0),
        resolve
      }

      animationQueueRef.current.push(animationItem)
      setActiveAnimations(prev => [...prev, animationItem])

      // Start animation loop if not already running
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    })
  }, [animate])

  // Animate node entrance
  const animateNodeEntrance = useCallback((nodeId: string, config?: TransitionConfig) => {
    const duration = config?.duration || 500
    const easing = config?.easing || 'ease-out'
    const delay = config?.delay || 0

    return Promise.all([
      addAnimation({
        nodeId,
        property: 'opacity',
        from: 0,
        to: 1,
        duration,
        easing: easing as any,
        delay
      }),
      addAnimation({
        nodeId,
        property: 'position',
        from: { x: 0, y: -50 }, // Start above
        to: { x: 0, y: 0 }, // End at normal position
        duration,
        easing: easing as any,
        delay
      })
    ])
  }, [addAnimation])

  // Animate node exit
  const animateNodeExit = useCallback((nodeId: string, config?: TransitionConfig) => {
    const duration = config?.duration || 300
    const easing = config?.easing || 'ease-in'
    
    return Promise.all([
      addAnimation({
        nodeId,
        property: 'opacity',
        from: 1,
        to: 0,
        duration,
        easing: easing as any
      }),
      addAnimation({
        nodeId,
        property: 'position',
        from: { x: 0, y: 0 },
        to: { x: 0, y: 50 }, // Exit downward
        duration,
        easing: easing as any
      })
    ])
  }, [addAnimation])

  // Animate node selection
  const animateNodeSelection = useCallback((nodeId: string) => {
    return addAnimation({
      nodeId,
      property: 'size',
      from: { width: 200, height: 100 },
      to: { width: 210, height: 105 },
      duration: 200,
      easing: 'ease-out'
    })
  }, [addAnimation])

  // Animate group collapse/expand
  const animateGroupToggle = useCallback((groupId: string, isCollapsing: boolean) => {
    const duration = 400
    const easing = 'ease-in-out'
    
    if (isCollapsing) {
      return Promise.all([
        addAnimation({
          nodeId: groupId,
          property: 'size',
          from: { width: 400, height: 300 },
          to: { width: 200, height: 60 },
          duration,
          easing
        }),
        addAnimation({
          nodeId: groupId,
          property: 'opacity',
          from: 1,
          to: 0.8,
          duration: duration / 2,
          easing
        })
      ])
    } else {
      return Promise.all([
        addAnimation({
          nodeId: groupId,
          property: 'size',
          from: { width: 200, height: 60 },
          to: { width: 400, height: 300 },
          duration,
          easing
        }),
        addAnimation({
          nodeId: groupId,
          property: 'opacity',
          from: 0.8,
          to: 1,
          duration: duration / 2,
          easing,
          delay: duration / 2
        })
      ])
    }
  }, [addAnimation])

  // Pulse animation for running nodes
  const animateNodePulse = useCallback((nodeId: string) => {
    const pulseAnimation = () => {
      addAnimation({
        nodeId,
        property: 'opacity',
        from: 1,
        to: 0.6,
        duration: 600,
        easing: 'ease-in-out'
      }).then(() => {
        addAnimation({
          nodeId,
          property: 'opacity',
          from: 0.6,
          to: 1,
          duration: 600,
          easing: 'ease-in-out'
        }).then(() => {
          // Check if node is still in running state before continuing
          const nodeElement = document.querySelector(`[data-id="${nodeId}"]`)
          if (nodeElement && nodeElement.classList.contains('running')) {
            pulseAnimation()
          }
        })
      })
    }
    
    pulseAnimation()
  }, [addAnimation])

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    addAnimation,
    animateNodeEntrance,
    animateNodeExit,
    animateNodeSelection,
    animateGroupToggle,
    animateNodePulse,
    activeAnimations
  }
}

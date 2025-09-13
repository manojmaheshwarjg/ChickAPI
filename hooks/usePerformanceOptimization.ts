'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ViewportBounds, VirtualizationConfig } from '@/lib/grouping-types'
import { BaseNode, NodeConnection } from '@/lib/types'

export interface PerformanceMetrics {
  renderTime: number
  nodeCount: number
  connectionCount: number
  visibleNodes: number
  fps: number
  memoryUsage?: number
}

export interface UsePerformanceOptimizationOptions {
  nodes: BaseNode[]
  connections: NodeConnection[]
  viewportBounds: ViewportBounds
  virtualizationEnabled?: boolean
  bufferSize?: number
  updateThreshold?: number
}

export function usePerformanceOptimization({
  nodes,
  connections,
  viewportBounds,
  virtualizationEnabled = true,
  bufferSize = 5,
  updateThreshold = 50
}: UsePerformanceOptimizationOptions) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    nodeCount: 0,
    connectionCount: 0,
    visibleNodes: 0,
    fps: 0
  })
  
  const [virtualizationConfig, setVirtualizationConfig] = useState<VirtualizationConfig>({
    enabled: virtualizationEnabled,
    bufferSize,
    chunkSize: 50,
    updateThreshold
  })

  const lastViewportRef = useRef<ViewportBounds>(viewportBounds)
  const performanceTimerRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(performance.now())
  const visibleNodesCache = useRef<Map<string, boolean>>(new Map())

  // Calculate node visibility with caching
  const calculateNodeVisibility = useCallback((node: BaseNode, bounds: ViewportBounds): boolean => {
    const nodeRight = node.position.x + node.size.width
    const nodeBottom = node.position.y + node.size.height
    const boundsRight = bounds.x + bounds.width
    const boundsBottom = bounds.y + bounds.height

    // Add buffer zone for smoother scrolling
    const buffer = bufferSize * 20 // 20px per buffer unit
    
    return !(
      nodeRight < bounds.x - buffer ||
      node.position.x > boundsRight + buffer ||
      nodeBottom < bounds.y - buffer ||
      node.position.y > boundsBottom + buffer
    )
  }, [bufferSize])

  // Virtualized nodes with viewport culling
  const virtualizedNodes = useMemo(() => {
    if (!virtualizationConfig.enabled) {
      return nodes
    }

    const startTime = performance.now()
    
    // Check if viewport moved significantly
    const viewportDelta = Math.abs(viewportBounds.x - lastViewportRef.current.x) +
                         Math.abs(viewportBounds.y - lastViewportRef.current.y)
    
    if (viewportDelta < virtualizationConfig.updateThreshold && visibleNodesCache.current.size > 0) {
      // Use cached visibility if viewport hasn't moved much
      const cachedNodes = nodes.filter(node => visibleNodesCache.current.get(node.id))
      return cachedNodes
    }

    // Calculate visible nodes
    const visibleNodes = nodes.filter(node => {
      const isVisible = calculateNodeVisibility(node, viewportBounds)
      visibleNodesCache.current.set(node.id, isVisible)
      return isVisible
    })

    const renderTime = performance.now() - startTime
    lastViewportRef.current = viewportBounds

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderTime,
      visibleNodes: visibleNodes.length,
      nodeCount: nodes.length
    }))

    return visibleNodes
  }, [nodes, viewportBounds, virtualizationConfig, calculateNodeVisibility])

  // Virtualized connections (only render connections between visible nodes)
  const virtualizedConnections = useMemo(() => {
    if (!virtualizationConfig.enabled) {
      return connections
    }

    const visibleNodeIds = new Set(virtualizedNodes.map(node => node.id))
    
    return connections.filter(connection => 
      visibleNodeIds.has(connection.sourceNodeId) && 
      visibleNodeIds.has(connection.targetNodeId)
    )
  }, [connections, virtualizedNodes, virtualizationConfig.enabled])

  // Chunked rendering for large datasets
  const getNodeChunks = useCallback((chunkSize: number = virtualizationConfig.chunkSize) => {
    const chunks: BaseNode[][] = []
    for (let i = 0; i < virtualizedNodes.length; i += chunkSize) {
      chunks.push(virtualizedNodes.slice(i, i + chunkSize))
    }
    return chunks
  }, [virtualizedNodes, virtualizationConfig.chunkSize])

  // Memory usage tracking (estimate)
  const estimateMemoryUsage = useCallback(() => {
    // Rough estimation based on node/connection data size
    const nodeSize = JSON.stringify(nodes[0] || {}).length || 100
    const connectionSize = JSON.stringify(connections[0] || {}).length || 50
    
    const totalNodesMemory = nodes.length * nodeSize
    const totalConnectionsMemory = connections.length * connectionSize
    
    return (totalNodesMemory + totalConnectionsMemory) / 1024 // KB
  }, [nodes, connections])

  // FPS tracking
  const trackFPS = useCallback(() => {
    frameCountRef.current++
    
    const now = performance.now()
    const elapsed = now - lastFpsUpdateRef.current
    
    if (elapsed >= 1000) { // Update FPS every second
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)
      
      setMetrics(prev => ({
        ...prev,
        fps,
        connectionCount: connections.length,
        memoryUsage: estimateMemoryUsage()
      }))
      
      frameCountRef.current = 0
      lastFpsUpdateRef.current = now
    }
  }, [connections.length, estimateMemoryUsage])

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      trackFPS()
      performanceTimerRef.current = requestAnimationFrame(monitorPerformance)
    }
    
    performanceTimerRef.current = requestAnimationFrame(monitorPerformance)
    
    return () => {
      if (performanceTimerRef.current) {
        cancelAnimationFrame(performanceTimerRef.current)
      }
    }
  }, [trackFPS])

  // Debounced viewport updates
  const debouncedViewportUpdate = useCallback(
    debounce((newBounds: ViewportBounds) => {
      // Clear cache when viewport changes significantly
      if (Math.abs(newBounds.x - lastViewportRef.current.x) > virtualizationConfig.updateThreshold * 2 ||
          Math.abs(newBounds.y - lastViewportRef.current.y) > virtualizationConfig.updateThreshold * 2) {
        visibleNodesCache.current.clear()
      }
    }, 100),
    [virtualizationConfig.updateThreshold]
  )

  // Update configuration
  const updateVirtualizationConfig = useCallback((updates: Partial<VirtualizationConfig>) => {
    setVirtualizationConfig(prev => ({
      ...prev,
      ...updates
    }))
    
    // Clear cache when config changes
    visibleNodesCache.current.clear()
  }, [])

  // Performance optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = []
    
    if (metrics.nodeCount > 1000 && !virtualizationConfig.enabled) {
      recommendations.push('Enable virtualization for better performance with large node counts')
    }
    
    if (metrics.fps < 30) {
      recommendations.push('Consider reducing visual effects or enabling virtualization')
    }
    
    if (metrics.renderTime > 16) { // 16ms = 60fps threshold
      recommendations.push('Rendering is slow - consider optimizing node components')
    }
    
    if (metrics.connectionCount > 2000) {
      recommendations.push('Large number of connections - consider grouping or sub-flows')
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 10240) { // 10MB
      recommendations.push('High memory usage - consider lazy loading or data cleanup')
    }
    
    return recommendations
  }, [metrics, virtualizationConfig.enabled])

  // Lazy loading for node data
  const lazyLoadNodeData = useCallback(async (nodeId: string) => {
    // Simulate async data loading
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        // In real implementation, this would fetch node-specific data
        resolve({
          nodeId,
          loadedAt: new Date(),
          data: `Lazy loaded data for ${nodeId}`
        })
      }, 100)
    })
  }, [])

  // Batch operations for better performance
  const batchNodeUpdates = useCallback((updates: Array<{ nodeId: string; updates: Partial<BaseNode> }>) => {
    // Process multiple node updates in a single batch
    const batchedUpdates = new Map<string, Partial<BaseNode>>()
    
    updates.forEach(({ nodeId, updates: nodeUpdates }) => {
      const existing = batchedUpdates.get(nodeId) || {}
      batchedUpdates.set(nodeId, { ...existing, ...nodeUpdates })
    })
    
    return batchedUpdates
  }, [])

  // Clear performance caches
  const clearCaches = useCallback(() => {
    visibleNodesCache.current.clear()
    setMetrics(prev => ({
      ...prev,
      renderTime: 0,
      visibleNodes: 0
    }))
  }, [])

  return {
    // Virtualized data
    virtualizedNodes,
    virtualizedConnections,
    
    // Performance metrics
    metrics,
    
    // Configuration
    virtualizationConfig,
    updateVirtualizationConfig,
    
    // Utilities
    getNodeChunks,
    getOptimizationRecommendations,
    lazyLoadNodeData,
    batchNodeUpdates,
    clearCaches,
    
    // Performance monitoring
    trackFPS,
    debouncedViewportUpdate
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

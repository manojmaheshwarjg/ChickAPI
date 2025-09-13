'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CollaboratorPresence, CollaborativeEdit, ConflictResolution } from '@/lib/grouping-types'
import { BaseNode, NodeConnection } from '@/lib/types'

export interface CollaborativeSession {
  sessionId: string
  workflowId: string
  collaborators: Map<string, CollaboratorPresence>
  isConnected: boolean
}

export interface UseCollaborativeEditingOptions {
  workflowId: string
  userId: string
  username: string
  onNodesChange?: (nodes: BaseNode[]) => void
  onConnectionsChange?: (connections: NodeConnection[]) => void
  onPresenceUpdate?: (collaborators: CollaboratorPresence[]) => void
}

// Simulated WebSocket connection for collaborative features
class MockCollaborativeService {
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private collaborators: Map<string, CollaboratorPresence> = new Map()
  private editHistory: CollaborativeEdit[] = []

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Simulate other users joining/leaving
  simulateCollaborators() {
    const mockUsers = [
      { id: 'user1', name: 'Alice', color: '#3b82f6' },
      { id: 'user2', name: 'Bob', color: '#10b981' },
      { id: 'user3', name: 'Charlie', color: '#f59e0b' }
    ]

    // Randomly add/remove collaborators
    setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
      const isJoining = Math.random() > 0.5

      if (isJoining && !this.collaborators.has(randomUser.id)) {
        const collaborator: CollaboratorPresence = {
          userId: randomUser.id,
          username: randomUser.name,
          color: randomUser.color,
          cursor: { x: Math.random() * 800, y: Math.random() * 600 },
          selection: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          lastSeen: new Date()
        }
        this.collaborators.set(randomUser.id, collaborator)
        this.emit('presence-update', Array.from(this.collaborators.values()))
      } else if (!isJoining && this.collaborators.has(randomUser.id)) {
        this.collaborators.delete(randomUser.id)
        this.emit('presence-update', Array.from(this.collaborators.values()))
      }
    }, 5000)

    // Simulate cursor movements
    setInterval(() => {
      this.collaborators.forEach(collaborator => {
        if (Math.random() > 0.7) {
          collaborator.cursor = {
            x: Math.max(0, Math.min(800, (collaborator.cursor?.x || 0) + (Math.random() - 0.5) * 100)),
            y: Math.max(0, Math.min(600, (collaborator.cursor?.y || 0) + (Math.random() - 0.5) * 100))
          }
          collaborator.lastSeen = new Date()
        }
      })
      this.emit('presence-update', Array.from(this.collaborators.values()))
    }, 1000)
  }

  addEdit(edit: CollaborativeEdit) {
    this.editHistory.push(edit)
    this.emit('edit-received', edit)
  }

  getEditHistory(): CollaborativeEdit[] {
    return this.editHistory
  }

  connect() {
    // Simulate connection
    setTimeout(() => {
      this.emit('connected', { sessionId: `session_${Date.now()}` })
      this.simulateCollaborators()
    }, 1000)
  }

  disconnect() {
    this.collaborators.clear()
    this.emit('disconnected', {})
  }
}

const collaborativeService = new MockCollaborativeService()

export function useCollaborativeEditing({
  workflowId,
  userId,
  username,
  onNodesChange,
  onConnectionsChange,
  onPresenceUpdate
}: UseCollaborativeEditingOptions) {
  const [session, setSession] = useState<CollaborativeSession | null>(null)
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])
  const [editHistory, setEditHistory] = useState<CollaborativeEdit[]>([])
  const [conflicts, setConflicts] = useState<CollaborativeEdit[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  
  const cursorPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastEditTimeRef = useRef<number>(0)
  const selectedNodesRef = useRef<string[]>([])

  // Connect to collaborative session
  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      collaborativeService.connect()
    } catch (error) {
      console.error('Failed to connect to collaborative session:', error)
      setIsConnecting(false)
    }
  }, [])

  // Disconnect from session
  const disconnect = useCallback(() => {
    if (session) {
      collaborativeService.disconnect()
      setSession(null)
      setCollaborators([])
      setEditHistory([])
    }
  }, [session])

  // Send presence update
  const updatePresence = useCallback((presence: Partial<CollaboratorPresence>) => {
    if (!session) return

    const fullPresence: CollaboratorPresence = {
      userId,
      username,
      color: '#3b82f6', // Default color
      cursor: cursorPositionRef.current,
      selection: selectedNodesRef.current,
      viewport: { x: 0, y: 0, zoom: 1 },
      lastSeen: new Date(),
      ...presence
    }

    // In a real implementation, this would send to the server
    collaborativeService.emit('presence-update-self', fullPresence)
  }, [session, userId, username])

  // Send collaborative edit
  const sendEdit = useCallback((operation: string, data: any) => {
    if (!session) return

    const edit: CollaborativeEdit = {
      id: `edit_${Date.now()}_${Math.random()}`,
      userId,
      timestamp: new Date(),
      operation: operation as any,
      data
    }

    lastEditTimeRef.current = Date.now()
    collaborativeService.addEdit(edit)
    setEditHistory(prev => [...prev, edit])
  }, [session, userId])

  // Handle incoming edits
  const handleIncomingEdit = useCallback((edit: CollaborativeEdit) => {
    // Skip our own edits
    if (edit.userId === userId) return

    // Check for conflicts (edits happening close in time)
    const timeDiff = Math.abs(edit.timestamp.getTime() - lastEditTimeRef.current)
    if (timeDiff < 1000) { // Within 1 second
      setConflicts(prev => [...prev, edit])
      return
    }

    // Apply the edit
    switch (edit.operation) {
      case 'node_add':
        // Handle node addition
        if (onNodesChange) {
          // In real implementation, would apply the change
          console.log('Collaborative node added:', edit.data)
        }
        break
      case 'node_update':
        // Handle node update
        if (onNodesChange) {
          console.log('Collaborative node updated:', edit.data)
        }
        break
      case 'node_delete':
        // Handle node deletion
        if (onNodesChange) {
          console.log('Collaborative node deleted:', edit.data)
        }
        break
      case 'connection_add':
        // Handle connection addition
        if (onConnectionsChange) {
          console.log('Collaborative connection added:', edit.data)
        }
        break
      case 'connection_delete':
        // Handle connection deletion
        if (onConnectionsChange) {
          console.log('Collaborative connection deleted:', edit.data)
        }
        break
    }

    setEditHistory(prev => [...prev, edit])
  }, [userId, onNodesChange, onConnectionsChange])

  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string, resolution: ConflictResolution['resolution']) => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) return

    const conflictResolution: ConflictResolution = {
      conflictId,
      resolution,
      resolvedBy: userId,
      resolvedAt: new Date()
    }

    if (resolution === 'merge' || resolution === 'overwrite') {
      // Apply the conflicting edit
      handleIncomingEdit(conflict)
    }
    // 'discard' means we do nothing
    // 'manual' would open a merge editor

    setConflicts(prev => prev.filter(c => c.id !== conflictId))
    console.log('Conflict resolved:', conflictResolution)
  }, [conflicts, userId, handleIncomingEdit])

  // Track cursor movement
  const updateCursor = useCallback((x: number, y: number) => {
    cursorPositionRef.current = { x, y }
    updatePresence({ cursor: { x, y } })
  }, [updatePresence])

  // Track node selection
  const updateSelection = useCallback((nodeIds: string[]) => {
    selectedNodesRef.current = nodeIds
    updatePresence({ selection: nodeIds })
  }, [updatePresence])

  // Get active collaborators (excluding current user)
  const getActiveCollaborators = useCallback(() => {
    return collaborators.filter(c => c.userId !== userId)
  }, [collaborators, userId])

  // Get collaborator by color for cursor rendering
  const getCollaboratorByColor = useCallback((color: string) => {
    return collaborators.find(c => c.color === color)
  }, [collaborators])

  // Setup event listeners
  useEffect(() => {
    const handleConnected = (data: { sessionId: string }) => {
      setSession({
        sessionId: data.sessionId,
        workflowId,
        collaborators: new Map(),
        isConnected: true
      })
      setIsConnecting(false)
    }

    const handleDisconnected = () => {
      setSession(null)
      setCollaborators([])
      setIsConnecting(false)
    }

    const handlePresenceUpdate = (newCollaborators: CollaboratorPresence[]) => {
      setCollaborators(newCollaborators)
      onPresenceUpdate?.(newCollaborators)
    }

    const handleEditReceived = (edit: CollaborativeEdit) => {
      handleIncomingEdit(edit)
    }

    collaborativeService.on('connected', handleConnected)
    collaborativeService.on('disconnected', handleDisconnected)
    collaborativeService.on('presence-update', handlePresenceUpdate)
    collaborativeService.on('edit-received', handleEditReceived)

    return () => {
      collaborativeService.off('connected', handleConnected)
      collaborativeService.off('disconnected', handleDisconnected)
      collaborativeService.off('presence-update', handlePresenceUpdate)
      collaborativeService.off('edit-received', handleEditReceived)
    }
  }, [workflowId, onPresenceUpdate, handleIncomingEdit])

  // Auto-connect on mount
  useEffect(() => {
    if (!session && !isConnecting) {
      connect()
    }
  }, [session, isConnecting, connect])

  return {
    session,
    collaborators: getActiveCollaborators(),
    editHistory,
    conflicts,
    isConnecting,
    connect,
    disconnect,
    updatePresence,
    updateCursor,
    updateSelection,
    sendEdit,
    resolveConflict,
    getCollaboratorByColor
  }
}

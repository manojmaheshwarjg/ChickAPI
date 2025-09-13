'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { KeyboardShortcut, ShortcutAction } from '@/lib/grouping-types'

export interface KeyboardShortcutManager {
  shortcuts: Map<string, KeyboardShortcut>
  contexts: Set<string>
  listeners: Map<string, (action: ShortcutAction) => void>
}

export interface UseAdvancedKeyboardShortcutsOptions {
  context?: string
  disabled?: boolean
  onShortcutTriggered?: (shortcut: KeyboardShortcut, action: ShortcutAction) => void
}

// Default keyboard shortcuts
const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation shortcuts
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Zoom into the canvas',
    keys: ['ctrl', '+'],
    action: 'canvas.zoom-in',
    category: 'navigation',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Zoom out of the canvas',
    keys: ['ctrl', '-'],
    action: 'canvas.zoom-out',
    category: 'navigation',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'zoom-fit',
    name: 'Fit to Screen',
    description: 'Fit all nodes to screen',
    keys: ['ctrl', '0'],
    action: 'canvas.zoom-fit',
    category: 'view',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'center-view',
    name: 'Center View',
    description: 'Center the canvas view',
    keys: ['ctrl', 'shift', 'c'],
    action: 'canvas.center',
    category: 'navigation',
    context: 'canvas',
    customizable: true
  },

  // Editing shortcuts
  {
    id: 'select-all',
    name: 'Select All',
    description: 'Select all nodes',
    keys: ['ctrl', 'a'],
    action: 'edit.select-all',
    category: 'editing',
    context: 'canvas',
    customizable: false
  },
  {
    id: 'copy',
    name: 'Copy',
    description: 'Copy selected nodes',
    keys: ['ctrl', 'c'],
    action: 'edit.copy',
    category: 'editing',
    context: 'canvas',
    customizable: false
  },
  {
    id: 'paste',
    name: 'Paste',
    description: 'Paste copied nodes',
    keys: ['ctrl', 'v'],
    action: 'edit.paste',
    category: 'editing',
    context: 'canvas',
    customizable: false
  },
  {
    id: 'duplicate',
    name: 'Duplicate',
    description: 'Duplicate selected nodes',
    keys: ['ctrl', 'd'],
    action: 'edit.duplicate',
    category: 'editing',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'delete',
    name: 'Delete',
    description: 'Delete selected nodes',
    keys: ['Delete'],
    action: 'edit.delete',
    category: 'editing',
    context: 'canvas',
    customizable: false
  },
  {
    id: 'undo',
    name: 'Undo',
    description: 'Undo last action',
    keys: ['ctrl', 'z'],
    action: 'edit.undo',
    category: 'editing',
    context: 'global',
    customizable: false
  },
  {
    id: 'redo',
    name: 'Redo',
    description: 'Redo last undone action',
    keys: ['ctrl', 'shift', 'z'],
    action: 'edit.redo',
    category: 'editing',
    context: 'global',
    customizable: false
  },

  // Grouping shortcuts
  {
    id: 'group-nodes',
    name: 'Group Nodes',
    description: 'Group selected nodes',
    keys: ['ctrl', 'g'],
    action: 'group.create',
    category: 'grouping',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'ungroup-nodes',
    name: 'Ungroup Nodes',
    description: 'Ungroup selected group',
    keys: ['ctrl', 'shift', 'g'],
    action: 'group.ungroup',
    category: 'grouping',
    context: 'group',
    customizable: true
  },
  {
    id: 'toggle-group-collapse',
    name: 'Toggle Group Collapse',
    description: 'Collapse or expand selected group',
    keys: ['space'],
    action: 'group.toggle-collapse',
    category: 'grouping',
    context: 'group',
    customizable: true
  },
  {
    id: 'enter-group',
    name: 'Enter Group',
    description: 'Enter group for editing',
    keys: ['Enter'],
    action: 'group.enter',
    category: 'grouping',
    context: 'group',
    customizable: true
  },
  {
    id: 'exit-group',
    name: 'Exit Group',
    description: 'Exit group editing mode',
    keys: ['Escape'],
    action: 'group.exit',
    category: 'grouping',
    context: 'group',
    customizable: true
  },

  // Execution shortcuts
  {
    id: 'run-workflow',
    name: 'Run Workflow',
    description: 'Execute the current workflow',
    keys: ['F5'],
    action: 'execution.run',
    category: 'execution',
    context: 'global',
    customizable: true
  },
  {
    id: 'stop-workflow',
    name: 'Stop Workflow',
    description: 'Stop workflow execution',
    keys: ['shift', 'F5'],
    action: 'execution.stop',
    category: 'execution',
    context: 'global',
    customizable: true
  },
  {
    id: 'debug-workflow',
    name: 'Debug Workflow',
    description: 'Start workflow in debug mode',
    keys: ['F9'],
    action: 'execution.debug',
    category: 'execution',
    context: 'global',
    customizable: true
  },
  {
    id: 'step-over',
    name: 'Step Over',
    description: 'Step to next node in debug mode',
    keys: ['F10'],
    action: 'execution.step-over',
    category: 'execution',
    context: 'global',
    customizable: true
  },

  // View shortcuts
  {
    id: 'toggle-minimap',
    name: 'Toggle Minimap',
    description: 'Show/hide the minimap',
    keys: ['ctrl', 'm'],
    action: 'view.toggle-minimap',
    category: 'view',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'toggle-grid',
    name: 'Toggle Grid',
    description: 'Show/hide the grid',
    keys: ['ctrl', 'shift', 'g'],
    action: 'view.toggle-grid',
    category: 'view',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'toggle-console',
    name: 'Toggle Console',
    description: 'Show/hide the console panel',
    keys: ['ctrl', '`'],
    action: 'view.toggle-console',
    category: 'view',
    context: 'global',
    customizable: true
  },
  {
    id: 'toggle-properties',
    name: 'Toggle Properties',
    description: 'Show/hide the properties panel',
    keys: ['ctrl', 'p'],
    action: 'view.toggle-properties',
    category: 'view',
    context: 'global',
    customizable: true
  },

  // Node creation shortcuts
  {
    id: 'add-http-node',
    name: 'Add HTTP Node',
    description: 'Quickly add an HTTP request node',
    keys: ['ctrl', 'shift', 'h'],
    action: 'node.add-http',
    category: 'editing',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'add-transform-node',
    name: 'Add Transform Node',
    description: 'Quickly add a data transform node',
    keys: ['ctrl', 'shift', 't'],
    action: 'node.add-transform',
    category: 'editing',
    context: 'canvas',
    customizable: true
  },
  {
    id: 'add-condition-node',
    name: 'Add Condition Node',
    description: 'Quickly add a condition node',
    keys: ['ctrl', 'shift', 'i'],
    action: 'node.add-condition',
    category: 'editing',
    context: 'canvas',
    customizable: true
  },

  // Advanced shortcuts
  {
    id: 'search-nodes',
    name: 'Search Nodes',
    description: 'Search for nodes in the workflow',
    keys: ['ctrl', 'f'],
    action: 'search.nodes',
    category: 'navigation',
    context: 'global',
    customizable: true
  },
  {
    id: 'command-palette',
    name: 'Command Palette',
    description: 'Open the command palette',
    keys: ['ctrl', 'shift', 'p'],
    action: 'ui.command-palette',
    category: 'navigation',
    context: 'global',
    customizable: true
  },
  {
    id: 'quick-run',
    name: 'Quick Run Selected',
    description: 'Run only selected nodes',
    keys: ['ctrl', 'r'],
    action: 'execution.run-selected',
    category: 'execution',
    context: 'canvas',
    customizable: true
  }
]

export function useAdvancedKeyboardShortcuts({
  context = 'global',
  disabled = false,
  onShortcutTriggered
}: UseAdvancedKeyboardShortcutsOptions = {}) {
  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(
    new Map(defaultShortcuts.map(s => [s.id, s]))
  )
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [shortcutHistory, setShortcutHistory] = useState<Array<{ shortcut: KeyboardShortcut; timestamp: Date }>>([])
  
  const shortcutManagerRef = useRef<KeyboardShortcutManager>({
    shortcuts: new Map(),
    contexts: new Set([context]),
    listeners: new Map()
  })

  // Normalize key names for consistency
  const normalizeKey = useCallback((key: string): string => {
    const keyMap: Record<string, string> = {
      'Control': 'ctrl',
      'Meta': 'cmd',
      'Alt': 'alt',
      'Shift': 'shift',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      ' ': 'space'
    }
    return keyMap[key] || key.toLowerCase()
  }, [])

  // Check if key combination matches shortcut
  const matchesShortcut = useCallback((pressedKeys: Set<string>, shortcut: KeyboardShortcut): boolean => {
    if (pressedKeys.size !== shortcut.keys.length) return false
    
    const normalizedPressed = Array.from(pressedKeys).map(normalizeKey).sort()
    const normalizedShortcut = shortcut.keys.map(normalizeKey).sort()
    
    return normalizedPressed.every((key, index) => key === normalizedShortcut[index])
  }, [normalizeKey])

  // Get shortcuts for current context
  const getContextShortcuts = useCallback((currentContext: string): KeyboardShortcut[] => {
    return Array.from(shortcuts.values()).filter(shortcut => 
      shortcut.context === 'global' || shortcut.context === currentContext
    )
  }, [shortcuts])

  // Handle keydown event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    const normalizedKey = normalizeKey(event.key)
    
    // Update pressed keys
    setPressedKeys(prev => {
      const newPressed = new Set(prev)
      newPressed.add(normalizedKey)
      
      // Check for shortcut matches
      const contextShortcuts = getContextShortcuts(context)
      for (const shortcut of contextShortcuts) {
        if (matchesShortcut(newPressed, shortcut)) {
          event.preventDefault()
          event.stopPropagation()
          
          const action: ShortcutAction = {
            type: shortcut.action,
            payload: { shortcut, context, timestamp: new Date() }
          }
          
          // Add to history
          setShortcutHistory(prev => [...prev.slice(-19), { shortcut, timestamp: new Date() }])
          
          // Trigger callback
          onShortcutTriggered?.(shortcut, action)
          
          return newPressed
        }
      }
      
      return newPressed
    })
  }, [disabled, context, getContextShortcuts, matchesShortcut, onShortcutTriggered, normalizeKey])

  // Handle keyup event
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    const normalizedKey = normalizeKey(event.key)
    setPressedKeys(prev => {
      const newPressed = new Set(prev)
      newPressed.delete(normalizedKey)
      return newPressed
    })
  }, [disabled, normalizeKey])

  // Clear all pressed keys on focus loss
  const handleBlur = useCallback(() => {
    setPressedKeys(new Set())
  }, [])

  // Add custom shortcut
  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => new Map(prev.set(shortcut.id, shortcut)))
  }, [])

  // Remove shortcut
  const removeShortcut = useCallback((shortcutId: string) => {
    setShortcuts(prev => {
      const newShortcuts = new Map(prev)
      newShortcuts.delete(shortcutId)
      return newShortcuts
    })
  }, [])

  // Update shortcut
  const updateShortcut = useCallback((shortcutId: string, updates: Partial<KeyboardShortcut>) => {
    setShortcuts(prev => {
      const shortcut = prev.get(shortcutId)
      if (!shortcut || !shortcut.customizable) return prev
      
      const updatedShortcut = { ...shortcut, ...updates }
      return new Map(prev.set(shortcutId, updatedShortcut))
    })
  }, [])

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: KeyboardShortcut['category']) => {
    return Array.from(shortcuts.values()).filter(shortcut => shortcut.category === category)
  }, [shortcuts])

  // Get all shortcuts as array
  const getAllShortcuts = useCallback(() => {
    return Array.from(shortcuts.values())
  }, [shortcuts])

  // Get shortcut by action
  const getShortcutByAction = useCallback((action: string) => {
    return Array.from(shortcuts.values()).find(shortcut => shortcut.action === action)
  }, [shortcuts])

  // Format shortcut keys for display
  const formatShortcutKeys = useCallback((keys: string[]) => {
    const formatMap: Record<string, string> = {
      'ctrl': 'Ctrl',
      'cmd': 'Cmd',
      'alt': 'Alt',
      'shift': 'Shift',
      'space': 'Space'
    }
    
    return keys.map(key => formatMap[key] || key.charAt(0).toUpperCase() + key.slice(1)).join(' + ')
  }, [])

  // Check if shortcut is currently pressed
  const isShortcutPressed = useCallback((shortcut: KeyboardShortcut) => {
    return matchesShortcut(pressedKeys, shortcut)
  }, [pressedKeys, matchesShortcut])

  // Reset to default shortcuts
  const resetToDefaults = useCallback(() => {
    setShortcuts(new Map(defaultShortcuts.map(s => [s.id, s])))
    setShortcutHistory([])
  }, [])

  // Export shortcuts configuration
  const exportShortcuts = useCallback(() => {
    const customShortcuts = Array.from(shortcuts.values()).filter(s => s.customizable)
    return JSON.stringify(customShortcuts, null, 2)
  }, [shortcuts])

  // Import shortcuts configuration
  const importShortcuts = useCallback((configJson: string) => {
    try {
      const importedShortcuts: KeyboardShortcut[] = JSON.parse(configJson)
      const newShortcuts = new Map(shortcuts)
      
      importedShortcuts.forEach(shortcut => {
        if (shortcut.customizable) {
          newShortcuts.set(shortcut.id, shortcut)
        }
      })
      
      setShortcuts(newShortcuts)
      return true
    } catch (error) {
      console.error('Failed to import shortcuts:', error)
      return false
    }
  }, [shortcuts])

  // Setup event listeners
  useEffect(() => {
    if (disabled) return

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('blur', handleBlur)
    }
  }, [disabled, handleKeyDown, handleKeyUp, handleBlur])

  return {
    shortcuts: getAllShortcuts(),
    pressedKeys: Array.from(pressedKeys),
    shortcutHistory,
    addShortcut,
    removeShortcut,
    updateShortcut,
    getShortcutsByCategory,
    getShortcutByAction,
    formatShortcutKeys,
    isShortcutPressed,
    resetToDefaults,
    exportShortcuts,
    importShortcuts,
    getContextShortcuts: () => getContextShortcuts(context)
  }
}

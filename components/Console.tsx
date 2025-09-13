'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  XMarkIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

interface ConsoleProps {
  onClose: () => void
  logs?: LogEntry[]
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error' | 'success'
  message: string
  nodeId?: string
  data?: any
}

export default function Console({ onClose, logs = [] }: ConsoleProps) {
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Mock logs for demonstration - use useMemo to prevent hydration issues
  const initialLogs = useMemo(() => [
    {
      id: '1',
      timestamp: new Date(),
      level: 'info' as const,
      message: 'Workflow execution started',
    },
    {
      id: '2',
      timestamp: new Date(),
      level: 'debug' as const,
      message: 'Initializing node: http-get-1',
      nodeId: 'http-get-1'
    },
    {
      id: '3',
      timestamp: new Date(),
      level: 'success' as const,
      message: 'HTTP Request completed successfully (200 OK)',
      nodeId: 'http-get-1',
      data: { status: 200, responseTime: 234 }
    }
  ], [])

  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>(initialLogs)

  // Set isClient flag after mounting to handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (logs && logs.length > 0) {
      setConsoleLogs(logs)
    }
  }, [logs])

  useEffect(() => {
    if (autoScroll) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs, autoScroll])

  const filteredLogs = consoleLogs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const clearConsole = () => {
    setConsoleLogs([])
  }

  const exportLogs = () => {
    const logsText = consoleLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n')
    
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chickapi-logs-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'text-gray-500'
      case 'info': return 'text-blue-600'
      case 'warn': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      case 'success': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-50'
      case 'info': return 'bg-blue-50'
      case 'warn': return 'bg-yellow-50'
      case 'error': return 'bg-red-50'
      case 'success': return 'bg-green-50'
      default: return 'bg-gray-50'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Console</h3>
          
          {/* Filter buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All ({consoleLogs.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 text-xs rounded ${filter === 'error' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Errors ({consoleLogs.filter(l => l.level === 'error').length})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 text-xs rounded ${filter === 'warn' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Warnings ({consoleLogs.filter(l => l.level === 'warn').length})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-2 py-1 text-xs rounded ${filter === 'info' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Info ({consoleLogs.filter(l => l.level === 'info').length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            Auto-scroll
          </label>

          {/* Action buttons */}
          <button
            onClick={exportLogs}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Export logs"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={clearConsole}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Clear console"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close console"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Console content */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-gray-50">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No logs to display</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`px-3 py-2 rounded ${getLevelBgColor(log.level)} hover:bg-opacity-75 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  {/* Timestamp */}
                  <span className="text-gray-400 whitespace-nowrap">
                    {isClient ? log.timestamp.toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : '--:--:--'}
                  </span>

                  {/* Level badge */}
                  <span className={`font-semibold uppercase ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>

                  {/* Node ID */}
                  {log.nodeId && (
                    <span className="text-gray-500">
                      [{log.nodeId}]
                    </span>
                  )}

                  {/* Message */}
                  <span className="flex-1 text-gray-800 break-all">
                    {log.message}
                  </span>
                </div>

                {/* Data preview */}
                {log.data && (
                  <details className="mt-2 ml-20">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Data
                    </summary>
                    <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-xs text-gray-500">
          Showing {filteredLogs.length} of {consoleLogs.length} logs
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Connected
          </span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  )
}

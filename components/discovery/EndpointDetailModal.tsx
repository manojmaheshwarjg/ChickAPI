'use client'

import { useState } from 'react'
import { Copy, Code, Shield, AlertTriangle } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'

interface EndpointDetailModalProps {
  endpoint: any
  open: boolean
  onClose: () => void
}

export default function EndpointDetailModal({ endpoint, open, onClose }: EndpointDetailModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCurl = () => {
    let curl = `curl -X ${endpoint.method} "${endpoint.url}"`
    
    if (endpoint.authentication?.type === 'bearer') {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`
    }
    
    if (endpoint.parameters) {
      endpoint.parameters
        .filter((p: any) => p.in === 'header')
        .forEach((p: any) => {
          curl += ` \\\n  -H "${p.name}: ${p.example || 'value'}"`
        })
    }
    
    if (endpoint.requestBody) {
      curl += ` \\\n  -H "Content-Type: ${endpoint.requestBody.contentType || 'application/json'}"`
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody.examples?.[0] || {}, null, 2)}'`
    }
    
    handleCopy(curl)
  }

  const renderParameterTable = (parameters: any[], type: string) => {
    const filtered = parameters.filter(p => p.in === type)
    if (filtered.length === 0) return null

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {type.charAt(0).toUpperCase() + type.slice(1)} Parameters
        </h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Required</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((param: any, idx: number) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{param.type || 'string'}</td>
                <td className="px-4 py-2 text-sm">
                  {param.required ? (
                    <span className="text-red-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {param.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      PATCH: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <Badge
              variant={endpoint.method === 'GET' ? 'success' : 
                      endpoint.method === 'POST' ? 'default' : 
                      endpoint.method === 'PUT' ? 'warning' : 
                      endpoint.method === 'DELETE' ? 'destructive' : 
                      'outline'}
              className="font-mono"
            >
              {endpoint.method}
            </Badge>
            <DialogTitle className="text-lg font-mono">{endpoint.url}</DialogTitle>
          </div>
          {endpoint.summary && (
            <p className="text-sm text-muted-foreground">{endpoint.summary}</p>
          )}
        </DialogHeader>

        {/* Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Description */}
              {endpoint.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{endpoint.description}</p>
                </div>
              )}

              {/* Tags */}
              {endpoint.tags && endpoint.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {endpoint.tags.map((tag: string) => (
                      <span key={tag} className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Metadata</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Source</dt>
                    <dd className="mt-1 text-sm text-gray-900">{endpoint.source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Discovered At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(endpoint.discoveredAt).toLocaleString()}
                    </dd>
                  </div>
                  {endpoint.complexity && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Complexity Score</dt>
                      <dd className="mt-1 text-sm text-gray-900">{endpoint.complexity.toFixed(1)}</dd>
                    </div>
                  )}
                  {endpoint.deprecated && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Deprecated
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleExportCurl}
                    variant="outline"
                    size="sm"
                  >
                    <Code className="h-4 w-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy as cURL'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="request" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Parameters */}
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Parameters</h3>
                  {renderParameterTable(endpoint.parameters, 'path')}
                  {renderParameterTable(endpoint.parameters, 'query')}
                  {renderParameterTable(endpoint.parameters, 'header')}
                </div>
              )}

              {/* Request Body */}
              {endpoint.requestBody && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Request Body</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Content-Type: {endpoint.requestBody.contentType || 'application/json'}
                      </span>
                      {endpoint.requestBody.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                    </div>
                    {endpoint.requestBody.schema && (
                      <pre className="text-xs text-gray-800 overflow-x-auto">
                        {JSON.stringify(endpoint.requestBody.schema, null, 2)}
                      </pre>
                    )}
                    {endpoint.requestBody.examples && endpoint.requestBody.examples.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Example</h4>
                        <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-3 rounded border">
                          {JSON.stringify(endpoint.requestBody.examples[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-6 mt-6">
            <div className="space-y-6">
              {endpoint.responses && endpoint.responses.length > 0 ? (
                endpoint.responses.map((response: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded ${
                        response.statusCode < 400
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {response.statusCode}
                      </span>
                      <span className="text-sm text-gray-600">
                        {response.contentType || 'application/json'}
                      </span>
                    </div>
                    {response.description && (
                      <p className="text-sm text-gray-600 mb-3">{response.description}</p>
                    )}
                    {response.schema && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Schema</h4>
                        <pre className="text-xs text-gray-800 overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(response.schema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {response.examples && response.examples.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Example</h4>
                        <pre className="text-xs text-gray-800 overflow-x-auto bg-gray-50 p-3 rounded">
                          {JSON.stringify(response.examples[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No response information available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Authentication */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Authentication</h3>
                {endpoint.authentication ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {endpoint.authentication.type.toUpperCase()}
                      </span>
                      {endpoint.authentication.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                    </div>
                    {endpoint.authentication.description && (
                      <p className="text-sm text-gray-600">{endpoint.authentication.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">No authentication required</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Limiting */}
              {endpoint.rateLimit && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Rate Limiting</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Limit</dt>
                        <dd className="mt-1 text-sm text-gray-900">{endpoint.rateLimit.limit} requests</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Window</dt>
                        <dd className="mt-1 text-sm text-gray-900">{endpoint.rateLimit.window}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* Security Issues */}
              {endpoint.securityIssues && endpoint.securityIssues.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Potential Security Issues</h3>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {endpoint.securityIssues.map((issue: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-red-800">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

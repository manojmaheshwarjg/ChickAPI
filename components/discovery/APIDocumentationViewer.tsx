'use client'

import React, { useState } from 'react'
import {
  FileText, Globe, Code, Download, Copy, ExternalLink,
  CheckCircle, AlertTriangle, Info, Zap, Shield,
  Database, Key, Lock, Users, ChevronDown, ChevronRight,
  Layers, GitBranch, Play, Settings, Eye, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface APIDocumentation {
  id: string
  name: string
  version: string
  description: string
  baseUrl: string
  authentication: {
    type: string
    description: string
    schemes: Array<{
      type: string
      name: string
      location: string
      description: string
    }>
  }
  endpoints: Array<{
    id: string
    method: string
    path: string
    summary: string
    description: string
    tags: string[]
    parameters: Array<{
      name: string
      in: string
      required: boolean
      type: string
      description: string
      example?: any
    }>
    requestBody?: {
      required: boolean
      content: Record<string, {
        schema: any
        examples?: Record<string, any>
      }>
    }
    responses: Record<string, {
      description: string
      content?: Record<string, {
        schema: any
        examples?: Record<string, any>
      }>
    }>
    security?: Array<Record<string, string[]>>
    deprecated?: boolean
  }>
  schemas: Record<string, any>
  tags: Array<{
    name: string
    description: string
  }>
  externalDocs?: {
    description: string
    url: string
  }
  contact?: {
    name: string
    url: string
    email: string
  }
  license?: {
    name: string
    url: string
  }
}

interface Props {
  documentation: APIDocumentation
  onClose: () => void
}

export default function APIDocumentationViewer({ documentation, onClose }: Props) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200'
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PUT': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200'
      case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oauth2': return <Shield className="w-4 h-4" />
      case 'apikey': return <Key className="w-4 h-4" />
      case 'http': return <Lock className="w-4 h-4" />
      case 'openidconnect': return <Users className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const filteredEndpoints = documentation.endpoints.filter(endpoint => 
    selectedTag === 'all' || endpoint.tags.includes(selectedTag)
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const generateCodeSnippet = (endpoint: any, language: string = 'curl') => {
    const url = `${documentation.baseUrl}${endpoint.path}`
    
    switch (language) {
      case 'curl':
        return `curl -X ${endpoint.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
      
      case 'javascript':
        return `fetch('${url}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})`
      
      case 'python':
        return `import requests

response = requests.${endpoint.method.toLowerCase()}('${url}', 
  headers={
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
)`
      
      default:
        return `// ${language} example not available`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{documentation.name}</h2>
            <Badge variant="outline" className="text-xs">
              v{documentation.version}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">{documentation.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span className="font-mono">{documentation.baseUrl}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          {/* Overview Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('overview')}
              className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Overview
              </div>
              {expandedSections.has('overview') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedSections.has('overview') && (
              <div className="ml-6 mt-2 space-y-1">
                <a href="#authentication" className="block py-1 text-sm text-gray-600 hover:text-gray-900">
                  Authentication
                </a>
                <a href="#schemas" className="block py-1 text-sm text-gray-600 hover:text-gray-900">
                  Data Models
                </a>
                <a href="#errors" className="block py-1 text-sm text-gray-600 hover:text-gray-900">
                  Error Codes
                </a>
              </div>
            )}
          </div>

          {/* Endpoints Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Endpoints</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    {selectedTag === 'all' ? 'All' : selectedTag}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedTag('all')}>
                    All Tags
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {documentation.tags.map((tag) => (
                    <DropdownMenuItem key={tag.name} onClick={() => setSelectedTag(tag.name)}>
                      {tag.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-1">
              {filteredEndpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                  className={`flex items-center gap-2 w-full p-2 text-left text-xs rounded-md hover:bg-gray-50 ${
                    selectedEndpoint === endpoint.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <Badge className={`text-xs px-1.5 py-0.5 ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </Badge>
                  <span className="font-mono text-gray-600 truncate flex-1">
                    {endpoint.path}
                  </span>
                  {endpoint.deprecated && (
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">API Documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedEndpoint ? (
            // Overview Content
            <div className="max-w-4xl space-y-8">
              {/* API Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{documentation.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{documentation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Base URL</span>
                    </div>
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {documentation.baseUrl}
                    </code>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">Version</span>
                    </div>
                    <span className="text-sm font-mono text-gray-900">
                      v{documentation.version}
                    </span>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">Endpoints</span>
                    </div>
                    <span className="text-sm font-mono text-gray-900">
                      {documentation.endpoints.length}
                    </span>
                  </Card>
                </div>
              </div>

              {/* Authentication */}
              <div id="authentication">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {getAuthIcon(documentation.authentication.type)}
                    <span className="font-medium text-gray-900">
                      {documentation.authentication.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{documentation.authentication.description}</p>
                  
                  {documentation.authentication.schemes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Available Schemes:</h4>
                      {documentation.authentication.schemes.map((scheme, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {scheme.type}
                            </Badge>
                            <span className="font-medium text-gray-900">{scheme.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">{scheme.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Rate Limits */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-600">Requests per minute:</span>
                      <span className="font-mono text-gray-900">1000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">Burst limit:</span>
                      <span className="font-mono text-gray-900">100</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Info */}
              {documentation.contact && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
                  <Card className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{documentation.contact.name}</span>
                      </div>
                      {documentation.contact.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Email:</span>
                          <a href={`mailto:${documentation.contact.email}`} className="text-blue-600 hover:underline">
                            {documentation.contact.email}
                          </a>
                        </div>
                      )}
                      {documentation.contact.url && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-gray-600" />
                          <a href={documentation.contact.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Documentation
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            // Endpoint Details
            <EndpointDetails
              endpoint={documentation.endpoints.find(ep => ep.id === selectedEndpoint)!}
              baseUrl={documentation.baseUrl}
              getMethodColor={getMethodColor}
              generateCodeSnippet={generateCodeSnippet}
              copyToClipboard={copyToClipboard}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Endpoint Details Component
function EndpointDetails({
  endpoint,
  baseUrl,
  getMethodColor,
  generateCodeSnippet,
  copyToClipboard
}: {
  endpoint: any
  baseUrl: string
  getMethodColor: (method: string) => string
  generateCodeSnippet: (endpoint: any, language: string) => string
  copyToClipboard: (text: string) => Promise<void>
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl')

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge className={`px-3 py-1 ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </Badge>
          <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
          {endpoint.deprecated && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Deprecated
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{endpoint.summary}</h1>
        <p className="text-gray-600">{endpoint.description}</p>
        
        {endpoint.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">Tags:</span>
            {endpoint.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Parameters */}
      {endpoint.parameters.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parameters</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {endpoint.parameters.map((param: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{param.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {param.in}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{param.type}</td>
                      <td className="px-4 py-3">
                        {param.required ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Request Body */}
      {endpoint.requestBody && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Body</h2>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Required:</span>
              {endpoint.requestBody.required ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border border-gray-300 rounded" />
              )}
            </div>
            
            {/* Content types */}
            <div className="space-y-4">
              {Object.entries(endpoint.requestBody.content).map(([contentType, content]: [string, any]) => (
                <div key={contentType}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {contentType}
                    </Badge>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {JSON.stringify(content.schema, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Responses */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Responses</h2>
        <div className="space-y-4">
          {Object.entries(endpoint.responses).map(([statusCode, response]: [string, any]) => (
            <Card key={statusCode} className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  className={`px-2 py-1 ${
                    statusCode.startsWith('2') ? 'bg-green-100 text-green-800' :
                    statusCode.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                    statusCode.startsWith('5') ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusCode}
                </Badge>
                <span className="font-medium text-gray-900">{response.description}</span>
              </div>
              
              {response.content && (
                <div className="space-y-3">
                  {Object.entries(response.content).map(([contentType, content]: [string, any]) => (
                    <div key={contentType}>
                      <Badge variant="outline" className="text-xs mb-2">
                        {contentType}
                      </Badge>
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                        {JSON.stringify(content.schema, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Examples</h2>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedLanguage}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedLanguage('curl')}>
                  cURL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLanguage('javascript')}>
                  JavaScript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLanguage('python')}>
                  Python
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(generateCodeSnippet(endpoint, selectedLanguage))}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {generateCodeSnippet(endpoint, selectedLanguage)}
          </pre>
        </Card>
      </div>

      {/* Try It Out */}
      <div>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Try it out</h3>
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              Send Request
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Test this endpoint directly from the documentation with your API credentials.
          </p>
        </Card>
      </div>
    </div>
  )
}
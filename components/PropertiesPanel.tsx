'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui'

interface PropertiesPanelProps {
  node: any | null
  onClose: () => void
  onNodeUpdate?: (node: any) => void
}

export default function PropertiesPanel({ node, onClose, onNodeUpdate }: PropertiesPanelProps) {
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (node) {
      setConfig(node.config || {})
    }
  }, [node])

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    if (onNodeUpdate && node) {
      onNodeUpdate({ ...node, config: newConfig })
    }
  }

  const handleMetadataChange = (key: string, value: any) => {
    if (onNodeUpdate && node) {
      onNodeUpdate({ 
        ...node, 
        metadata: { ...node.metadata, [key]: value } 
      })
    }
  }

  const getNodeStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success'
      case 'error': return 'destructive'
      case 'warning': return 'warning'
      case 'running': return 'default'
      default: return 'default'
    }
  }

  if (!node) {
    return (
      <Card className="w-80 h-full border-l border-r-0 border-t-0 border-b-0 rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Properties</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a node to view properties</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80 h-full border-l border-r-0 border-t-0 border-b-0 rounded-none flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-sm">Node Properties</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${node.metadata?.color || 'bg-muted'}`}></div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {node.type}
            </Badge>
            {node.status && (
              <Badge variant={getNodeStatusVariant(node.status) as any} className="text-xs">
                {node.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        <Accordion type="multiple" defaultValue={["basic", "configuration"]} className="w-full">
          {/* Basic Info Section */}
          <AccordionItem value="basic">
            <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
              Basic Info
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-id" className="text-xs">Node ID</Label>
                  <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
                    {node.id}
                  </div>
                </div>
                <div>
                  <Label htmlFor="node-title" className="text-xs">Title</Label>
                  <Input
                    id="node-title"
                    value={node.metadata?.title || ''}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className="h-8 text-sm mt-1"
                    placeholder="Node title"
                  />
                </div>
                <div>
                  <Label htmlFor="node-description" className="text-xs">Description</Label>
                  <Textarea
                    id="node-description"
                    value={node.metadata?.description || ''}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    rows={2}
                    className="text-sm mt-1 resize-none"
                    placeholder="Node description"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configuration Section */}
          <AccordionItem value="configuration">
            <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
              Configuration
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* HTTP Request Configuration */}
                {node.type?.startsWith('http-') && (
                  <>
                    <div>
                      <Label htmlFor="method" className="text-xs">Method</Label>
                      <Select value={config.method || 'GET'} onValueChange={(value) => handleConfigChange('method', value)}>
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-xs">URL</Label>
                      <Input
                        id="url"
                        value={config.url || ''}
                        onChange={(e) => handleConfigChange('url', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="https://api.example.com/endpoint"
                      />
                    </div>
                    <div>
                      <Label htmlFor="headers" className="text-xs">Headers (JSON)</Label>
                      <Textarea
                        id="headers"
                        value={config.headers || '{}'}
                        onChange={(e) => handleConfigChange('headers', e.target.value)}
                        rows={3}
                        className="text-sm mt-1 font-mono resize-none"
                        placeholder='{"Content-Type": "application/json"}'
                      />
                    </div>
                    {(node.type === 'http-post' || node.type === 'http-put' || node.type === 'http-patch') && (
                      <div>
                        <Label htmlFor="body" className="text-xs">Request Body</Label>
                        <Textarea
                          id="body"
                          value={config.body || ''}
                          onChange={(e) => handleConfigChange('body', e.target.value)}
                          rows={3}
                          className="text-sm mt-1 font-mono resize-none"
                          placeholder='{"key": "value"}'
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="timeout" className="text-xs">Timeout (ms)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={config.timeout || 30000}
                        onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value) || 30000)}
                        className="h-8 text-sm mt-1"
                        placeholder="30000"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="follow-redirects"
                        checked={config.followRedirects !== false}
                        onCheckedChange={(checked) => handleConfigChange('followRedirects', checked)}
                      />
                      <Label htmlFor="follow-redirects" className="text-xs">Follow Redirects</Label>
                    </div>
                  </>
                )}

                {/* JSON Path Configuration */}
                {node.type === 'json-path' && (
                  <>
                    <div>
                      <Label htmlFor="path" className="text-xs">JSONPath Expression</Label>
                      <Input
                        id="path"
                        value={config.path || '$'}
                        onChange={(e) => handleConfigChange('path', e.target.value)}
                        className="h-8 text-sm mt-1 font-mono"
                        placeholder="$.data[0].id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultValue" className="text-xs">Default Value</Label>
                      <Input
                        id="defaultValue"
                        value={config.defaultValue || ''}
                        onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="null"
                      />
                    </div>
                  </>
                )}

                {/* Condition Configuration */}
                {node.type === 'condition' && (
                  <>
                    <div>
                      <Label htmlFor="operator" className="text-xs">Operator</Label>
                      <Select value={config.operator || 'equals'} onValueChange={(value) => handleConfigChange('operator', value)}>
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value" className="text-xs">Compare Value</Label>
                      <Input
                        id="value"
                        value={config.value || ''}
                        onChange={(e) => handleConfigChange('value', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="Expected value"
                      />
                    </div>
                  </>
                )}

                {/* Assert Configuration */}
                {node.type === 'assert' && (
                  <>
                    <div>
                      <Label htmlFor="assertion" className="text-xs">Assertion Type</Label>
                      <Select value={config.assertion || 'equals'} onValueChange={(value) => handleConfigChange('assertion', value)}>
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="matches_regex">Matches Regex</SelectItem>
                          <SelectItem value="schema_valid">Schema Valid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expected" className="text-xs">Expected Value</Label>
                      <Input
                        id="expected"
                        value={config.expected || ''}
                        onChange={(e) => handleConfigChange('expected', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="Expected result"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-xs">Error Message</Label>
                      <Input
                        id="message"
                        value={config.message || 'Assertion failed'}
                        onChange={(e) => handleConfigChange('message', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="Custom error message"
                      />
                    </div>
                  </>
                )}

                {/* Variable Configuration */}
                {node.type === 'variable' && (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-xs">Variable Name</Label>
                      <Input
                        id="name"
                        value={config.name || ''}
                        onChange={(e) => handleConfigChange('name', e.target.value)}
                        className="h-8 text-sm mt-1"
                        placeholder="variableName"
                      />
                    </div>
                    <div>
                      <Label htmlFor="var-value" className="text-xs">Value</Label>
                      <Textarea
                        id="var-value"
                        value={config.value || ''}
                        onChange={(e) => handleConfigChange('value', e.target.value)}
                        rows={2}
                        className="text-sm mt-1 resize-none"
                        placeholder="Variable value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-xs">Type</Label>
                      <Select value={config.type || 'string'} onValueChange={(value) => handleConfigChange('type', value)}>
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object (JSON)</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Validation Section */}
          {node.validation && (node.validation.errors?.length > 0 || node.validation.warnings?.length > 0) && (
            <AccordionItem value="validation">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Validation</span>
                  {node.validation.errors?.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {node.validation.errors.length} errors
                    </Badge>
                  )}
                  {node.validation.warnings?.length > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {node.validation.warnings.length} warnings  
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {node.validation.errors?.map((error: any, index: number) => (
                    <Alert key={`error-${index}`} variant="destructive" className="py-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        <strong>{error.field}:</strong> {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {node.validation.warnings?.map((warning: any, index: number) => (
                    <Alert key={`warning-${index}`} variant="warning" className="py-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        <strong>{warning.field}:</strong> {warning.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Execution Info */}
          {node.lastExecuted && (
            <AccordionItem value="execution">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Execution Info</span>
                  {node.status === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
                  {node.status === 'error' && <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getNodeStatusVariant(node.status) as any} className="text-xs">
                        {node.status}
                      </Badge>
                    </div>
                  </div>
                  {node.lastExecuted && (
                    <div>
                      <Label className="text-xs">Last Executed</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(node.lastExecuted).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {node.executionTime && (
                    <div>
                      <Label className="text-xs">Execution Time</Label>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {node.executionTime}ms
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="outline" size="sm" className="w-full text-xs">
          Duplicate Node
        </Button>
        <Button variant="destructive" size="sm" className="w-full text-xs">
          Delete Node
        </Button>
      </div>
    </Card>
  )
}

'use client'

import React, { useState, useMemo } from 'react'
import { 
  Settings, 
  Info, 
  Code, 
  Key, 
  Upload, 
  Calendar,
  Clock,
  Globe,
  Mail,
  Lock,
  Palette,
  Hash,
  Type,
  ToggleLeft,
  List,
  FileText,
  Sliders
} from 'lucide-react'
import {
  Input,
  Button,
  Badge,
  Card,
  Textarea,
  Switch,
  Select,
  Checkbox,
  Tabs,
  Label,
  Separator
} from '@/components/ui'
import {
  NodePaletteItem,
  PropertyDefinition,
  PropertyType,
  getNodeById
} from '@/lib/node-palette/registry'

interface NodePropertiesPanelProps {
  nodeId?: string
  node?: NodePaletteItem
  values?: Record<string, any>
  onChange?: (property: string, value: any) => void
  onValidate?: (isValid: boolean, errors: string[]) => void
  className?: string
  readOnly?: boolean
}

// Property type icons
const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  string: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  boolean: <ToggleLeft className="w-4 h-4" />,
  select: <List className="w-4 h-4" />,
  multiSelect: <List className="w-4 h-4" />,
  json: <Code className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  headers: <Key className="w-4 h-4" />,
  keyValue: <Key className="w-4 h-4" />,
  file: <Upload className="w-4 h-4" />,
  color: <Palette className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  time: <Clock className="w-4 h-4" />,
  datetime: <Calendar className="w-4 h-4" />,
  url: <Globe className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  regex: <Code className="w-4 h-4" />,
  password: <Lock className="w-4 h-4" />,
  textarea: <FileText className="w-4 h-4" />,
  slider: <Sliders className="w-4 h-4" />,
  toggle: <ToggleLeft className="w-4 h-4" />,
  tabs: <Tabs className="w-4 h-4" />
}

export function NodePropertiesPanel({
  nodeId,
  node,
  values = {},
  onChange,
  onValidate,
  className = '',
  readOnly = false
}: NodePropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('properties')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Get node data
  const nodeData = useMemo(() => {
    if (node) return node
    if (nodeId) return getNodeById(nodeId)
    return null
  }, [node, nodeId])

  // Group properties by group
  const groupedProperties = useMemo(() => {
    if (!nodeData || !nodeData.properties || !Array.isArray(nodeData.properties)) return {}
    
    const groups: Record<string, PropertyDefinition[]> = { 'General': [] }
    
    nodeData.properties.forEach(prop => {
      const groupName = prop.group || 'General'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(prop)
    })

    // Sort properties within groups by order
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => (a.order || 0) - (b.order || 0))
    })

    return groups
  }, [nodeData])

  // Validate property value
  const validateProperty = (prop: PropertyDefinition, value: any): string | null => {
    if (prop.required && (value === undefined || value === null || value === '')) {
      return `${prop.name} is required`
    }

    if (prop.validation && value !== undefined && value !== null && value !== '') {
      const validation = prop.validation
      
      if (validation.pattern && typeof value === 'string') {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(value)) {
          return `${prop.name} format is invalid`
        }
      }

      if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
        return `${prop.name} must be at least ${validation.minLength} characters`
      }

      if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
        return `${prop.name} must be at most ${validation.maxLength} characters`
      }

      if (validation.min && typeof value === 'number' && value < validation.min) {
        return `${prop.name} must be at least ${validation.min}`
      }

      if (validation.max && typeof value === 'number' && value > validation.max) {
        return `${prop.name} must be at most ${validation.max}`
      }

      if (validation.enum && !validation.enum.includes(value)) {
        return `${prop.name} must be one of: ${validation.enum.join(', ')}`
      }
    }

    return null
  }

  // Handle property change
  const handlePropertyChange = (prop: PropertyDefinition, newValue: any) => {
    if (readOnly) return

    // Validate the new value
    const error = validateProperty(prop, newValue)
    setValidationErrors(prev => ({
      ...prev,
      [prop.key]: error || ''
    }))

    // Call onChange
    onChange?.(prop.key, newValue)

    // Validate all properties and call onValidate
    const allErrors = Object.values({ ...validationErrors, [prop.key]: error || '' })
      .filter(err => err !== '')
    onValidate?.(allErrors.length === 0, allErrors)
  }

  // Check if property should be shown based on conditional logic
  const shouldShowProperty = (prop: PropertyDefinition): boolean => {
    if (!prop.conditional) return true
    
    const dependentValue = values[prop.conditional.dependsOn]
    switch (prop.conditional.condition) {
      case 'equals':
        return dependentValue === prop.conditional.value
      case 'notEquals':
        return dependentValue !== prop.conditional.value
      case 'contains':
        return Array.isArray(dependentValue) 
          ? dependentValue.includes(prop.conditional.value)
          : String(dependentValue).includes(String(prop.conditional.value))
      case 'custom':
        // Would evaluate custom JavaScript condition
        return true
      default:
        return true
    }
  }

  // Render property input based on type
  const renderPropertyInput = (prop: PropertyDefinition) => {
    const value = values[prop.key] ?? prop.default
    const hasError = validationErrors[prop.key]

    switch (prop.type) {
      case 'string':
      case 'url':
      case 'email':
        return (
          <Input
            type={prop.type === 'email' ? 'email' : prop.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            placeholder={prop.description}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'password':
        return (
          <Input
            type="password"
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            placeholder={prop.description}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, Number(e.target.value))}
            placeholder={prop.description}
            disabled={readOnly}
            min={prop.validation?.min}
            max={prop.validation?.max}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'boolean':
      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handlePropertyChange(prop, checked)}
              disabled={readOnly}
            />
            <Label className="text-sm text-gray-600">{value ? 'Enabled' : 'Disabled'}</Label>
          </div>
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handlePropertyChange(prop, newValue)}
            disabled={readOnly}
          >
            {prop.options?.map(option => (
              <Select.Option key={String(option.value)} value={String(option.value)}>
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )

      case 'multiSelect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {prop.options?.map(option => (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value)
                    handlePropertyChange(prop, newValues)
                  }}
                  disabled={readOnly}
                />
                <Label className="text-sm">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            placeholder={prop.description}
            disabled={readOnly}
            rows={4}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'json':
      case 'code':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            placeholder={prop.description}
            disabled={readOnly}
            rows={6}
            className={`font-mono text-sm ${hasError ? 'border-red-500' : ''}`}
          />
        )

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={prop.validation?.min || 0}
              max={prop.validation?.max || 100}
              step={0.1}
              value={value || prop.default || 0}
              onChange={(e) => handlePropertyChange(prop, Number(e.target.value))}
              disabled={readOnly}
              className="w-full"
            />
            <div className="text-sm text-gray-600 text-center">
              {value || prop.default || 0}
            </div>
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handlePropertyChange(prop, e.target.value)}
              disabled={readOnly}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => handlePropertyChange(prop, e.target.value)}
              placeholder="#000000"
              disabled={readOnly}
              className="flex-1"
            />
          </div>
        )

      case 'headers':
      case 'keyValue':
        const pairs = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {pairs.map((pair: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Key"
                  value={pair.key || ''}
                  onChange={(e) => {
                    const newPairs = [...pairs]
                    newPairs[index] = { ...pair, key: e.target.value }
                    handlePropertyChange(prop, newPairs)
                  }}
                  disabled={readOnly}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={pair.value || ''}
                  onChange={(e) => {
                    const newPairs = [...pairs]
                    newPairs[index] = { ...pair, value: e.target.value }
                    handlePropertyChange(prop, newPairs)
                  }}
                  disabled={readOnly}
                  className="flex-1"
                />
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPairs = pairs.filter((_, i) => i !== index)
                      handlePropertyChange(prop, newPairs)
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handlePropertyChange(prop, [...pairs, { key: '', value: '' }])
                }}
              >
                Add {prop.type === 'headers' ? 'Header' : 'Pair'}
              </Button>
            )}
          </div>
        )

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handlePropertyChange(prop, e.target.value)}
            placeholder={prop.description}
            disabled={readOnly}
            className={hasError ? 'border-red-500' : ''}
          />
        )
    }
  }

  if (!nodeData) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          Select a node to view its properties
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: nodeData.color + '20', color: nodeData.color }}
          >
            {nodeData.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {nodeData.name}
            </h2>
            <p className="text-sm text-gray-600 truncate">
              {nodeData.description}
            </p>
          </div>
          <Badge variant="secondary">
            {nodeData.category}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Info
            </button>
          </div>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && (
          <div className="p-4 space-y-6">
            {Object.entries(groupedProperties).map(([groupName, properties]) => (
              <div key={groupName}>
                {Object.keys(groupedProperties).length > 1 && (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-4">{groupName}</h3>
                    <Separator className="mb-4" />
                  </>
                )}
                
                <div className="space-y-4">
                  {properties
                    .filter(shouldShowProperty)
                    .map(prop => (
                      <div key={prop.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {propertyTypeIcons[prop.type]}
                          <Label className="text-sm font-medium text-gray-700">
                            {prop.name}
                            {prop.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                        </div>
                        
                        <div className="space-y-1">
                          {renderPropertyInput(prop)}
                          
                          {validationErrors[prop.key] && (
                            <p className="text-xs text-red-600">
                              {validationErrors[prop.key]}
                            </p>
                          )}
                          
                          {prop.description && !validationErrors[prop.key] && (
                            <p className="text-xs text-gray-500">
                              {prop.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-4 space-y-6">
            {/* Node Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Node Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-gray-900">{nodeData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary">{nodeData.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span>{nodeData.premium ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>

            {/* Input/Output Ports */}
            {((nodeData.inputs && nodeData.inputs.length > 0) || (nodeData.outputs && nodeData.outputs.length > 0)) && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ports</h3>
                
                {nodeData.inputs && nodeData.inputs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Inputs</h4>
                    <div className="space-y-2">
                      {nodeData.inputs.map(input => (
                        <div key={input.key} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{input.displayName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {input.type}
                            </Badge>
                            {input.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {nodeData.outputs && nodeData.outputs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Outputs</h4>
                    <div className="space-y-2">
                      {nodeData.outputs.map(output => (
                        <div key={output.key} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{output.displayName}</span>
                          <Badge variant="outline" className="text-xs">
                            {output.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Examples */}
            {nodeData.examples && nodeData.examples.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Examples</h3>
                <ul className="space-y-2 text-sm">
                  {nodeData.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700">{example}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Tags */}
            {nodeData.tags && nodeData.tags.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {nodeData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NodePropertiesPanel

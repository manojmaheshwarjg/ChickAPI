import React, { useState } from 'react'
import { 
  CubeIcon,
  ArrowPathIcon,
  BoltIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
  Badge,
  Button,
  Card,
  Input,
  Separator
} from '@/components/ui'

interface SidebarProps {
  onNodeDragStart: (nodeType: string) => void
}

interface NodeCategory {
  name: string
  iconName: string
  color: string
  bgColor: string
  nodes: Array<{
    id: string
    name: string
    description: string
  }>
}

const nodeCategories: NodeCategory[] = [
  {
    name: 'HTTP',
    iconName: 'cube',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    nodes: [
      { id: 'http-get', name: 'GET Request', description: 'Make a GET request' },
      { id: 'http-post', name: 'POST Request', description: 'Send data with POST' },
      { id: 'http-put', name: 'PUT Request', description: 'Update with PUT' },
      { id: 'http-delete', name: 'DELETE Request', description: 'Delete resources' },
    ]
  },
  {
    name: 'Data Transform',
    iconName: 'arrowPath',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    nodes: [
      { id: 'json-path', name: 'JSON Path', description: 'Extract JSON data' },
      { id: 'mapper', name: 'Data Mapper', description: 'Transform data structure' },
      { id: 'filter', name: 'Filter', description: 'Filter array data' },
      { id: 'aggregate', name: 'Aggregate', description: 'Aggregate data' },
    ]
  },
  {
    name: 'Control Flow',
    iconName: 'bolt',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    nodes: [
      { id: 'condition', name: 'Condition', description: 'If/else branching' },
      { id: 'loop', name: 'Loop', description: 'Iterate over data' },
      { id: 'parallel', name: 'Parallel', description: 'Run in parallel' },
      { id: 'delay', name: 'Delay', description: 'Add delay' },
    ]
  },
  {
    name: 'Testing',
    iconName: 'beaker',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    nodes: [
      { id: 'assert', name: 'Assert', description: 'Validate response' },
      { id: 'test-case', name: 'Test Case', description: 'Define test case' },
      { id: 'mock', name: 'Mock Response', description: 'Mock API response' },
    ]
  },
]

// Icon mapping function
const getCategoryIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'cube':
      return <CubeIcon className={className} />
    case 'arrowPath':
      return <ArrowPathIcon className={className} />
    case 'bolt':
      return <BoltIcon className={className} />
    case 'beaker':
      return <BeakerIcon className={className} />
    default:
      return <CubeIcon className={className} />
  }
}

export default function Sidebar({ onNodeDragStart }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)

  return (
    <div className="w-64 bg-background border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Node Palette</h2>
        
        {/* Enhanced Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-input"
          />
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["HTTP"]} className="w-full">
          {filteredCategories.map((category) => (
            <AccordionItem key={category.name} value={category.name} className="border-border">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${category.bgColor}`}>
                    {getCategoryIcon(category.iconName, `w-4 h-4 ${category.color}`)}
                  </div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {category.nodes.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {category.nodes.map((node) => (
                    <Card
                      key={node.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('nodeType', node.id)
                        e.dataTransfer.effectAllowed = 'copy'
                        onNodeDragStart(node.id)
                      }}
                      className="p-3 cursor-move hover:bg-muted/30 transition-all duration-200 border-border hover:border-primary/20 hover:shadow-sm group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-10 ${category.color.replace('text', 'bg')} rounded-full mt-1 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                            {node.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="p-8 text-center">
            <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No nodes found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full text-xs h-9" size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Import Custom Node
        </Button>
      </div>
    </div>
  )
}

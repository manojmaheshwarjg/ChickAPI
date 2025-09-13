// Bridge between Node Palette and NodeFactory
import { NodeFactory } from '@/src/core/NodeFactory'
import { DataType, NodeStatus } from '@/src/core/types'
import { nodes, NodePaletteItem } from './registry'
import { v4 as uuidv4 } from 'uuid'

// Convert palette node category to NodeFactory category
function convertCategory(category: string): any {
  const categoryMap: Record<string, string> = {
    'http': 'HTTP',
    'data': 'DATA_TRANSFORM', 
    'control': 'CONTROL_FLOW',
    'auth': 'SECURITY',
    'database': 'STORAGE',
    'storage': 'STORAGE',
    'notification': 'INTEGRATION',
    'testing': 'TESTING',
    'time': 'UTILITY',
    'integration': 'INTEGRATION',
    'utility': 'UTILITY',
    'ai': 'PROCESSOR',
    'security': 'SECURITY',
    'monitoring': 'UTILITY',
    'realtime': 'INTEGRATION',
    'mock': 'TESTING',
    'transform': 'DATA_TRANSFORM',
    'protocol': 'HTTP',
    'browser': 'TESTING',
    'mobile': 'TESTING'
  }
  return categoryMap[category] || 'UTILITY'
}

// Convert palette port to NodeFactory port
function convertPort(port: any, isOutput = false) {
  return {
    id: uuidv4(),
    name: port.key,
    type: port.type as DataType,
    required: port.required || false,
    description: port.description || ''
  }
}

// Register all palette nodes with NodeFactory
export function registerPaletteNodes(): void {
  nodes.forEach(paletteNode => {
    try {
      NodeFactory.registerNodeType({
        type: paletteNode.id,
        metadata: {
          title: paletteNode.name,
          description: paletteNode.description,
          category: convertCategory(paletteNode.category) as any,
          color: paletteNode.color,
          icon: paletteNode.icon,
          version: '1.0.0',
          author: 'ChickAPI'
        },
        defaultConfig: paletteNode.properties.reduce((config: any, prop) => {
          config[prop.key] = prop.default
          return config
        }, {}),
        inputs: paletteNode.inputs.map(input => convertPort(input)),
        outputs: paletteNode.outputs.map(output => convertPort(output, true)),
        executor: async (node, inputs, context) => {
          // Basic executor - will be enhanced with actual logic later
          console.log(`Executing ${paletteNode.name} node:`, { node, inputs, context })
          
          // Return mock outputs based on node type
          const outputs: Record<string, any> = {}
          
          paletteNode.outputs.forEach(output => {
            switch (output.type) {
              case 'string':
                outputs[output.key] = `Mock ${output.displayName}`
                break
              case 'number':
                outputs[output.key] = Math.floor(Math.random() * 100)
                break
              case 'boolean':
                outputs[output.key] = Math.random() > 0.5
                break
              case 'object':
                outputs[output.key] = { mock: true, timestamp: Date.now() }
                break
              case 'array':
                outputs[output.key] = [1, 2, 3]
                break
              default:
                outputs[output.key] = inputs[paletteNode.inputs[0]?.key] || null
                break
            }
          })
          
          return outputs
        },
        validator: (config) => {
          const errors: any[] = []
          const warnings: any[] = []
          
          // Basic validation based on required properties
          paletteNode.properties.forEach(prop => {
            if (prop.required && (config[prop.key] === undefined || config[prop.key] === null || config[prop.key] === '')) {
              errors.push({
                field: prop.key,
                message: `${prop.name} is required`
              })
            }
          })
          
          return {
            isValid: errors.length === 0,
            errors,
            warnings
          }
        }
      })
    } catch (error) {
      console.warn(`Failed to register node type: ${paletteNode.id}`, error)
    }
  })

  console.log(`Registered ${nodes.length} palette nodes with NodeFactory`)
}

// Get palette node by ID
export function getPaletteNodeById(id: string): NodePaletteItem | undefined {
  return nodes.find(node => node.id === id)
}

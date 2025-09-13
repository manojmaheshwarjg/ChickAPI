import { BaseNode, NodeConnection } from '@/lib/types'

export interface WorkflowData {
  id: string
  name: string
  description?: string
  nodes: BaseNode[]
  connections: NodeConnection[]
  version: string
  created: Date
  modified: Date
  environment?: Record<string, any>
}

export class WorkflowStorage {
  private static readonly STORAGE_KEY = 'chickapi_workflows'
  private static readonly CURRENT_WORKFLOW_KEY = 'chickapi_current_workflow'

  // Save workflow to localStorage
  static saveWorkflow(workflow: WorkflowData): void {
    if (typeof window === 'undefined') return
    
    try {
      // Update modified timestamp
      workflow.modified = new Date()
      
      // Save current workflow
      localStorage.setItem(this.CURRENT_WORKFLOW_KEY, JSON.stringify(workflow))
      
      // Also save to workflows collection
      const workflows = this.getAllWorkflows()
      const existingIndex = workflows.findIndex(w => w.id === workflow.id)
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow
      } else {
        workflows.push(workflow)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))
    } catch (error) {
      console.error('Failed to save workflow:', error)
      throw new Error('Failed to save workflow to storage')
    }
  }

  // Load current workflow from localStorage
  static loadCurrentWorkflow(): WorkflowData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const data = localStorage.getItem(this.CURRENT_WORKFLOW_KEY)
      if (!data) return null
      
      const workflow = JSON.parse(data)
      // Convert date strings back to Date objects
      workflow.created = new Date(workflow.created)
      workflow.modified = new Date(workflow.modified)
      
      return workflow
    } catch (error) {
      console.error('Failed to load workflow:', error)
      return null
    }
  }

  // Get all saved workflows
  static getAllWorkflows(): WorkflowData[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []
      
      const workflows = JSON.parse(data)
      // Convert date strings back to Date objects
      workflows.forEach((w: WorkflowData) => {
        w.created = new Date(w.created)
        w.modified = new Date(w.modified)
      })
      
      return workflows
    } catch (error) {
      console.error('Failed to load workflows:', error)
      return []
    }
  }

  // Delete a workflow
  static deleteWorkflow(workflowId: string): void {
    try {
      const workflows = this.getAllWorkflows()
      const filtered = workflows.filter(w => w.id !== workflowId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
      
      // If deleting current workflow, clear it
      const current = this.loadCurrentWorkflow()
      if (current?.id === workflowId) {
        localStorage.removeItem(this.CURRENT_WORKFLOW_KEY)
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      throw new Error('Failed to delete workflow')
    }
  }

  // Export workflow as JSON file
  static exportWorkflow(workflow: WorkflowData): void {
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}_${Date.now()}.chickapi`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import workflow from JSON file
  static async importWorkflow(file: File): Promise<WorkflowData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const workflow = JSON.parse(content)
          
          // Validate workflow structure
          if (!workflow.id || !workflow.name || !workflow.nodes || !workflow.connections) {
            throw new Error('Invalid workflow file format')
          }
          
          // Generate new ID to avoid conflicts
          workflow.id = `workflow_${Date.now()}`
          workflow.created = new Date(workflow.created || Date.now())
          workflow.modified = new Date()
          
          resolve(workflow)
        } catch (error) {
          reject(new Error('Failed to parse workflow file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Clear all workflows
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_WORKFLOW_KEY)
  }
}

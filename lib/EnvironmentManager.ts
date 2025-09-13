export interface EnvironmentVariable {
  key: string
  value: string
  type: 'text' | 'secret' | 'number' | 'boolean'
  description?: string
}

export interface Environment {
  id: string
  name: string
  variables: EnvironmentVariable[]
  active: boolean
}

export class EnvironmentManager {
  private static readonly STORAGE_KEY = 'chickapi_environments'
  private static readonly ACTIVE_ENV_KEY = 'chickapi_active_environment'
  
  private static environments: Map<string, Environment> = new Map()
  private static activeEnvironment: Environment | null = null
  
  // Initialize environments from localStorage
  static initialize(): void {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        const envs = JSON.parse(stored) as Environment[]
        envs.forEach(env => this.environments.set(env.id, env))
      } catch (error) {
        console.error('Failed to load environments:', error)
      }
    }
    
    // Load active environment
    const activeId = localStorage.getItem(this.ACTIVE_ENV_KEY)
    if (activeId && this.environments.has(activeId)) {
      this.activeEnvironment = this.environments.get(activeId) || null
    }
    
    // Create default environments if none exist
    if (this.environments.size === 0) {
      this.createDefaultEnvironments()
    }
  }
  
  private static createDefaultEnvironments(): void {
    const development: Environment = {
      id: 'dev',
      name: 'Development',
      variables: [
        { key: 'API_BASE_URL', value: 'http://localhost:3000', type: 'text' },
        { key: 'API_KEY', value: '', type: 'secret', description: 'API key for authentication' }
      ],
      active: true
    }
    
    const staging: Environment = {
      id: 'staging',
      name: 'Staging',
      variables: [
        { key: 'API_BASE_URL', value: 'https://staging-api.example.com', type: 'text' },
        { key: 'API_KEY', value: '', type: 'secret', description: 'API key for authentication' }
      ],
      active: false
    }
    
    const production: Environment = {
      id: 'prod',
      name: 'Production',
      variables: [
        { key: 'API_BASE_URL', value: 'https://api.example.com', type: 'text' },
        { key: 'API_KEY', value: '', type: 'secret', description: 'API key for authentication' }
      ],
      active: false
    }
    
    this.environments.set('dev', development)
    this.environments.set('staging', staging)
    this.environments.set('prod', production)
    this.activeEnvironment = development
    
    this.save()
  }
  
  // Save environments to localStorage
  private static save(): void {
    if (typeof window === 'undefined') return
    
    const envArray = Array.from(this.environments.values())
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(envArray))
    
    if (this.activeEnvironment) {
      localStorage.setItem(this.ACTIVE_ENV_KEY, this.activeEnvironment.id)
    }
  }
  
  // Get all environments
  static getEnvironments(): Environment[] {
    if (this.environments.size === 0) {
      this.initialize()
    }
    return Array.from(this.environments.values())
  }
  
  // Get active environment
  static getActiveEnvironment(): Environment | null {
    if (!this.activeEnvironment && this.environments.size === 0) {
      this.initialize()
    }
    return this.activeEnvironment
  }
  
  // Set active environment
  static setActiveEnvironment(environmentId: string): void {
    const env = this.environments.get(environmentId)
    if (env) {
      // Deactivate all environments
      this.environments.forEach(e => e.active = false)
      
      // Activate selected environment
      env.active = true
      this.activeEnvironment = env
      this.save()
    }
  }
  
  // Get variable value from active environment
  static getVariable(key: string): string | undefined {
    if (!this.activeEnvironment) {
      this.initialize()
    }
    
    const variable = this.activeEnvironment?.variables.find(v => v.key === key)
    return variable?.value
  }
  
  // Set variable value in active environment
  static setVariable(key: string, value: string): void {
    if (!this.activeEnvironment) return
    
    const variable = this.activeEnvironment.variables.find(v => v.key === key)
    if (variable) {
      variable.value = value
    } else {
      this.activeEnvironment.variables.push({
        key,
        value,
        type: 'text'
      })
    }
    
    this.save()
  }
  
  // Add new environment
  static addEnvironment(name: string): Environment {
    const env: Environment = {
      id: `env_${Date.now()}`,
      name,
      variables: [],
      active: false
    }
    
    this.environments.set(env.id, env)
    this.save()
    return env
  }
  
  // Update environment
  static updateEnvironment(environmentId: string, updates: Partial<Environment>): void {
    const env = this.environments.get(environmentId)
    if (env) {
      Object.assign(env, updates)
      this.save()
    }
  }
  
  // Delete environment
  static deleteEnvironment(environmentId: string): void {
    if (this.environments.size <= 1) {
      throw new Error('Cannot delete the last environment')
    }
    
    this.environments.delete(environmentId)
    
    // If deleted environment was active, activate first available
    if (this.activeEnvironment?.id === environmentId) {
      const firstEnv = this.environments.values().next().value
      if (firstEnv) {
        this.setActiveEnvironment(firstEnv.id)
      }
    }
    
    this.save()
  }
  
  // Replace variables in text with their values
  static interpolateVariables(text: string): string {
    if (!text || !this.activeEnvironment) return text
    
    let result = text
    
    // Replace {{VARIABLE_NAME}} patterns
    const variablePattern = /\{\{([^}]+)\}\}/g
    result = result.replace(variablePattern, (match, varName) => {
      const value = this.getVariable(varName.trim())
      return value !== undefined ? value : match
    })
    
    return result
  }
  
  // Export environment as JSON
  static exportEnvironment(environmentId: string): void {
    const env = this.environments.get(environmentId)
    if (!env) return
    
    const dataStr = JSON.stringify(env, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${env.name.replace(/\s+/g, '_')}_environment.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
  
  // Import environment from JSON
  static async importEnvironment(file: File): Promise<Environment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const env = JSON.parse(content) as Environment
          
          // Generate new ID to avoid conflicts
          env.id = `env_${Date.now()}`
          env.active = false
          
          this.environments.set(env.id, env)
          this.save()
          
          resolve(env)
        } catch (error) {
          reject(new Error('Failed to parse environment file'))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}

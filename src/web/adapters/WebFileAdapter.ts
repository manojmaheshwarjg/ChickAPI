import { Workflow } from '../../core/types';

export class WebFileAdapter {
    /**
     * Open a workflow file from the user's file system
     */
    async openWorkflow(): Promise<Workflow | null> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.magicapi,.json';
            
            input.onchange = async (e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                
                if (!file) {
                    resolve(null);
                    return;
                }
                
                try {
                    const content = await this.readFile(file);
                    const workflow = JSON.parse(content);
                    
                    // Convert dates from strings
                    workflow.created = new Date(workflow.created);
                    workflow.modified = new Date(workflow.modified);
                    
                    resolve(workflow);
                } catch (error) {
                    console.error('Failed to parse workflow file:', error);
                    resolve(null);
                }
            };
            
            input.click();
        });
    }
    
    /**
     * Save a workflow to the user's file system
     */
    async saveWorkflow(workflow: Workflow): Promise<void> {
        const content = JSON.stringify(workflow, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.magicapi`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Read file content
     */
    private readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const content = e.target?.result as string;
                resolve(content);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Export workflow as different formats
     */
    async exportWorkflow(workflow: Workflow, format: 'json' | 'postman' | 'openapi'): Promise<void> {
        let content: string;
        let filename: string;
        let mimeType: string;
        
        switch (format) {
            case 'json':
                content = JSON.stringify(workflow, null, 2);
                filename = `${workflow.name}.json`;
                mimeType = 'application/json';
                break;
                
            case 'postman':
                // TODO: Convert to Postman collection format
                content = this.convertToPostmanCollection(workflow);
                filename = `${workflow.name}.postman_collection.json`;
                mimeType = 'application/json';
                break;
                
            case 'openapi':
                // TODO: Convert to OpenAPI spec
                content = this.convertToOpenAPI(workflow);
                filename = `${workflow.name}.openapi.yaml`;
                mimeType = 'application/x-yaml';
                break;
                
            default:
                throw new Error(`Unknown export format: ${format}`);
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    private convertToPostmanCollection(workflow: Workflow): string {
        // Simplified Postman collection structure
        const collection = {
            info: {
                name: workflow.name,
                description: workflow.description,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: workflow.nodes
                .filter(node => node.type === 'http_request')
                .map(node => ({
                    name: node.metadata.title,
                    request: {
                        method: node.config.method || 'GET',
                        header: Object.entries(node.config.headers || {}).map(([key, value]) => ({
                            key,
                            value
                        })),
                        url: {
                            raw: node.config.url || '',
                            host: ['{{base_url}}'],
                            path: (node.config.url || '').split('/').filter(Boolean)
                        },
                        body: node.config.body ? {
                            mode: 'raw',
                            raw: JSON.stringify(node.config.body)
                        } : undefined
                    }
                }))
        };
        
        return JSON.stringify(collection, null, 2);
    }
    
    private convertToOpenAPI(workflow: Workflow): string {
        // Simplified OpenAPI spec
        const spec = {
            openapi: '3.0.0',
            info: {
                title: workflow.name,
                description: workflow.description,
                version: workflow.version
            },
            servers: [
                {
                    url: 'https://api.example.com',
                    description: 'API server'
                }
            ],
            paths: {}
        };
        
        // Convert HTTP request nodes to paths
        workflow.nodes
            .filter(node => node.type === 'http_request')
            .forEach(node => {
                const path = node.config.url || '/';
                const method = (node.config.method || 'GET').toLowerCase();
                
                if (!spec.paths[path]) {
                    spec.paths[path] = {};
                }
                
                spec.paths[path][method] = {
                    summary: node.metadata.title,
                    description: node.metadata.description,
                    responses: {
                        '200': {
                            description: 'Successful response'
                        }
                    }
                };
            });
        
        return `# ${spec.info.title}
openapi: ${spec.openapi}
info:
  title: ${spec.info.title}
  description: ${spec.info.description}
  version: ${spec.info.version}
  
servers:
  - url: ${spec.servers[0].url}
    description: ${spec.servers[0].description}
    
paths:
${Object.entries(spec.paths).map(([path, methods]) => `  ${path}:
${Object.entries(methods).map(([method, config]: [string, any]) => `    ${method}:
      summary: ${config.summary}
      description: ${config.description}
      responses:
        '200':
          description: ${config.responses['200'].description}`).join('\n')}`).join('\n')}`;
    }
}

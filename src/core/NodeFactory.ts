import { v4 as uuidv4 } from 'uuid';
import {
    BaseNode,
    NodeCategory,
    NodeConfig,
    NodeMetadata,
    NodeStatus,
    NodeTypeDefinition,
    Port,
    ValidationState,
    DataType
} from './types';

export class NodeFactory {
    private static nodeTypes: Map<string, NodeTypeDefinition> = new Map();

    /**
     * Register a new node type
     */
    static registerNodeType(definition: NodeTypeDefinition): void {
        this.nodeTypes.set(definition.type, definition);
    }

    /**
     * Get all registered node types
     */
    static getRegisteredTypes(): NodeTypeDefinition[] {
        return Array.from(this.nodeTypes.values());
    }

    /**
     * Get node types by category
     */
    static getTypesByCategory(category: NodeCategory): NodeTypeDefinition[] {
        return this.getRegisteredTypes().filter(type => type.metadata.category === category);
    }

    /**
     * Get a specific node type definition
     */
    static getNodeType(type: string): NodeTypeDefinition | undefined {
        return this.nodeTypes.get(type);
    }

    /**
     * Create a new node instance
     */
    static createNode(type: string, position: { x: number; y: number }): BaseNode | null {
        const definition = this.nodeTypes.get(type);
        if (!definition) {
            console.error(`Unknown node type: ${type}`);
            return null;
        }

        return {
            id: uuidv4(),
            type,
            position,
            size: { width: 200, height: 100 },
            inputs: definition.inputs.map(port => ({ ...port, id: uuidv4() })),
            outputs: definition.outputs.map(port => ({ ...port, id: uuidv4() })),
            config: { ...definition.defaultConfig },
            metadata: { ...definition.metadata },
            validation: { isValid: true, errors: [], warnings: [] },
            status: NodeStatus.IDLE
        };
    }

    /**
     * Validate a node's configuration
     */
    static validateNode(node: BaseNode): ValidationState {
        const definition = this.nodeTypes.get(node.type);
        if (!definition) {
            return {
                isValid: false,
                errors: [{ field: 'type', message: `Unknown node type: ${node.type}` }],
                warnings: []
            };
        }

        if (definition.validator) {
            return definition.validator(node.config);
        }

        // Default validation - check required inputs
        const errors: any[] = [];
        const warnings: any[] = [];

        for (const input of node.inputs) {
            if (input.required && !node.config[input.name]) {
                errors.push({
                    field: input.name,
                    message: `${input.name} is required`
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Clone a node
     */
    static cloneNode(node: BaseNode, newPosition?: { x: number; y: number }): BaseNode {
        return {
            ...node,
            id: uuidv4(),
            position: newPosition || { x: node.position.x + 20, y: node.position.y + 20 },
            inputs: node.inputs.map(port => ({ ...port, id: uuidv4() })),
            outputs: node.outputs.map(port => ({ ...port, id: uuidv4() })),
            status: NodeStatus.IDLE,
            executionTime: undefined,
            lastExecuted: undefined,
            data: undefined
        };
    }
}

// Initialize built-in nodes
export function initializeBuiltInNodes(): void {
    // HTTP GET Node
    NodeFactory.registerNodeType({
        type: 'http-get',
        metadata: {
            title: 'GET Request',
            description: 'Make HTTP GET request',
            category: NodeCategory.HTTP,
            color: 'bg-blue-500',
            icon: 'GET',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            method: 'GET',
            url: '',
            headers: {},
            params: {},
            body: '',
            timeout: 30000,
            followRedirects: true
        },
        inputs: [
            {
                id: 'url_input',
                name: 'url',
                type: DataType.STRING,
                required: true,
                description: 'The URL to request'
            },
            {
                id: 'headers_input',
                name: 'headers',
                type: DataType.OBJECT,
                required: false,
                description: 'HTTP headers'
            },
            {
                id: 'body_input',
                name: 'body',
                type: DataType.ANY,
                required: false,
                description: 'Request body'
            }
        ],
        outputs: [
            {
                id: 'response_output',
                name: 'response',
                type: DataType.HTTP_RESPONSE,
                required: false,
                description: 'HTTP response'
            },
            {
                id: 'status_output',
                name: 'status',
                type: DataType.NUMBER,
                required: false,
                description: 'HTTP status code'
            },
            {
                id: 'body_output',
                name: 'body',
                type: DataType.ANY,
                required: false,
                description: 'Response body'
            }
        ],
        executor: async (node, inputs, context) => {
            // HTTP execution logic will be implemented later
            return null;
        }
    });

    // HTTP POST Node
    NodeFactory.registerNodeType({
        type: 'http-post',
        metadata: {
            title: 'POST Request',
            description: 'Make HTTP POST request',
            category: NodeCategory.HTTP,
            color: 'bg-blue-500',
            icon: 'POST',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            method: 'POST',
            url: '',
            headers: {},
            params: {},
            body: '',
            timeout: 30000,
            followRedirects: true
        },
        inputs: [
            {
                id: 'url_input',
                name: 'url',
                type: DataType.STRING,
                required: true,
                description: 'The URL to request'
            },
            {
                id: 'body_input',
                name: 'body',
                type: DataType.ANY,
                required: false,
                description: 'Request body'
            }
        ],
        outputs: [
            {
                id: 'response_output',
                name: 'response',
                type: DataType.HTTP_RESPONSE,
                required: false,
                description: 'HTTP response'
            }
        ],
        executor: async (node, inputs, context) => {
            return null;
        }
    });

    // HTTP PUT Node
    NodeFactory.registerNodeType({
        type: 'http-put',
        metadata: {
            title: 'PUT Request',
            description: 'Make HTTP PUT request',
            category: NodeCategory.HTTP,
            color: 'bg-blue-500',
            icon: 'PUT',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            method: 'PUT',
            url: '',
            headers: {},
            params: {},
            body: '',
            timeout: 30000,
            followRedirects: true
        },
        inputs: [
            {
                id: 'url_input',
                name: 'url',
                type: DataType.STRING,
                required: true,
                description: 'The URL to request'
            },
            {
                id: 'body_input',
                name: 'body',
                type: DataType.ANY,
                required: false,
                description: 'Request body'
            }
        ],
        outputs: [
            {
                id: 'response_output',
                name: 'response',
                type: DataType.HTTP_RESPONSE,
                required: false,
                description: 'HTTP response'
            }
        ],
        executor: async (node, inputs, context) => {
            return null;
        }
    });

    // HTTP DELETE Node
    NodeFactory.registerNodeType({
        type: 'http-delete',
        metadata: {
            title: 'DELETE Request',
            description: 'Make HTTP DELETE request',
            category: NodeCategory.HTTP,
            color: 'bg-blue-500',
            icon: 'DELETE',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            method: 'DELETE',
            url: '',
            headers: {},
            params: {},
            timeout: 30000,
            followRedirects: true
        },
        inputs: [
            {
                id: 'url_input',
                name: 'url',
                type: DataType.STRING,
                required: true,
                description: 'The URL to request'
            }
        ],
        outputs: [
            {
                id: 'response_output',
                name: 'response',
                type: DataType.HTTP_RESPONSE,
                required: false,
                description: 'HTTP response'
            }
        ],
        executor: async (node, inputs, context) => {
            return null;
        }
    });

    // JSON Path Extractor Node
    NodeFactory.registerNodeType({
        type: 'json-path',
        metadata: {
            title: 'JSON Path',
            description: 'Extract data from JSON using JSONPath expressions',
            category: NodeCategory.DATA_TRANSFORM,
            color: 'bg-green-500',
            icon: 'filter',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            path: '$',
            defaultValue: null
        },
        inputs: [
            {
                id: 'data_input',
                name: 'data',
                type: DataType.OBJECT,
                required: true,
                description: 'JSON data to extract from'
            },
            {
                id: 'path_input',
                name: 'path',
                type: DataType.STRING,
                required: false,
                description: 'JSONPath expression'
            }
        ],
        outputs: [
            {
                id: 'result_output',
                name: 'result',
                type: DataType.ANY,
                required: false,
                description: 'Extracted value'
            }
        ],
        executor: async (node, inputs, context) => {
            // JSONPath execution logic will be implemented later
            return null;
        }
    });

    // If/Else Conditional Node
    NodeFactory.registerNodeType({
        type: 'condition',
        metadata: {
            title: 'Condition',
            description: 'Conditional branching based on input values',
            category: NodeCategory.CONTROL_FLOW,
            color: 'bg-purple-500',
            icon: 'decision',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            operator: 'equals',
            value: ''
        },
        inputs: [
            {
                id: 'input_value',
                name: 'value',
                type: DataType.ANY,
                required: true,
                description: 'Value to test'
            },
            {
                id: 'compare_value',
                name: 'compare',
                type: DataType.ANY,
                required: false,
                description: 'Value to compare against'
            },
            {
                id: 'true_input',
                name: 'true_value',
                type: DataType.ANY,
                required: false,
                description: 'Value to output when condition is true'
            },
            {
                id: 'false_input',
                name: 'false_value',
                type: DataType.ANY,
                required: false,
                description: 'Value to output when condition is false'
            }
        ],
        outputs: [
            {
                id: 'result_output',
                name: 'result',
                type: DataType.ANY,
                required: false,
                description: 'Conditional result'
            },
            {
                id: 'true_output',
                name: 'true',
                type: DataType.ANY,
                required: false,
                description: 'Output when condition is true'
            },
            {
                id: 'false_output',
                name: 'false',
                type: DataType.ANY,
                required: false,
                description: 'Output when condition is false'
            }
        ],
        executor: async (node, inputs, context) => {
            // Condition execution logic will be implemented later
            return null;
        }
    });

    // Assert/Test Node
    NodeFactory.registerNodeType({
        type: 'assert',
        metadata: {
            title: 'Assert',
            description: 'Validate data against expected values',
            category: NodeCategory.TESTING,
            color: 'bg-orange-500',
            icon: 'check',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            assertion: 'equals',
            expected: '',
            message: 'Assertion failed'
        },
        inputs: [
            {
                id: 'actual_input',
                name: 'actual',
                type: DataType.ANY,
                required: true,
                description: 'Actual value to test'
            },
            {
                id: 'expected_input',
                name: 'expected',
                type: DataType.ANY,
                required: false,
                description: 'Expected value'
            }
        ],
        outputs: [
            {
                id: 'result_output',
                name: 'result',
                type: DataType.BOOLEAN,
                required: false,
                description: 'Test result (true/false)'
            },
            {
                id: 'pass_output',
                name: 'pass',
                type: DataType.ANY,
                required: false,
                description: 'Data when test passes'
            }
        ],
        executor: async (node, inputs, context) => {
            // Assert execution logic will be implemented later
            return null;
        }
    });

    // Variable/Constant Node
    NodeFactory.registerNodeType({
        type: 'variable',
        metadata: {
            title: 'Variable',
            description: 'Store and output constant or variable values',
            category: NodeCategory.UTILITY,
            color: 'bg-gray-500',
            icon: 'variable',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            name: '',
            value: '',
            type: 'string'
        },
        inputs: [],
        outputs: [
            {
                id: 'value_output',
                name: 'value',
                type: DataType.ANY,
                required: false,
                description: 'Variable value'
            }
        ],
        executor: async (node, inputs, context) => {
            // Variable execution logic will be implemented later
            return null;
        }
    });

    // Discovery Node
    NodeFactory.registerNodeType({
        type: 'discovery',
        metadata: {
            title: 'API Discovery',
            description: 'Discover API endpoints dynamically',
            category: NodeCategory.PROCESSOR,
            color: 'bg-purple-500',
            icon: 'Search',
            version: '1.0.0',
            author: 'ChickAPI'
        },
        defaultConfig: {
            url: '',
            discoveryType: 'dynamic', // dynamic, specification, traffic
            crawlDepth: 3,
            timeout: 30000,
            rateLimit: 10,
            simulateInteractions: true,
            includeStaticAssets: false,
            filters: {
                includePaths: [],
                excludePaths: [],
                includeHosts: [],
                excludeHosts: []
            },
            authentication: {
                type: 'none',
                credentials: {}
            },
            exportFormat: 'openapi' // openapi, postman, har, markdown
        },
        inputs: [
            {
                id: 'url_input',
                name: 'url',
                type: DataType.STRING,
                required: true,
                description: 'URL to discover APIs from'
            },
            {
                id: 'spec_input',
                name: 'specification',
                type: DataType.STRING,
                required: false,
                description: 'API specification (OpenAPI, Postman, etc.)'
            },
            {
                id: 'config_input',
                name: 'config',
                type: DataType.OBJECT,
                required: false,
                description: 'Discovery configuration'
            }
        ],
        outputs: [
            {
                id: 'endpoints_output',
                name: 'endpoints',
                type: DataType.ARRAY,
                required: false,
                description: 'Discovered API endpoints'
            },
            {
                id: 'spec_output',
                name: 'specification',
                type: DataType.STRING,
                required: false,
                description: 'Generated API specification'
            },
            {
                id: 'stats_output',
                name: 'statistics',
                type: DataType.OBJECT,
                required: false,
                description: 'Discovery statistics'
            }
        ],
        executor: async (node, inputs, context) => {
            // Discovery execution via API call (server-side only)
            try {
                const config = {
                    sources: {
                        dynamicCrawl: node.config.discoveryType === 'dynamic' ? {
                            enabled: true,
                            url: inputs.url || node.config.url,
                            maxDepth: node.config.crawlDepth,
                            timeout: node.config.timeout,
                            rateLimit: node.config.rateLimit,
                            simulateInteractions: node.config.simulateInteractions,
                            includeStaticAssets: node.config.includeStaticAssets,
                            filters: node.config.filters,
                            authentication: node.config.authentication
                        } : undefined,
                        specifications: node.config.discoveryType === 'specification' && inputs.specification ? [{
                            content: inputs.specification,
                            type: 'openapi'
                        }] : undefined
                    },
                    exportFormat: node.config.exportFormat
                };
                
                // Call server-side API endpoint
                const response = await fetch('/api/discovery/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                
                if (!response.ok) {
                    throw new Error(`Discovery failed: ${response.statusText}`);
                }
                
                const results = await response.json();
                
                return {
                    endpoints: results.endpoints,
                    specification: results.specification,
                    statistics: results.statistics
                };
            } catch (error) {
                console.error('Discovery execution failed:', error);
                throw error;
            }
        },
        validator: (config) => {
            const errors: any[] = [];
            const warnings: any[] = [];
            
            if (!config.url && config.discoveryType === 'dynamic') {
                errors.push({
                    field: 'url',
                    message: 'URL is required for dynamic discovery'
                });
            }
            
            if (config.crawlDepth < 1 || config.crawlDepth > 10) {
                warnings.push({
                    field: 'crawlDepth',
                    message: 'Crawl depth should be between 1 and 10'
                });
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        }
    });
}

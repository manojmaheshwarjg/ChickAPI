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

// Initialize built-in node types
export function initializeBuiltInNodes(): void {
    // HTTP Request Node
    NodeFactory.registerNodeType({
        type: 'http_request',
        metadata: {
            title: 'HTTP Request',
            description: 'Make HTTP requests to APIs',
            category: NodeCategory.HTTP,
            color: '#4CAF50',
            icon: 'http',
            version: '1.0.0',
            author: 'MagicAPI'
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

    // JSON Path Extractor Node
    NodeFactory.registerNodeType({
        type: 'json_path',
        metadata: {
            title: 'JSON Path',
            description: 'Extract data from JSON using JSONPath expressions',
            category: NodeCategory.DATA_TRANSFORM,
            color: '#2196F3',
            icon: 'filter',
            version: '1.0.0',
            author: 'MagicAPI'
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
            color: '#FF9800',
            icon: 'decision',
            version: '1.0.0',
            author: 'MagicAPI'
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
            color: '#9C27B0',
            icon: 'check',
            version: '1.0.0',
            author: 'MagicAPI'
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
            color: '#607D8B',
            icon: 'variable',
            version: '1.0.0',
            author: 'MagicAPI'
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
}

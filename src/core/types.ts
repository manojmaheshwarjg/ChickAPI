// Core data types that can flow between nodes
export enum DataType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    ARRAY = 'array',
    NULL = 'null',
    ANY = 'any',
    HTTP_REQUEST = 'http_request',
    HTTP_RESPONSE = 'http_response',
    FILE = 'file',
    STREAM = 'stream'
}

// Port configuration for node inputs/outputs
export interface Port {
    id: string;
    name: string;
    type: DataType;
    required: boolean;
    description?: string;
    defaultValue?: any;
    validation?: ValidationRule[];
}

// Validation rules for ports and data
export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message?: string;
    validator?: (value: any) => boolean;
}

// Node execution state
export enum NodeStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning'
}

// Node validation state
export interface ValidationState {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
}

// Node metadata for UI rendering
export interface NodeMetadata {
    title: string;
    description: string;
    category: NodeCategory;
    color: string;
    icon?: string;
    version: string;
    author?: string;
    documentation?: string;
}

// Node categories for organization
export enum NodeCategory {
    HTTP = 'http',
    DATA_TRANSFORM = 'data_transform',
    CONTROL_FLOW = 'control_flow',
    INTEGRATION = 'integration',
    TESTING = 'testing',
    UTILITY = 'utility',
    CUSTOM = 'custom'
}

// Generic node configuration
export interface NodeConfig {
    [key: string]: any;
}

// Base node interface
export interface BaseNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    inputs: Port[];
    outputs: Port[];
    config: NodeConfig;
    metadata: NodeMetadata;
    validation: ValidationState;
    status: NodeStatus;
    executionTime?: number;
    lastExecuted?: Date;
    data?: any; // Runtime data storage
}

// Connection between nodes
export interface NodeConnection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
    type: DataType;
}

// Workflow definition
export interface Workflow {
    id: string;
    name: string;
    description: string;
    version: string;
    nodes: BaseNode[];
    connections: NodeConnection[];
    metadata: WorkflowMetadata;
    created: Date;
    modified: Date;
}

export interface WorkflowMetadata {
    author: string;
    tags: string[];
    environment?: string;
    variables?: { [key: string]: any };
}

// Execution context for workflow runs
export interface ExecutionContext {
    workflowId: string;
    executionId: string;
    startTime: Date;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    currentNodeId?: string;
    variables: Map<string, any>;
    errors: ExecutionError[];
    logs: ExecutionLog[];
}

export interface ExecutionError {
    nodeId: string;
    message: string;
    timestamp: Date;
    stack?: string;
}

export interface ExecutionLog {
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestamp: Date;
    nodeId?: string;
    data?: any;
}

// HTTP specific types
export interface HttpRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: any;
    auth?: AuthConfig;
    timeout?: number;
    followRedirects?: boolean;
}

export interface HttpResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    responseTime: number;
    size: number;
}

export interface AuthConfig {
    type: 'none' | 'bearer' | 'basic' | 'oauth1' | 'oauth2' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    // OAuth specific fields
    consumerKey?: string;
    consumerSecret?: string;
    accessToken?: string;
    tokenSecret?: string;
}

// Environment and variable management
export interface Environment {
    id: string;
    name: string;
    variables: EnvironmentVariable[];
    active: boolean;
}

export interface EnvironmentVariable {
    key: string;
    value: string;
    type: 'text' | 'secret' | 'number' | 'boolean';
    description?: string;
}

// Test framework types
export interface TestCase {
    id: string;
    name: string;
    description: string;
    assertions: Assertion[];
    setup?: TestSetup[];
    cleanup?: TestCleanup[];
}

export interface Assertion {
    type: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 
          'less_than' | 'matches_regex' | 'schema_valid' | 'custom';
    actual: string; // JSONPath expression
    expected?: any;
    message?: string;
    customValidator?: (actual: any, expected: any) => boolean;
}

export interface TestSetup {
    type: 'variable' | 'request' | 'script';
    config: any;
}

export interface TestCleanup {
    type: 'variable' | 'request' | 'script';
    config: any;
}

// Plugin system types
export interface NodePlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    nodeTypes: NodeTypeDefinition[];
    dependencies?: string[];
}

export interface NodeTypeDefinition {
    type: string;
    metadata: NodeMetadata;
    defaultConfig: NodeConfig;
    inputs: Port[];
    outputs: Port[];
    executor: NodeExecutor;
    validator?: NodeValidator;
    renderer?: NodeRenderer;
}

export type NodeExecutor = (node: BaseNode, inputs: any, context: ExecutionContext) => Promise<any>;
export type NodeValidator = (config: NodeConfig) => ValidationState;
export type NodeRenderer = (node: BaseNode) => HTMLElement | string;

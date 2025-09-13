# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Development mode (Electron with hot-reload)
npm run dev

# Build TypeScript source
npm run build
npm run build:watch  # with file watching

# Run Electron desktop app
npm start

# Next.js web version
npm run dev:next     # development server at http://localhost:3000
npm run build:next   # build for production
npm run start:next   # production server
npm run export:next  # static export
```

### Testing and Quality
```bash
# Run tests
npm test

# Lint TypeScript files
npm run lint
```

### Packaging
```bash
# Package for distribution (cross-platform)
npm run package
```

## Architecture Overview

ChickAPI is a **dual-platform visual API workflow designer** that runs as both:
- **Electron desktop app** (main target) - provides full native experience
- **Next.js web app** (supplementary) - for browser-based usage

### High-Level Architecture

The application uses a **modular node-based system** where:
- **Workflows** are composed of interconnected **nodes**
- **Nodes** represent operations (HTTP requests, data transformations, tests, etc.)
- **Connections** define data flow between node ports
- **Execution Engine** processes workflows as directed graphs

### Key Components

#### Core System (`src/core/`)
- **`types.ts`** - Complete type system with 267 lines defining data types, node interfaces, workflow definitions, execution contexts, and plugin architecture
- **`NodeFactory.ts`** - Factory pattern implementation for creating, validating, and managing node instances. Includes built-in node type registrations (HTTP, JSON Path, Conditions, Assertions, Variables)

#### Electron Main Process (`src/main.ts`)
- Window management and application lifecycle
- Menu system with workflow operations (New, Open, Save, Run, etc.)
- IPC communication for file dialogs and cross-process messaging
- Environment: `NODE_ENV=development` enables DevTools

#### Next.js Web Interface (`app/`)
- **`page.tsx`** - Main application layout with sidebar, canvas, properties panel, console
- **`layout.tsx`** - Root layout with Inter font and metadata
- Uses dynamic imports to avoid SSR issues with canvas components

#### UI Components (`components/`)
- **Header** - Workflow name, environment selector, run controls, user menu
- **Sidebar** - Categorized node palette with drag-and-drop (HTTP, Data Transform, Control Flow, Testing)
- **Toolbar** - Edit controls (undo/redo), zoom controls, view options

#### Renderer Architecture (`src/renderer/`)
- **Canvas system** for infinite pan/zoom workflow visualization
- **Node rendering** with port-based connections
- **Property management** for node configuration

### Node System Architecture

The node system follows a **plugin architecture** with strong typing:

#### Built-in Node Categories:
1. **HTTP** - GET/POST/PUT/DELETE requests with full configuration
2. **Data Transform** - JSON Path extraction, mapping, filtering, aggregation  
3. **Control Flow** - Conditions, loops, parallel execution, delays
4. **Testing** - Assertions, test cases, response validation
5. **Utility** - Variables, constants, custom functions

#### Node Structure:
- **Ports** - Typed inputs/outputs with validation rules
- **Configuration** - Node-specific settings and parameters
- **Execution Context** - Runtime state, variables, error handling
- **Validation** - Real-time config validation with errors/warnings

### Data Flow System

- **Strong typing** with `DataType` enum (STRING, NUMBER, OBJECT, HTTP_RESPONSE, etc.)
- **Port-based connections** with type compatibility checking
- **Execution context** tracks variables, errors, and execution state
- **Graph-based execution** with support for parallel processing

## File Organization

```
src/
├── core/              # Core business logic and type system
│   ├── types.ts       # Complete type definitions (267 lines)
│   └── NodeFactory.ts # Node creation and management
├── main.ts            # Electron main process
├── renderer/          # Electron renderer (UI)
├── web/               # Web-specific adapters and components
app/                   # Next.js application
components/            # React UI components
docs/
├── ARCHITECTURE.md    # Detailed architectural documentation
```

## Development Environment

### TypeScript Configuration
- **Target**: ES2020 with CommonJS modules
- **Strict mode** enabled with decorators support
- **Output**: `dist/` directory with source maps
- **Dual config**: `tsconfig.json` (Electron) + `tsconfig.next.json` (Next.js)

### Styling and UI
- **Tailwind CSS** with custom enterprise color palette
- **Heroicons** for consistent iconography
- **Inter font** for professional typography
- **Custom animations** (fade-in, slide-up/down)

### Build System
- **TypeScript compiler** for Electron source
- **Next.js** for web build with static export support
- **Electron Builder** for cross-platform packaging
- **Environment-aware builds** (development/production paths)

## Key Development Patterns

### Node Development
When creating new node types, follow the pattern in `NodeFactory.ts`:
- Define metadata (title, description, category, color)
- Specify typed inputs/outputs with validation
- Implement async executor function
- Optional custom validator and renderer

### Component Architecture
- Use React hooks for state management
- Dynamic imports for SSR-incompatible components (canvas)
- Tailwind classes for consistent styling
- Props interfaces for type safety

### File Operations
- Electron handles file dialogs via IPC
- Custom `.chickapi` file format (JSON-based)
- Support for Postman collection import/export
- Environment variable management

## Testing Strategy

The codebase is configured for Jest testing with:
- TypeScript support
- Test coverage reporting
- Lint integration

## Extension Points

### Plugin System
The architecture supports custom node plugins through:
- `NodePlugin` interface for packaging custom nodes
- `NodeTypeDefinition` for defining new node types
- Dynamic node type registration via `NodeFactory.registerNodeType()`

### Authentication
Supports multiple auth types:
- Bearer tokens, Basic auth, OAuth 1.0/2.0, API keys
- Environment variable integration for secure credential storage

### Environment Management
- Multi-environment support (Development, Staging, Production)
- Variable substitution in node configurations
- Secure handling of sensitive data

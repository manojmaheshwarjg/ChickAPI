# WARP.md

This file provides comprehensive guidance to WARP (warp.dev) AI and developers when working with the ChickAPI codebase.

## 🎯 Project Overview

ChickAPI is a **dual-platform visual API workflow designer** that provides:
- **Visual node-based interface** for designing API workflows without code
- **Electron desktop application** for native performance
- **Next.js web application** for browser-based access
- **Intelligent features** including API discovery, auto-generation, and optimization

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

## 🏗️ Architecture Overview

### Platform Support
ChickAPI runs as both:
- **Electron desktop app** (main target) - provides full native experience with file system access
- **Next.js web app** - browser-based with MongoDB backend for persistence

### Technology Stack
- **Frontend**: React 19, TypeScript 5.3, Tailwind CSS
- **Canvas**: ReactFlow 11 for node-based visual programming
- **Desktop**: Electron 28 for cross-platform native apps
- **Backend**: Next.js 15.5, MongoDB for web persistence
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with custom animations

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

## 📁 File Organization

```
.
├── app/                      # Next.js application pages
│   ├── page.tsx             # Main application with ReactFlow canvas
│   ├── discovery/           # API discovery interface
│   ├── test-reactflow/      # ReactFlow testing ground
│   └── layout.tsx           # Root layout with metadata
├── components/              # React UI components
│   ├── reactflow/          # ReactFlow custom nodes and edges
│   │   ├── nodes/          # Custom node components
│   │   └── edges/          # Custom edge components
│   ├── discovery/          # Discovery-related components
│   ├── palette/            # Node palette components
│   ├── canvas/             # Canvas control components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/                     # Core libraries and utilities
│   ├── discovery/          # API discovery system
│   │   ├── DiscoveryOrchestrator.ts
│   │   ├── DynamicCrawler.ts
│   │   ├── EndpointAnalyzer.ts
│   │   └── TestGenerator.ts
│   ├── node-palette/       # Node type definitions
│   │   └── categories/     # Categorized node types
│   ├── WorkflowExecutor.ts
│   ├── WorkflowValidator.ts
│   └── mongodb.ts          # Database connection
├── hooks/                   # Custom React hooks
│   ├── useAdvancedKeyboardShortcuts.ts
│   ├── useCanvasInteraction.ts
│   └── usePerformanceOptimization.ts
├── src/                     # Electron source
│   ├── core/               # Core types and factories
│   ├── main.ts             # Electron main process
│   └── renderer/           # Electron renderer
├── scripts/                 # Utility scripts
│   └── init-mongodb.js     # MongoDB initialization
└── docs/                    # Documentation
    └── ARCHITECTURE.md     # Detailed architecture docs
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

## 🔌 Extension Points

### Plugin System
The architecture supports custom node plugins through:
- `NodePlugin` interface for packaging custom nodes
- `NodeTypeDefinition` for defining new node types
- Dynamic node type registration via `NodeFactory.registerNodeType()`
- Category-based organization in `lib/node-palette/categories/`

### Authentication
Supports multiple auth types:
- Bearer tokens, Basic auth, OAuth 1.0/2.0, API keys
- Environment variable integration for secure credential storage
- Secure credential management with MongoDB storage

### Environment Management
- Multi-environment support (Development, Staging, Production)
- Variable substitution in node configurations
- Secure handling of sensitive data
- Environment-specific configurations

## 🚀 Advanced Features

### API Discovery System
Located in `lib/discovery/`, provides:
- **Static Analysis**: Analyzes codebase for API endpoints
- **Dynamic Crawling**: Discovers APIs through runtime exploration
- **Specification Parsing**: Imports OpenAPI/Swagger specs
- **Test Generation**: Auto-generates test workflows
- **Endpoint Analysis**: Analyzes request/response patterns

### Intelligent Node System
- **AI-Powered Nodes**: GPT, Claude, and other LLM integrations
- **Smart Suggestions**: Context-aware node recommendations
- **Auto-wiring**: Intelligent connection suggestions
- **Validation**: Real-time workflow validation

### Performance Optimizations
- **Virtual Rendering**: Only renders visible nodes
- **Lazy Loading**: Components load on-demand
- **Memoization**: Optimized re-renders
- **Web Workers**: Offloads heavy computations

## 🗄️ Database Schema (MongoDB)

### Collections
- **workflows**: Stores workflow definitions
- **discovery_jobs**: API discovery job tracking
- **discovered_apis**: Discovered API endpoints
- **workflow_executions**: Execution history and logs
- **user_preferences**: User settings and configurations

## 🎨 UI/UX Guidelines

### Design System
- **Color Palette**: Dark theme with blue/purple accents
- **Typography**: Inter font for clarity
- **Icons**: Heroicons and Lucide React
- **Animations**: Smooth transitions with Tailwind animations

### Component Library
Using shadcn/ui components in `components/ui/`:
- Buttons, Dialogs, Dropdowns, Tabs
- Form controls (Input, Select, Switch)
- Data display (Tables, Cards, Badges)
- Feedback (Alerts, Progress, Toasts)

## 🧪 Testing Guidelines

### Test Structure
```bash
# Unit tests for components
npm test

# Integration tests
npm run test:integration

# E2E tests (when implemented)
npm run test:e2e
```

### Test Coverage
- Aim for >80% code coverage
- Focus on critical paths
- Test error scenarios

## 🚢 Deployment

### Vercel Deployment (Web)
```bash
# Deploy to staging
npm run deploy

# Deploy to production
npm run deploy:prod
```

### Docker Deployment
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

### Electron Distribution
```bash
# Package for all platforms
npm run package
```

## 🐛 Debugging Tips

### Common Issues
1. **ReactFlow not rendering**: Check dynamic imports and SSR compatibility
2. **MongoDB connection**: Ensure connection string in `.env.local`
3. **Electron white screen**: Check console for errors, verify paths
4. **Type errors**: Run `npm run type-check` to identify issues

### Debug Commands
```bash
# Check TypeScript types
npm run type-check

# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

## 📚 Key Files Reference

### Core Files
- `app/page.tsx` - Main application entry
- `lib/WorkflowExecutor.ts` - Workflow execution engine
- `lib/discovery/DiscoveryOrchestrator.ts` - API discovery coordinator
- `components/reactflow/ReactFlowCanvas.tsx` - Main canvas component

### Configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment settings

## 🤝 Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass
5. Request review from maintainers

## 📞 Support Resources

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for detailed guides

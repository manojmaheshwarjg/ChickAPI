# MagicAPI - Visual API Flow Designer

<p align="center">
  <img src="https://img.shields.io/badge/electron-v28.0.0-blue.svg" alt="Electron Version">
  <img src="https://img.shields.io/badge/typescript-v5.3.0-blue.svg" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

MagicAPI is a powerful visual programming tool for designing, testing, and managing API workflows. Built with Electron and TypeScript, it provides an intuitive node-based interface for creating complex API integrations without writing code.

## 🌟 Features

### Core Functionality
- **Visual Node-Based Editor**: Drag-and-drop interface for building API workflows
- **Infinite Canvas**: Pan, zoom, and navigate through large workflows with ease
- **Real-Time Execution**: Run and test your API workflows directly within the application
- **Smart Node System**: Pre-built nodes for common operations with extensibility support

### Node Types
- **HTTP Requests**: GET, POST, PUT, DELETE, PATCH with full configuration
- **Data Transformation**: JSON path extraction, string manipulation, data mapping
- **Control Flow**: Conditions, loops, parallel execution
- **Testing & Validation**: Assertions, response validators, schema checking
- **Utilities**: Variables, constants, custom JavaScript functions

### Advanced Features
- **Environment Management**: Switch between dev, staging, and production environments
- **Authentication Support**: Bearer tokens, Basic auth, OAuth, API keys
- **Import/Export**: Compatible with Postman collections and OpenAPI specs
- **Version Control**: Git-friendly workflow files
- **Real-time Collaboration**: (Coming soon)

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MagicAPI.git
cd MagicAPI
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Run MagicAPI:
```bash
npm start
```

### Development Mode

For development with hot-reload:
```bash
npm run dev
```

## 📖 Usage

### Creating Your First Workflow

1. **Add Nodes**: Drag nodes from the palette on the left to the canvas
2. **Connect Nodes**: Click and drag from output ports to input ports
3. **Configure Nodes**: Click on a node to see its properties in the right panel
4. **Run Workflow**: Press F5 or click the Run button in the toolbar

### Keyboard Shortcuts

- `Ctrl/Cmd + N`: New workflow
- `Ctrl/Cmd + O`: Open workflow
- `Ctrl/Cmd + S`: Save workflow
- `F5`: Run workflow
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Delete`: Delete selected nodes
- `Ctrl/Cmd + Mouse Wheel`: Zoom in/out

## 🏗️ Architecture

MagicAPI is built with a modular architecture:

```
src/
├── main.ts              # Electron main process
├── core/
│   ├── types.ts         # TypeScript interfaces
│   └── NodeFactory.ts   # Node creation and management
├── renderer/
│   ├── index.html       # Main UI
│   ├── styles/          # CSS files
│   ├── scripts/         # Renderer scripts
│   └── canvas/          # Canvas management
└── nodes/               # Node implementations
```

## 🛠️ Building from Source

### Windows
```bash
npm run package
```

### macOS
```bash
npm run package
```

### Linux
```bash
npm run package
```

The packaged application will be in the `build/` directory.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Connection system with bezier curves
- [ ] Workflow execution engine
- [ ] File save/load functionality
- [ ] HTTP request implementation
- [ ] Data transformation nodes
- [ ] Testing framework integration
- [ ] Plugin system for custom nodes
- [ ] Real-time collaboration
- [ ] Cloud sync and sharing
- [ ] AI-powered workflow suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI inspired by modern node-based editors
- Icons from [Material Design Icons](https://materialdesignicons.com/)

## 📧 Contact

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/MagicAPI/issues)
- Email: your.email@example.com

---

<p align="center">Made with ❤️ by the MagicAPI Team</p>

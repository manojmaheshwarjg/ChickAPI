// Web version of MagicAPI - no Electron dependencies
import { CanvasManager } from '../renderer/canvas/CanvasManager';
import { NodeFactory, initializeBuiltInNodes } from '../core/NodeFactory';
import { BaseNode, NodeCategory, Workflow } from '../core/types';
import { v4 as uuidv4 } from 'uuid';
import { WebFileAdapter } from './adapters/WebFileAdapter';
import { WebStorageAdapter } from './adapters/WebStorageAdapter';

class MagicAPIWebApp {
    private canvasManager: CanvasManager | null = null;
    private currentWorkflow: Workflow | null = null;
    private selectedNodes: Set<string> = new Set();
    private copiedNodes: BaseNode[] = [];
    private fileAdapter: WebFileAdapter;
    private storageAdapter: WebStorageAdapter;

    constructor() {
        this.fileAdapter = new WebFileAdapter();
        this.storageAdapter = new WebStorageAdapter();
        this.init();
    }

    private async init(): Promise<void> {
        // Initialize node factory with built-in nodes
        initializeBuiltInNodes();

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    private setupUI(): void {
        // Initialize canvas
        const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
        if (canvas) {
            this.canvasManager = new CanvasManager(canvas);
            this.setupCanvasEvents();
        }

        // Setup toolbar
        this.setupToolbar();

        // Setup node palette
        this.setupNodePalette();

        // Setup console
        this.setupConsole();

        // Setup web-specific features
        this.setupWebFeatures();

        // Load last workflow or create new
        this.loadOrCreateWorkflow();
    }

    private setupWebFeatures(): void {
        // GitHub button
        document.getElementById('btn-github')?.addEventListener('click', () => {
            window.open('https://github.com/manojmaheshwarjg/MagicAPI', '_blank');
        });

        // Fullscreen button
        document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Auto-save to localStorage
        setInterval(() => {
            if (this.currentWorkflow) {
                this.storageAdapter.saveWorkflow(this.currentWorkflow);
            }
        }, 30000); // Save every 30 seconds

        // Handle beforeunload
        window.addEventListener('beforeunload', (e) => {
            if (this.currentWorkflow && this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    private setupCanvasEvents(): void {
        if (!this.canvasManager) return;

        this.canvasManager.on('canvas:click', (worldPos) => {
            this.handleCanvasClick(worldPos);
        });

        this.canvasManager.on('canvas:contextmenu', (worldPos) => {
            this.showCanvasContextMenu(worldPos);
        });

        this.canvasManager.on('canvas:render', (ctx) => {
            this.renderWorkflow(ctx);
        });

        this.canvasManager.on('viewport:change', (viewport) => {
            this.updateZoomDisplay(viewport.zoom);
        });
    }

    private setupToolbar(): void {
        // File operations
        document.getElementById('btn-new')?.addEventListener('click', () => this.newWorkflow());
        document.getElementById('btn-open')?.addEventListener('click', () => this.openWorkflow());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveWorkflow());

        // Edit operations
        document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
        document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());

        // Execution
        document.getElementById('btn-run')?.addEventListener('click', () => this.runWorkflow());
        document.getElementById('btn-stop')?.addEventListener('click', () => this.stopWorkflow());

        // Zoom controls
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.canvasManager?.zoomIn());
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.canvasManager?.zoomOut());
        document.getElementById('btn-zoom-fit')?.addEventListener('click', () => this.fitToContent());
    }

    private setupNodePalette(): void {
        const paletteContent = document.getElementById('palette-content');
        if (!paletteContent) return;

        // Group nodes by category
        const nodesByCategory = new Map<NodeCategory, any[]>();
        
        for (const nodeType of NodeFactory.getRegisteredTypes()) {
            const category = nodeType.metadata.category;
            if (!nodesByCategory.has(category)) {
                nodesByCategory.set(category, []);
            }
            nodesByCategory.get(category)!.push(nodeType);
        }

        // Create palette UI
        nodesByCategory.forEach((nodes, category) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'node-category';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <span class="category-icon">▼</span>
                <span class="category-name">${this.formatCategoryName(category)}</span>
            `;
            categoryDiv.appendChild(categoryHeader);
            
            const nodeList = document.createElement('div');
            nodeList.className = 'node-list';
            
            nodes.forEach(nodeType => {
                const nodeItem = document.createElement('div');
                nodeItem.className = 'node-item';
                nodeItem.draggable = true;
                nodeItem.dataset.nodeType = nodeType.type;
                nodeItem.innerHTML = `
                    <div class="node-item-color" style="background-color: ${nodeType.metadata.color}"></div>
                    <div class="node-item-content">
                        <div class="node-item-title">${nodeType.metadata.title}</div>
                        <div class="node-item-description">${nodeType.metadata.description}</div>
                    </div>
                `;
                
                // Setup drag and drop
                nodeItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer!.setData('nodeType', nodeType.type);
                });
                
                nodeList.appendChild(nodeItem);
            });
            
            categoryDiv.appendChild(nodeList);
            paletteContent.appendChild(categoryDiv);
            
            // Toggle category
            categoryHeader.addEventListener('click', () => {
                const icon = categoryHeader.querySelector('.category-icon') as HTMLElement;
                if (nodeList.style.display === 'none') {
                    nodeList.style.display = 'block';
                    icon.textContent = '▼';
                } else {
                    nodeList.style.display = 'none';
                    icon.textContent = '▶';
                }
            });
        });

        // Setup search
        const searchInput = document.getElementById('node-search') as HTMLInputElement;
        searchInput?.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value.toLowerCase();
            this.filterNodes(query);
        });

        // Setup canvas drop
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer?.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';
        });
        
        canvasContainer?.addEventListener('drop', (e) => {
            e.preventDefault();
            const nodeType = e.dataTransfer!.getData('nodeType');
            if (nodeType && this.canvasManager) {
                const rect = canvasContainer.getBoundingClientRect();
                const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                const worldPos = this.canvasManager.screenToWorld(screenPos);
                const snappedPos = this.canvasManager.snapToGrid(worldPos);
                this.createNode(nodeType, snappedPos);
            }
        });
    }

    private setupConsole(): void {
        const clearBtn = document.getElementById('btn-clear-console');
        const toggleBtn = document.getElementById('btn-toggle-console');
        const consolePanel = document.getElementById('console-panel');
        
        clearBtn?.addEventListener('click', () => {
            const content = document.getElementById('console-content');
            if (content) content.innerHTML = '';
        });
        
        toggleBtn?.addEventListener('click', () => {
            if (consolePanel) {
                consolePanel.classList.toggle('collapsed');
                toggleBtn.textContent = consolePanel.classList.contains('collapsed') ? '▲' : '▼';
            }
        });
    }

    private formatCategoryName(category: NodeCategory): string {
        return category.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private filterNodes(query: string): void {
        const nodeItems = document.querySelectorAll('.node-item');
        nodeItems.forEach(item => {
            const title = item.querySelector('.node-item-title')?.textContent?.toLowerCase() || '';
            const description = item.querySelector('.node-item-description')?.textContent?.toLowerCase() || '';
            const matches = title.includes(query) || description.includes(query);
            (item as HTMLElement).style.display = matches ? 'flex' : 'none';
        });
        
        // Show/hide categories based on visible nodes
        document.querySelectorAll('.node-category').forEach(category => {
            const hasVisibleNodes = category.querySelector('.node-item[style*="flex"]') !== null;
            (category as HTMLElement).style.display = hasVisibleNodes ? 'block' : 'none';
        });
    }

    private loadOrCreateWorkflow(): void {
        const savedWorkflow = this.storageAdapter.loadWorkflow();
        if (savedWorkflow) {
            this.currentWorkflow = savedWorkflow;
            this.canvasManager?.render();
            this.log('info', 'Loaded previous workflow from browser storage');
        } else {
            this.newWorkflow();
        }
    }

    private newWorkflow(): void {
        if (this.hasUnsavedChanges()) {
            if (!confirm('You have unsaved changes. Are you sure you want to create a new workflow?')) {
                return;
            }
        }

        this.currentWorkflow = {
            id: uuidv4(),
            name: 'Untitled Workflow',
            description: '',
            version: '1.0.0',
            nodes: [],
            connections: [],
            metadata: {
                author: 'User',
                tags: []
            },
            created: new Date(),
            modified: new Date()
        };
        
        this.selectedNodes.clear();
        this.canvasManager?.render();
        this.storageAdapter.saveWorkflow(this.currentWorkflow);
        this.log('info', 'New workflow created');
    }

    private async openWorkflow(): Promise<void> {
        try {
            const workflow = await this.fileAdapter.openWorkflow();
            if (workflow) {
                this.currentWorkflow = workflow;
                this.canvasManager?.render();
                this.storageAdapter.saveWorkflow(workflow);
                this.log('info', `Opened workflow: ${workflow.name}`);
            }
        } catch (error) {
            this.log('error', `Failed to open workflow: ${error}`);
        }
    }

    private async saveWorkflow(): Promise<void> {
        if (!this.currentWorkflow) return;
        
        try {
            await this.fileAdapter.saveWorkflow(this.currentWorkflow);
            this.currentWorkflow.modified = new Date();
            this.storageAdapter.saveWorkflow(this.currentWorkflow);
            this.log('info', `Saved workflow: ${this.currentWorkflow.name}`);
        } catch (error) {
            this.log('error', `Failed to save workflow: ${error}`);
        }
    }

    private hasUnsavedChanges(): boolean {
        // Simple implementation - in production, track actual changes
        return this.currentWorkflow !== null && this.currentWorkflow.nodes.length > 0;
    }

    private undo(): void {
        // TODO: Implement undo functionality
        this.log('info', 'Undo functionality coming soon');
    }

    private redo(): void {
        // TODO: Implement redo functionality
        this.log('info', 'Redo functionality coming soon');
    }

    private runWorkflow(): void {
        if (!this.currentWorkflow) return;
        
        (document.getElementById('btn-run') as HTMLButtonElement).disabled = true;
        (document.getElementById('btn-stop') as HTMLButtonElement).disabled = false;
        
        this.log('info', 'Running workflow...');
        // TODO: Implement workflow execution
        
        // Simulate execution completion
        setTimeout(() => {
            (document.getElementById('btn-run') as HTMLButtonElement).disabled = false;
            (document.getElementById('btn-stop') as HTMLButtonElement).disabled = true;
            this.log('success', 'Workflow execution completed');
        }, 2000);
    }

    private stopWorkflow(): void {
        (document.getElementById('btn-run') as HTMLButtonElement).disabled = false;
        (document.getElementById('btn-stop') as HTMLButtonElement).disabled = true;
        
        this.log('info', 'Stopped workflow execution');
    }

    private createNode(type: string, position: { x: number; y: number }): void {
        if (!this.currentWorkflow) return;
        
        const node = NodeFactory.createNode(type, position);
        if (node) {
            this.currentWorkflow.nodes.push(node);
            this.currentWorkflow.modified = new Date();
            this.canvasManager?.render();
            this.log('info', `Created ${node.metadata.title} node`);
        }
    }

    private handleCanvasClick(worldPos: { x: number; y: number }): void {
        // Handle node selection
        const clickedNode = this.getNodeAtPosition(worldPos);
        
        if (clickedNode) {
            this.selectNode(clickedNode.id);
        } else {
            this.clearSelection();
        }
    }

    private showCanvasContextMenu(worldPos: { x: number; y: number }): void {
        // Show context menu implementation
    }

    private getNodeAtPosition(pos: { x: number; y: number }): BaseNode | null {
        if (!this.currentWorkflow) return null;
        
        // Simple hit test - will be improved later
        for (const node of this.currentWorkflow.nodes) {
            if (pos.x >= node.position.x && pos.x <= node.position.x + node.size.width &&
                pos.y >= node.position.y && pos.y <= node.position.y + node.size.height) {
                return node;
            }
        }
        
        return null;
    }

    private selectNode(nodeId: string): void {
        this.selectedNodes.clear();
        this.selectedNodes.add(nodeId);
        this.canvasManager?.render();
        
        // Update properties panel
        const node = this.currentWorkflow?.nodes.find(n => n.id === nodeId);
        if (node) {
            this.showNodeProperties(node);
        }
    }

    private clearSelection(): void {
        this.selectedNodes.clear();
        this.canvasManager?.render();
        this.showEmptyProperties();
    }

    private showNodeProperties(node: BaseNode): void {
        const propertiesTitle = document.getElementById('properties-title');
        const propertiesContent = document.getElementById('properties-content');
        
        if (propertiesTitle && propertiesContent) {
            propertiesTitle.textContent = node.metadata.title;
            propertiesContent.innerHTML = '<p>Properties panel coming soon...</p>';
        }
    }

    private showEmptyProperties(): void {
        const propertiesTitle = document.getElementById('properties-title');
        const propertiesContent = document.getElementById('properties-content');
        
        if (propertiesTitle && propertiesContent) {
            propertiesTitle.textContent = 'Properties';
            propertiesContent.innerHTML = '<div class="empty-state"><p>Select a node to view its properties</p></div>';
        }
    }

    private renderWorkflow(ctx: CanvasRenderingContext2D): void {
        if (!this.currentWorkflow) return;
        
        // Render nodes
        this.currentWorkflow.nodes.forEach(node => {
            this.renderNode(ctx, node);
        });
        
        // Render connections (will be implemented later)
    }

    private renderNode(ctx: CanvasRenderingContext2D, node: BaseNode): void {
        const isSelected = this.selectedNodes.has(node.id);
        
        // Node background
        ctx.fillStyle = node.metadata.color || '#666';
        ctx.fillRect(node.position.x, node.position.y, node.size.width, node.size.height);
        
        // Node border
        ctx.strokeStyle = isSelected ? '#fff' : '#333';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(node.position.x, node.position.y, node.size.width, node.size.height);
        
        // Node title
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            node.metadata.title,
            node.position.x + node.size.width / 2,
            node.position.y + 30
        );
        
        // Status indicator
        if (node.status !== 'idle') {
            const statusColors = {
                running: '#2196f3',
                success: '#4caf50',
                error: '#f44336',
                warning: '#ff9800'
            };
            
            ctx.fillStyle = statusColors[node.status] || '#666';
            ctx.beginPath();
            ctx.arc(
                node.position.x + node.size.width - 10,
                node.position.y + 10,
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    private fitToContent(): void {
        if (!this.currentWorkflow || this.currentWorkflow.nodes.length === 0) return;
        
        const bounds = {
            left: Infinity,
            top: Infinity,
            right: -Infinity,
            bottom: -Infinity
        };
        
        this.currentWorkflow.nodes.forEach(node => {
            bounds.left = Math.min(bounds.left, node.position.x);
            bounds.top = Math.min(bounds.top, node.position.y);
            bounds.right = Math.max(bounds.right, node.position.x + node.size.width);
            bounds.bottom = Math.max(bounds.bottom, node.position.y + node.size.height);
        });
        
        this.canvasManager?.fitToContent(bounds);
    }

    private updateZoomDisplay(zoom: number): void {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
        }
    }

    private log(level: 'info' | 'success' | 'warning' | 'error', message: string): void {
        const consoleContent = document.getElementById('console-content');
        if (!consoleContent) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${level}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level">[${level.toUpperCase()}]</span>
            <span class="log-message">${message}</span>
        `;
        
        consoleContent.appendChild(logEntry);
        consoleContent.scrollTop = consoleContent.scrollHeight;
    }
}

// Initialize the web application
new MagicAPIWebApp();

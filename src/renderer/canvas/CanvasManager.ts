import { EventEmitter } from 'events';

export interface Point {
    x: number;
    y: number;
}

export interface Viewport {
    x: number;
    y: number;
    zoom: number;
}

export interface CanvasOptions {
    minZoom: number;
    maxZoom: number;
    gridSize: number;
    snapToGrid: boolean;
}

export class CanvasManager extends EventEmitter {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private viewport: Viewport = { x: 0, y: 0, zoom: 1 };
    private isDragging = false;
    private dragStart: Point | null = null;
    private lastMousePos: Point = { x: 0, y: 0 };
    private options: CanvasOptions;

    constructor(canvas: HTMLCanvasElement, options: Partial<CanvasOptions> = {}) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        this.options = {
            minZoom: 0.1,
            maxZoom: 5,
            gridSize: 20,
            snapToGrid: true,
            ...options
        };

        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }

    private setupCanvas(): void {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    private resizeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }

    private setupEventListeners(): void {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events for future mobile support
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    private handleMouseDown(e: MouseEvent): void {
        const pos = this.getMousePos(e);
        
        if (e.button === 0) { // Left click
            this.emit('canvas:click', this.screenToWorld(pos));
        } else if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+Left
            this.isDragging = true;
            this.dragStart = pos;
            this.canvas.style.cursor = 'grabbing';
        } else if (e.button === 2) { // Right click
            this.emit('canvas:contextmenu', this.screenToWorld(pos));
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        const pos = this.getMousePos(e);
        this.lastMousePos = pos;

        if (this.isDragging && this.dragStart) {
            const dx = pos.x - this.dragStart.x;
            const dy = pos.y - this.dragStart.y;
            
            this.viewport.x += dx;
            this.viewport.y += dy;
            
            this.dragStart = pos;
            this.render();
            this.emit('viewport:change', this.viewport);
        } else {
            this.emit('canvas:mousemove', this.screenToWorld(pos));
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragStart = null;
            this.canvas.style.cursor = 'grab';
        }
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        
        const pos = this.getMousePos(e);
        const worldPos = this.screenToWorld(pos);
        
        // Calculate zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(
            this.options.minZoom,
            Math.min(this.options.maxZoom, this.viewport.zoom * delta)
        );
        
        // Adjust viewport to zoom around mouse position
        this.viewport.x = pos.x - (worldPos.x * newZoom);
        this.viewport.y = pos.y - (worldPos.y * newZoom);
        this.viewport.zoom = newZoom;
        
        this.render();
        this.emit('viewport:change', this.viewport);
    }

    private handleTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.handleMouseDown(touch as any);
        }
    }

    private handleTouchMove(e: TouchEvent): void {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch as any);
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        this.handleMouseUp(e as any);
    }

    private getMousePos(e: MouseEvent | Touch): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    public screenToWorld(screenPos: Point): Point {
        return {
            x: (screenPos.x - this.viewport.x) / this.viewport.zoom,
            y: (screenPos.y - this.viewport.y) / this.viewport.zoom
        };
    }

    public worldToScreen(worldPos: Point): Point {
        return {
            x: worldPos.x * this.viewport.zoom + this.viewport.x,
            y: worldPos.y * this.viewport.zoom + this.viewport.y
        };
    }

    public snapToGrid(pos: Point): Point {
        if (!this.options.snapToGrid) return pos;
        
        return {
            x: Math.round(pos.x / this.options.gridSize) * this.options.gridSize,
            y: Math.round(pos.y / this.options.gridSize) * this.options.gridSize
        };
    }

    public render(): void {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply viewport transformation
        this.ctx.translate(this.viewport.x, this.viewport.y);
        this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
        
        // Draw grid
        this.drawGrid();
        
        // Emit render event for other components to draw
        this.emit('canvas:render', this.ctx);
        
        // Restore context state
        this.ctx.restore();
        
        // Draw UI elements (minimap, etc.) that shouldn't be transformed
        this.drawUI();
    }

    private drawGrid(): void {
        const gridSize = this.options.gridSize;
        const viewport = this.getVisibleWorldBounds();
        
        // Calculate grid bounds
        const startX = Math.floor(viewport.left / gridSize) * gridSize;
        const startY = Math.floor(viewport.top / gridSize) * gridSize;
        const endX = Math.ceil(viewport.right / gridSize) * gridSize;
        const endY = Math.ceil(viewport.bottom / gridSize) * gridSize;
        
        // Draw minor grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        this.ctx.lineWidth = 1;
        
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
        
        // Draw major grid lines
        const majorGridSize = gridSize * 5;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        
        for (let x = Math.floor(viewport.left / majorGridSize) * majorGridSize; x <= endX; x += majorGridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        for (let y = Math.floor(viewport.top / majorGridSize) * majorGridSize; y <= endY; y += majorGridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
        
        // Draw origin lines
        if (viewport.left <= 0 && viewport.right >= 0) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, startY);
            this.ctx.lineTo(0, endY);
            this.ctx.stroke();
        }
        
        if (viewport.top <= 0 && viewport.bottom >= 0) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(startX, 0);
            this.ctx.lineTo(endX, 0);
            this.ctx.stroke();
        }
    }

    private drawUI(): void {
        // Draw zoom indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`${Math.round(this.viewport.zoom * 100)}%`, 10, this.canvas.height - 10);
    }

    private getVisibleWorldBounds() {
        const topLeft = this.screenToWorld({ x: 0, y: 0 });
        const bottomRight = this.screenToWorld({ x: this.canvas.width, y: this.canvas.height });
        
        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    public getViewport(): Viewport {
        return { ...this.viewport };
    }

    public setViewport(viewport: Partial<Viewport>): void {
        this.viewport = { ...this.viewport, ...viewport };
        this.render();
        this.emit('viewport:change', this.viewport);
    }

    public zoomIn(): void {
        this.zoom(1.2);
    }

    public zoomOut(): void {
        this.zoom(0.8);
    }

    public zoom(factor: number, center?: Point): void {
        const targetPoint = center || { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const worldPos = this.screenToWorld(targetPoint);
        
        const newZoom = Math.max(
            this.options.minZoom,
            Math.min(this.options.maxZoom, this.viewport.zoom * factor)
        );
        
        this.viewport.x = targetPoint.x - (worldPos.x * newZoom);
        this.viewport.y = targetPoint.y - (worldPos.y * newZoom);
        this.viewport.zoom = newZoom;
        
        this.render();
        this.emit('viewport:change', this.viewport);
    }

    public fitToContent(bounds: { left: number; top: number; right: number; bottom: number }): void {
        const padding = 50;
        const contentWidth = bounds.right - bounds.left;
        const contentHeight = bounds.bottom - bounds.top;
        
        const scaleX = (this.canvas.width - padding * 2) / contentWidth;
        const scaleY = (this.canvas.height - padding * 2) / contentHeight;
        const scale = Math.min(scaleX, scaleY, this.options.maxZoom);
        
        this.viewport.zoom = scale;
        this.viewport.x = (this.canvas.width - contentWidth * scale) / 2 - bounds.left * scale;
        this.viewport.y = (this.canvas.height - contentHeight * scale) / 2 - bounds.top * scale;
        
        this.render();
        this.emit('viewport:change', this.viewport);
    }

    public destroy(): void {
        this.removeAllListeners();
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

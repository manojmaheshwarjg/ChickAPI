import { Workflow } from '../../core/types';

export class WebStorageAdapter {
    private readonly STORAGE_KEY = 'magicapi_current_workflow';
    private readonly RECENT_KEY = 'magicapi_recent_workflows';
    
    /**
     * Save workflow to localStorage
     */
    saveWorkflow(workflow: Workflow): void {
        try {
            const data = JSON.stringify(workflow);
            localStorage.setItem(this.STORAGE_KEY, data);
            
            // Update recent workflows
            this.addToRecent(workflow);
        } catch (error) {
            console.error('Failed to save workflow to localStorage:', error);
        }
    }
    
    /**
     * Load workflow from localStorage
     */
    loadWorkflow(): Workflow | null {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return null;
            
            const workflow = JSON.parse(data);
            
            // Convert dates from strings
            workflow.created = new Date(workflow.created);
            workflow.modified = new Date(workflow.modified);
            
            return workflow;
        } catch (error) {
            console.error('Failed to load workflow from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Clear current workflow from localStorage
     */
    clearWorkflow(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
    
    /**
     * Get recent workflows
     */
    getRecentWorkflows(): Array<{id: string, name: string, modified: Date}> {
        try {
            const data = localStorage.getItem(this.RECENT_KEY);
            if (!data) return [];
            
            const recent = JSON.parse(data);
            return recent.map((item: any) => ({
                ...item,
                modified: new Date(item.modified)
            }));
        } catch (error) {
            console.error('Failed to load recent workflows:', error);
            return [];
        }
    }
    
    /**
     * Add workflow to recent list
     */
    private addToRecent(workflow: Workflow): void {
        try {
            const recent = this.getRecentWorkflows();
            
            // Remove if already exists
            const filtered = recent.filter(r => r.id !== workflow.id);
            
            // Add to beginning
            filtered.unshift({
                id: workflow.id,
                name: workflow.name,
                modified: workflow.modified
            });
            
            // Keep only last 10
            const trimmed = filtered.slice(0, 10);
            
            localStorage.setItem(this.RECENT_KEY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Failed to update recent workflows:', error);
        }
    }
    
    /**
     * Get all stored data size
     */
    getStorageSize(): number {
        let totalSize = 0;
        
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        return totalSize;
    }
    
    /**
     * Check if storage is available
     */
    static isAvailable(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

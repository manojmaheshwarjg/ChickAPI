import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import * as path from 'path';

class ChickAPIApplication {
    private mainWindow: BrowserWindow | null = null;
    private isDevelopment = process.env.NODE_ENV === 'development';

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        // Handle app ready
        app.whenReady().then(() => {
            this.createMainWindow();
            this.setupMenu();
            this.setupIPC();

            app.on('activate', () => {
                // On macOS it's common to re-create a window when the dock icon is clicked
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createMainWindow();
                }
            });
        });

        // Quit when all windows are closed
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    private createMainWindow(): void {
        // Create the browser window
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            title: 'ChickAPI - Visual API Flow Designer',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            show: false,
            titleBarStyle: 'default'
        });

        // Load the renderer
        const rendererPath = path.join(__dirname, '..', 'src', 'renderer', 'index.html');
        this.mainWindow.loadFile(rendererPath);

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
            
            if (this.isDevelopment) {
                this.mainWindow?.webContents.openDevTools();
            }
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private setupMenu(): void {
        const template: any[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Workflow',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => this.handleNewWorkflow()
                    },
                    {
                        label: 'Open Workflow',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.handleOpenWorkflow()
                    },
                    {
                        label: 'Save Workflow',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => this.handleSaveWorkflow()
                    },
                    {
                        label: 'Save As...',
                        accelerator: 'CmdOrCtrl+Shift+S',
                        click: () => this.handleSaveAsWorkflow()
                    },
                    { type: 'separator' },
                    {
                        label: 'Export',
                        submenu: [
                            { label: 'Export as Postman Collection' },
                            { label: 'Export as OpenAPI Spec' },
                            { label: 'Export as Code' }
                        ]
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => app.quit()
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                    { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                    { type: 'separator' },
                    { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                    { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                    { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                    { type: 'separator' },
                    { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                    { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                    { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
                    { type: 'separator' },
                    { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                    { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                    { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                    { type: 'separator' },
                    { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Workflow',
                submenu: [
                    {
                        label: 'Run Workflow',
                        accelerator: 'F5',
                        click: () => this.handleRunWorkflow()
                    },
                    {
                        label: 'Stop Execution',
                        accelerator: 'Shift+F5',
                        click: () => this.handleStopWorkflow()
                    },
                    { type: 'separator' },
                    {
                        label: 'Validate Workflow',
                        click: () => this.handleValidateWorkflow()
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About ChickAPI',
                        click: () => this.handleAbout()
                    },
                    {
                        label: 'Documentation',
                        click: () => this.handleDocumentation()
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    private setupIPC(): void {
        // Handle file operations
        ipcMain.handle('show-open-dialog', async () => {
            const result = await dialog.showOpenDialog(this.mainWindow!, {
                filters: [
                    { name: 'ChickAPI Workflows', extensions: ['chickapi'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ],
                properties: ['openFile']
            });
            return result;
        });

        ipcMain.handle('show-save-dialog', async () => {
            const result = await dialog.showSaveDialog(this.mainWindow!, {
                filters: [
                    { name: 'ChickAPI Workflows', extensions: ['chickapi'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ]
            });
            return result;
        });
    }

    // Menu handlers
    private handleNewWorkflow(): void {
        this.mainWindow?.webContents.send('menu-new-workflow');
    }

    private handleOpenWorkflow(): void {
        this.mainWindow?.webContents.send('menu-open-workflow');
    }

    private handleSaveWorkflow(): void {
        this.mainWindow?.webContents.send('menu-save-workflow');
    }

    private handleSaveAsWorkflow(): void {
        this.mainWindow?.webContents.send('menu-save-as-workflow');
    }

    private handleRunWorkflow(): void {
        this.mainWindow?.webContents.send('menu-run-workflow');
    }

    private handleStopWorkflow(): void {
        this.mainWindow?.webContents.send('menu-stop-workflow');
    }

    private handleValidateWorkflow(): void {
        this.mainWindow?.webContents.send('menu-validate-workflow');
    }

    private handleAbout(): void {
        dialog.showMessageBox(this.mainWindow!, {
            type: 'info',
            title: 'About ChickAPI',
            message: 'ChickAPI - Visual API Flow Designer',
            detail: 'Version 1.0.0\n\nA powerful visual programming tool for designing and testing API workflows.'
        });
    }

    private handleDocumentation(): void {
        // Open documentation in default browser or show help dialog
        this.mainWindow?.webContents.send('show-documentation');
    }
}

// Create the application instance
new ChickAPIApplication();

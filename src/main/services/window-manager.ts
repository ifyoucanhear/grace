import { BrowserWindow, Menu, Tray, app } from "electron";
import { t } from "i18next";
import path from "node:path";

// isso permite que o typescript pegue as constantes mágicas geradas
// automaticamente pelo plugin webpack do forge que informa ao
// aplicativo electron onde procurar o código do aplicativo
// empacotado no webpack.

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class WindowManager {
    public static mainWindow: Electron.BrowserWindow | null = null;
  
    public static createMainWindow() {
        // cria a janela do navegador
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 720,

            minWidth: 1024,
            minHeight: 540,

            titleBarStyle: "hidden",
            icon: path.join(__dirname, "..", "..", "images", "icon.png"),
            trafficLightPosition: { x: 16, y: 16 },

            titleBarOverlay: {
                symbolColor: "#DADBE1",
                color: "#151515",
                height: 34,
            },

            webPreferences: {
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
            }
        });
    
        this.mainWindow.removeMenu();
    
        this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    
        this.mainWindow.webContents.on("did-finish-load", () => {
            if (!app.isPackaged) {
                // abre o devtools
                this.mainWindow.webContents.openDevTools();
            }
        });
    
        this.mainWindow.on("close", () => {
            WindowManager.mainWindow.setProgressBar(-1);
        });
    }
  
    public static redirect(path: string) {
        if (!this.mainWindow)
            this.createMainWindow();

        this.mainWindow.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY}#${path}`);
    
        if (this.mainWindow.isMinimized())
            this.mainWindow.restore();

        this.mainWindow.focus();
    }
  
    public static createSystemTray(language: string) {
        const tray = new Tray(
            app.isPackaged
                ? path.join(process.resourcesPath, "icon_tray.png")
                : path.join(__dirname, "..", "..", "resources", "icon_tray.png")
        );
    
        const contextMenu = Menu.buildFromTemplate([
            {
                label: t("open", {
                    ns: "system_tray",
                    lng: language
                }),

                type: "normal",

                click: () => {
                    if (this.mainWindow) {
                        this.mainWindow.show();
                    } else {
                        this.createMainWindow();
                    }
                }
            }, {
                label: t("quit", {
                    ns: "system_tray",
                    lng: language
                }),

                type: "normal",

                click: () => app.quit()
            }
        ]);
    
        tray.setToolTip("Grace");
        tray.setContextMenu(contextMenu);
    
        if (process.platform === "win32") {
            tray.addListener("click", () => {
                if (this.mainWindow) {
                    if (WindowManager.mainWindow.isMinimized())
                        WindowManager.mainWindow.restore();
        
                    WindowManager.mainWindow.focus();
                    
                    return;
                }
        
                this.createMainWindow();
            });
        }
    }
}
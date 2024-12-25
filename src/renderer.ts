/**
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 * https://electronjs.org/docs/tutorial/security
 * 
 * para habilitar a integração node.js a esse arquivo, abra o `main.ts` e
 * habilite a flag `nodeIntegration`:
 * 
 * ```ts
 * // crie a janela do navegador
 * mainWindow = new BrowserWindow({
 *     width: 800,
 *     height: 600,
 *     webPreferences: {
 *         nodeIntegration: true
 *     }
 * });
 * ```
 */

import "./renderer/main";
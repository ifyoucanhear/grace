import { dialog } from "electron";
import { WindowManager } from "@main/services";
import { registerEvent } from "../register-event";

const showOpenDialog = async (
    _event: Electron.IpcMainInvokeEvent,
    options: Electron.OpenDialogOptions
) => dialog.showOpenDialog(WindowManager.mainWindow, options);

registerEvent(showOpenDialog, {
    name: "showOpenDialog"
});
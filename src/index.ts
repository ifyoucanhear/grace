import { app, BrowserWindow } from "electron";
import { init } from "@sentry/electron/main";
import i18n from "i18next";
import path from "node:path";

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock)
    app.quit();
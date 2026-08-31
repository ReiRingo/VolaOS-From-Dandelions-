const { app, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');

const settingsPath = path.join(process.env.LOCALAPPDATA, 'Dandelions', 'settings.json');

Menu.setApplicationMenu(null);

function createWindow() {
    const win = new BrowserWindow
    ({
        width: 600 + 200,
        height: 450 + 200,
        maximizable: false,
        resizable: false,
        transparent: false,
        frame: true,
        fullscreenable: false,
        webPreferences:
        {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'assets/icon.png')

    });

    win.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('load-settings', async () =>
{
    try
    {
        if (!await fs.pathExists(settingsPath))
        {
            return null;
        }

        return await fs.readJson(settingsPath);
    }
    catch (err)
    {
        console.error('Error reading settings:', err);
        return null;
    }
});

ipcMain.handle('save-settings', async (event, data) =>
{
    try
    {
        await fs.ensureDir(path.dirname(settingsPath));
        await fs.writeJson(settingsPath, data, { spaces: 2 });
        return { success: true };
    }
    catch (err)
    {
        return { success: false, error: err.message };
    }
});
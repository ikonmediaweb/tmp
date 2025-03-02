import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

ipcMain.handle('save-file-to-assets', async (_, file) => {
  const assetsDir = path.join(app.getPath('userData'), 'assets');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const fileName = file.name;
  const targetPath = path.join(assetsDir, fileName);

  await fs.promises.writeFile(targetPath, file.buffer);
  
  return targetPath;
});
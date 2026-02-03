import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tutorialPath = path.resolve(__dirname, '../tutorial/index.html');

console.log('Opening tutorial in browser:', tutorialPath);

const child = spawn('powershell', [
  '-Command',
  `Start-Process msedge -ArgumentList "${tutorialPath}"`
], {
  detached: true,
  stdio: 'ignore'
});
child.unref();

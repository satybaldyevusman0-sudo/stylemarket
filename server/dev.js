// Локалдык API сервер: http://localhost:3001
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// .env файлын окуу (кошумча пакетсиз)
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const { default: handler } = await import('./app.js');
const PORT = Number(process.env.API_PORT || 3001);
http.createServer(handler).listen(PORT, () => {
  console.log(`✅ API: http://localhost:${PORT}/api/health`);
});

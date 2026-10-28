// API (3001) жана Vite (5173) серверлерин бирге иштетет — Windows, macOS, Linux.
import { spawn } from 'node:child_process';

const procs = [
  spawn('node', ['server/dev.js'], { stdio: 'inherit', shell: true }),
  spawn('npx', ['vite'], { stdio: 'inherit', shell: true })
];
const stop = () => { procs.forEach((p) => p.kill()); process.exit(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => { if (code) { console.error('Процесс токтоду, код:', code); stop(); } }));

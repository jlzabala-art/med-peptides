import { spawn } from 'child_process';
import fs from 'fs';

const logFile = fs.createWriteStream('build_out.txt');

const child = spawn('npx', ['vite', 'build'], {
  env: { ...process.env, FORCE_COLOR: '0' }
});

child.stdout.on('data', (data) => {
  logFile.write(data);
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  logFile.write(data);
  process.stderr.write(data);
});

child.on('close', (code) => {
  logFile.end();
  console.log(`\nProcess exited with code ${code}`);
  process.exit(code);
});

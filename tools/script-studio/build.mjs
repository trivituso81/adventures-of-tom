// Cleans old hashed assets (the vault folder is left alone), then runs the Vite build.
import { rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
rmSync(join(here, '../../script-studio/assets'), { recursive: true, force: true });
rmSync(join(here, '../../script-studio/index.html'), { force: true });
execSync('npx vite build', { cwd: here, stdio: 'inherit' });

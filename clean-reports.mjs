import { rmSync, mkdirSync, existsSync } from 'fs';

const dirs = ['cypress/reports', 'cypress/downloads', 'cypress/screenshots'];

dirs.forEach((dir) => {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned: ${dir}`);
  }
  mkdirSync(dir, { recursive: true });
  console.log(`Recreated: ${dir}`);
});

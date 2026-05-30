import { execSync, execFileSync } from 'child_process';
import http from 'http';

const DOCKER_DESKTOP = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
const COMPOSE_FILE   = 'nopcommerce-docker/docker-compose.yml';
const APP_URL        = 'http://localhost:8080';

function step(n, label) {
  console.log(`\nStep ${n}: ${label}`);
}

function ok(msg)   { console.log(`  ✅  ${msg}`); }
function info(msg) { console.log(`  ℹ   ${msg}`); }
function fail(msg) { console.error(`  ❌  ${msg}`); }

function runQuiet(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { ok: false, out: (e.stderr || e.stdout || e.message || '').trim() };
  }
}

function isDockerReady() {
  const r = runQuiet('docker info --format {{.ServerVersion}}');
  return r.ok && /^\d+/.test(r.out);
}

function checkAppReady() {
  return new Promise((resolve) => {
    const req = http.get(APP_URL, { timeout: 4000 }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function waitFor(check, label, intervalMs, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  process.stdout.write(`  Waiting for ${label} `);
  while (Date.now() < deadline) {
    if (await check()) {
      process.stdout.write(' done\n');
      return true;
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, intervalMs));
  }
  process.stdout.write('\n');
  return false;
}

console.log('\n' + '═'.repeat(68));
console.log('  nopCommerce — Environment Setup');
console.log('═'.repeat(68));

// ── Step 1: Docker Desktop ────────────────────────────────────────────────
step(1, 'Docker Desktop');

if (isDockerReady()) {
  ok('Docker daemon is already running');
} else {
  info('Launching Docker Desktop...');
  try {
    execFileSync('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-Command', `Start-Process '${DOCKER_DESKTOP}'`,
    ], { stdio: 'ignore' });
  } catch {
    fail('Could not launch Docker Desktop automatically.');
    console.error('     Please open Docker Desktop manually, wait for it to show');
    console.error('     "Docker Desktop is running", then re-run this script.');
    process.exit(1);
  }

  const ready = await waitFor(isDockerReady, 'Docker daemon', 5000, 180000);
  if (!ready) {
    fail('Docker daemon did not start within 3 minutes.');
    console.error('     Open Docker Desktop manually and wait for the whale icon to appear.');
    process.exit(1);
  }
  ok('Docker daemon is ready');
}

// ── Step 2: nopCommerce containers ────────────────────────────────────────
step(2, 'nopCommerce containers (docker compose up)');

const compose = runQuiet(`docker compose -f ${COMPOSE_FILE} up -d 2>&1`);
if (!compose.ok) {
  fail('docker compose failed:');
  console.error(compose.out);
  process.exit(1);
}
ok('Containers started');

// ── Step 3: App health check ──────────────────────────────────────────────
step(3, `Waiting for app at ${APP_URL}`);

const appUp = await waitFor(checkAppReady, 'app on port 8080', 10000, 300000);
if (!appUp) {
  fail('App did not respond within 5 minutes.');
  console.error('     Check container logs:');
  console.error(`     docker compose -f ${COMPOSE_FILE} logs --tail 40`);
  process.exit(1);
}
ok(`App is responding at ${APP_URL}`);

// ── Done ──────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(68));
console.log('  ✅  Environment is ready.');
console.log('');
console.log('  Run the full test suite with:');
console.log('     node run-all-modules.mjs');
console.log('');
console.log('  Report will be saved to:');
console.log('     cypress/reports/nopCommerce-Test-Report.html');
console.log('═'.repeat(68) + '\n');

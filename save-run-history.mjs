import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

const JSONS_DIR   = 'cypress/reports/.jsons';
const HISTORY_DIR = 'test-history';

if (!existsSync(JSONS_DIR)) {
  console.log('No report JSONs found — skipping history save.');
  process.exit(0);
}

if (!existsSync(HISTORY_DIR)) mkdirSync(HISTORY_DIR, { recursive: true });

const moduleLabels = {
  'nopcommerce-setup':          'Application Setup',
  'categories-creation':        'Category Management - Data Setup',
  'products-creation':          'Product Management - Data Setup',
  'users-creation':             'Customer Management - Data Setup',
  'cart-creation':              'Storefront - Cart and Checkout',
  'categories-overview':        'Category Admin',
  'products-overview':          'Product Admin',
  'users-overview':             'Customer Admin',
  'orders-overview':            'Order Admin',
  'cart-overview':              'Storefront Validation',
  'api-tests':                  'API Tests',
  'mobile-viewport-testing':    'Mobile Viewport Testing',
  'order-journey':              'End-to-End Purchase Journey',
  'wipeout-allcreatedrecords':  'Data Cleanup',
};

const files = readdirSync(JSONS_DIR).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  console.log('No report JSONs found — skipping history save.');
  process.exit(0);
}

const ts  = new Date();
const pad = (n) => String(n).padStart(2, '0');

let totalTests = 0, totalPassed = 0, totalFailed = 0, totalPending = 0, totalDuration = 0;
const modules = [];

for (const file of files) {
  const key  = file.replace('-report.json', '');
  const data = JSON.parse(readFileSync(path.join(JSONS_DIR, file), 'utf8'));
  const s    = data.stats || {};

  const tests   = s.tests    ?? 0;
  const passed  = s.passes   ?? 0;
  const failed  = s.failures ?? 0;
  const pending = s.pending  ?? 0;
  const duration = s.duration ?? 0;

  totalTests    += tests;
  totalPassed   += passed;
  totalFailed   += failed;
  totalPending  += pending;
  totalDuration += duration;

  modules.push({
    key,
    name: moduleLabels[key] || key,
    tests,
    passed,
    failed,
    pending,
    duration,
  });
}

const passRate = totalTests > 0 ? parseFloat(((totalPassed / totalTests) * 100).toFixed(1)) : 0;

const snapshot = {
  timestamp: ts.toISOString(),
  date: `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())}`,
  time: `${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`,
  browser: process.env.BROWSER || 'chrome',
  totals: {
    tests:    totalTests,
    passed:   totalPassed,
    failed:   totalFailed,
    pending:  totalPending,
    passRate,
    duration: totalDuration,
  },
  modules,
};

const filename = `run-${snapshot.date.replace(/-/g, '')}-${snapshot.time.replace(/:/g, '')}.json`;
const filepath = path.join(HISTORY_DIR, filename);

writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf8');
console.log(`History saved → ${filepath}`);

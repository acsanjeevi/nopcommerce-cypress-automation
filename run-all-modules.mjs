import cypress from 'cypress';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

delete process.env.ELECTRON_RUN_AS_NODE;
process.env.CYPRESS_SKIP_VERIFY = 'true';

const isCI      = !!process.env.CI;
const browser   = process.env.BROWSER || 'chrome';
const parallel  = process.env.PARALLEL === 'true';
const headed    = !isCI;
const MAX_PARALLEL = 2;

console.log('\n' + '═'.repeat(68));
console.log('  nopCommerce Automation — Full Test Run');
console.log(`  Browser: ${browser} (${isCI ? 'headless' : 'headed'})`);
console.log(`  Mode: ${parallel ? 'PARALLEL (phased, max ' + MAX_PARALLEL + ')' : 'sequential'}`);
console.log('═'.repeat(68) + '\n');

const PHASES = [
  { name: 'Phase 1 — Setup',       par: false, specs: ['cypress/e2e/setup/nopcommerce-setup.cy.ts'] },
  { name: 'Phase 2 — Create Data', par: true,  specs: [
    'cypress/e2e/categories/categories-creation.cy.ts',
    'cypress/e2e/products/products-creation.cy.ts',
    'cypress/e2e/users/users-creation.cy.ts',
  ]},
  { name: 'Phase 3 — Cart Orders',  par: false, specs: ['cypress/e2e/cart/cart-creation.cy.ts'] },
  { name: 'Phase 4 — Validate',     par: true,  specs: [
    'cypress/e2e/categories/categories-overview.cy.ts',
    'cypress/e2e/products/products-overview.cy.ts',
    'cypress/e2e/users/users-overview.cy.ts',
    'cypress/e2e/orders/orders-overview.cy.ts',
    'cypress/e2e/cart/cart-overview.cy.ts',
    'cypress/e2e/api/api-tests.cy.ts',
    'cypress/e2e/mobile/mobile-viewport-testing.cy.ts',
  ]},
  { name: 'Phase 5 — E2E Journey',  par: false, specs: ['cypress/e2e/order-journey/order-journey.cy.ts'] },
  { name: 'Phase 6 — Cleanup',      par: false, specs: ['cypress/e2e/deleterecords/wipeout-allcreatedrecords.cy.ts'] },
];

function spawnSpec(spec) {
  return new Promise((resolve) => {
    const args = ['cypress', 'run', '--browser', browser, '--spec', spec];
    if (headed) args.push('--headed');
    const child = spawn('npx', args, {
      stdio: 'pipe',
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '' },
      shell: true,
    });
    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });
    child.on('close', (code) => {
      const label = spec.replace('cypress/e2e/', '').replace('.cy.ts', '');
      console.log(`    ${code === 0 ? '✅' : '❌'}  ${label}`);
      resolve({ spec, code, output });
    });
  });
}

async function runPooled(specs, limit) {
  const results = [];
  const queue = [...specs];
  async function worker() {
    while (queue.length > 0) {
      const spec = queue.shift();
      results.push(await spawnSpec(spec));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, specs.length) }, () => worker()));
  return results;
}

function readReportJsons() {
  const dir = 'cypress/reports/.jsons';
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
      catch { return null; }
    })
    .filter(Boolean);
}

function printSummaryFromReports(reports) {
  let grandTotal = 0, grandPass = 0, grandFail = 0;

  console.log('\n' + '─'.repeat(68));
  console.log('  MODULE RESULTS');
  console.log('─'.repeat(68));

  for (const report of reports) {
    const s = report.stats || {};
    const name = (report.results?.[0]?.file || 'unknown')
      .replace(/.*cypress[\\/]e2e[\\/]/, '').replace('.cy.ts', '');
    const pass = s.passes   || 0;
    const fail = s.failures || 0;
    const tot  = s.tests    || 0;
    const icon = fail > 0 ? '❌' : '✅';
    const pct  = tot > 0 ? `${((pass / tot) * 100).toFixed(0)}%` : '—';

    grandTotal += tot;
    grandPass  += pass;
    grandFail  += fail;

    console.log(`  ${icon}  ${name.padEnd(40)} ${pass}/${tot} (${pct})`);
  }

  const passRate = grandTotal > 0 ? `${((grandPass / grandTotal) * 100).toFixed(1)}%` : '0%';

  console.log('\n' + '═'.repeat(68));
  console.log('  OVERALL SUMMARY');
  console.log('═'.repeat(68));
  console.log(`  Total Tests : ${grandTotal}`);
  console.log(`  Passed      : ${grandPass}`);
  console.log(`  Failed      : ${grandFail}`);
  console.log(`  Pass Rate   : ${passRate}`);
  console.log('═'.repeat(68));

  return grandFail;
}

function printSummaryFromRuns(runs) {
  let grandTotal = 0, grandPass = 0, grandFail = 0;

  console.log('\n' + '─'.repeat(68));
  console.log('  MODULE RESULTS');
  console.log('─'.repeat(68));

  runs.forEach((run) => {
    const s    = run.stats || {};
    const name = (run.spec?.relative || run.spec?.name || 'spec')
      .replace('cypress/e2e/', '').replace('.cy.ts', '');
    const pass = s.passes   || 0;
    const fail = s.failures || 0;
    const tot  = s.tests    || 0;
    const icon = fail > 0 ? '❌' : '✅';
    const pct  = tot > 0 ? `${((pass / tot) * 100).toFixed(0)}%` : '—';

    grandTotal += tot;
    grandPass  += pass;
    grandFail  += fail;

    console.log(`  ${icon}  ${name.padEnd(40)} ${pass}/${tot} (${pct})`);
    if (fail > 0) {
      (run.tests || []).filter((t) => t.state !== 'passed' && t.state !== 'pending').forEach((t) => {
        console.log(`       ❌  ${(t.title || []).join(' > ')}`);
      });
    }
  });

  const passRate = grandTotal > 0 ? `${((grandPass / grandTotal) * 100).toFixed(1)}%` : '0%';

  console.log('\n' + '═'.repeat(68));
  console.log('  OVERALL SUMMARY');
  console.log('═'.repeat(68));
  console.log(`  Total Tests : ${grandTotal}`);
  console.log(`  Passed      : ${grandPass}`);
  console.log(`  Failed      : ${grandFail}`);
  console.log(`  Pass Rate   : ${passRate}`);
  console.log('═'.repeat(68));

  return grandFail;
}

try {
  let failures = 0;

  if (!parallel) {
    const result = await cypress.run({ browser, headed });
    if (result.status === 'failed') {
      console.error('\nCypress failed to run — check configuration.');
      process.exit(1);
    }
    failures = printSummaryFromRuns(result.runs || []);
  } else {
    for (const phase of PHASES) {
      console.log(`\n▸ ${phase.name} (${phase.par ? phase.specs.length + ' specs, max ' + MAX_PARALLEL + ' parallel' : 'sequential'})`);

      if (phase.par && phase.specs.length > 1) {
        await runPooled(phase.specs, MAX_PARALLEL);
      } else {
        for (const spec of phase.specs) {
          await spawnSpec(spec);
        }
      }
    }
    const reports = readReportJsons();
    failures = printSummaryFromReports(reports);
  }

  console.log('\nGenerating standalone HTML report...');
  execSync('node generate-html-report.mjs', { stdio: 'inherit' });

  console.log('\nSaving run history...');
  execSync('node save-run-history.mjs', { stdio: 'inherit' });

  console.log('\nGenerating trend dashboard...');
  execSync('node generate-trend-dashboard.mjs', { stdio: 'inherit' });

  if (failures > 0) process.exit(1);

} catch (err) {
  console.error('\nFATAL ERROR:', err.message || err);
  process.exit(1);
}

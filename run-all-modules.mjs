import cypress from 'cypress';

delete process.env.ELECTRON_RUN_AS_NODE;
process.env.CYPRESS_SKIP_VERIFY = 'true';

const isCI      = !!process.env.CI;
const browser   = process.env.BROWSER || 'chrome';
const parallel  = process.env.PARALLEL === 'true';
const headed    = !isCI;

console.log('\n' + '═'.repeat(68));
console.log('  nopCommerce Automation — Full Test Run');
console.log(`  Browser: ${browser} (${isCI ? 'headless' : 'headed'})`);
console.log(`  Mode: ${parallel ? 'PARALLEL (phased)' : 'sequential'}`);
console.log('═'.repeat(68) + '\n');

const PHASES = [
  { name: 'Phase 1 — Setup',     parallel: false, specs: ['cypress/e2e/setup/nopcommerce-setup.cy.ts'] },
  { name: 'Phase 2 — Create Data', parallel: true, specs: [
    'cypress/e2e/categories/categories-creation.cy.ts',
    'cypress/e2e/products/products-creation.cy.ts',
    'cypress/e2e/users/users-creation.cy.ts',
  ]},
  { name: 'Phase 3 — Cart Orders', parallel: false, specs: ['cypress/e2e/cart/cart-creation.cy.ts'] },
  { name: 'Phase 4 — Validate',  parallel: true, specs: [
    'cypress/e2e/categories/categories-overview.cy.ts',
    'cypress/e2e/products/products-overview.cy.ts',
    'cypress/e2e/users/users-overview.cy.ts',
    'cypress/e2e/orders/orders-overview.cy.ts',
    'cypress/e2e/cart/cart-overview.cy.ts',
    'cypress/e2e/api/api-tests.cy.ts',
  ]},
  { name: 'Phase 5 — E2E Journey', parallel: false, specs: ['cypress/e2e/order-journey/order-journey.cy.ts'] },
  { name: 'Phase 6 — Cleanup',   parallel: false, specs: ['cypress/e2e/deleterecords/wipeout-allcreatedrecords.cy.ts'] },
];

const MAX_CONCURRENCY = 2;

function runSpec(spec) {
  return cypress.run({ browser, headed, spec });
}

async function runWithConcurrency(specs, limit) {
  const results = [];
  const queue = [...specs];
  async function worker() {
    while (queue.length > 0) {
      const spec = queue.shift();
      results.push({ spec, result: await runSpec(spec) });
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, specs.length) }, worker));
  return specs.map((s) => results.find((r) => r.spec === s).result);
}

function collectResults(result, allRuns) {
  if (result.status === 'failed') return;
  for (const run of (result.runs || [])) allRuns.push(run);
}

function printSummary(allRuns) {
  let grandTotal = 0, grandPass = 0, grandFail = 0;

  console.log('\n' + '─'.repeat(68));
  console.log('  MODULE RESULTS');
  console.log('─'.repeat(68));

  allRuns.forEach((run) => {
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

  return { grandTotal, grandPass, grandFail };
}

try {
  const allRuns = [];

  if (!parallel) {
    // Sequential mode — single cypress.run() with all specs (original behavior)
    const result = await cypress.run({ browser, headed });
    collectResults(result, allRuns);
    if (result.status === 'failed') {
      console.error('\nCypress failed to run — check configuration.');
      process.exit(1);
    }
  } else {
    // Parallel mode — run phases in order, parallelize within phases
    for (const phase of PHASES) {
      console.log(`\n▸ ${phase.name} (${phase.parallel ? phase.specs.length + ' parallel' : 'sequential'})`);

      if (phase.parallel && phase.specs.length > 1) {
        const results = await runWithConcurrency(phase.specs, MAX_CONCURRENCY);
        for (const r of results) {
          if (r.status === 'failed') {
            console.error(`  ✗ A spec in ${phase.name} failed to launch.`);
          }
          collectResults(r, allRuns);
        }
      } else {
        for (const spec of phase.specs) {
          const result = await runSpec(spec);
          if (result.status === 'failed') {
            console.error(`  ✗ ${spec} failed to launch.`);
          }
          collectResults(result, allRuns);
        }
      }
    }
  }

  const { grandFail } = printSummary(allRuns);

  console.log('\nGenerating standalone HTML report...');
  const { execSync } = await import('child_process');
  execSync('node generate-html-report.mjs', { stdio: 'inherit' });

  if (grandFail > 0) process.exit(1);

} catch (err) {
  console.error('\nFATAL ERROR:', err.message || err);
  process.exit(1);
}

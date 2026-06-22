import cypress from 'cypress';

delete process.env.ELECTRON_RUN_AS_NODE;
process.env.CYPRESS_SKIP_VERIFY = 'true';

console.log('\n' + '═'.repeat(68));
console.log('  nopCommerce Automation — Full Test Run (All 12 Modules)');
const isCI = !!process.env.CI;
console.log(`  Browser: Chrome (${isCI ? 'headless' : 'headed'})`);
console.log('═'.repeat(68) + '\n');

try {
  const result = await cypress.run({
    browser: 'chrome',
    headed:  !isCI,
  });

  const status  = result.status;
  const runs    = result.runs || [];

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

  if (status === 'failed') {
    console.error('\nCypress failed to run — check configuration.');
    process.exit(1);
  }

  console.log('\nGenerating standalone HTML report...');
  const { execSync } = await import('child_process');
  execSync('node generate-html-report.mjs', { stdio: 'inherit' });

  if (grandFail > 0) process.exit(1);

} catch (err) {
  console.error('\nFATAL ERROR:', err.message || err);
  process.exit(1);
}

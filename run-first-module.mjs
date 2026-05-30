import cypress from 'cypress';

// VS Code sets ELECTRON_RUN_AS_NODE which breaks Cypress Electron — unset it
delete process.env.ELECTRON_RUN_AS_NODE;
process.env.CYPRESS_SKIP_VERIFY = 'true';

const specs = [
  'cypress/e2e/setup/nopcommerce-setup.cy.ts',
  'cypress/e2e/categories/categories-creation.cy.ts',
];

console.log('\n=== Running: Setup + Categories Creation (First Module) ===\n');

try {
  const result = await cypress.run({
    browser: 'chrome',
    headed:  true,
    spec:    specs.join(','),
  });

  console.log('\nResult status:', result.status);

  if (result.status === 'failed') {
    console.error('\nCypress failed to run:');
    console.error(result.failures, result.message);
    process.exit(1);
  }

  const runs = result.runs || [];
  let totalPass = 0, totalFail = 0, totalPend = 0, totalTests = 0;

  runs.forEach((run) => {
    const s = run.stats || {};
    totalTests += s.tests    || 0;
    totalPass  += s.passes   || 0;
    totalFail  += s.failures || 0;
    totalPend  += s.pending  || 0;
    console.log(`\n${run.spec?.relative || run.spec?.name || 'spec'}`);
    console.log(`  Tests: ${s.tests}  Pass: ${s.passes}  Fail: ${s.failures}  Pending: ${s.pending}`);
    (run.tests || []).forEach((t) => {
      const icon = t.state === 'passed' ? '✅' : (t.state === 'pending' ? '⏭️' : '❌');
      console.log(`  ${icon} ${t.title?.join(' > ')}`);
    });
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Total: ${totalTests}  |  Pass: ${totalPass}  |  Fail: ${totalFail}  |  Pending: ${totalPend}`);

  if (totalFail > 0) process.exit(1);
} catch (err) {
  console.error('\nFATAL ERROR:', err.message || err);
  process.exit(1);
}

import { readFileSync, readdirSync, existsSync } from 'fs';

const JSONS_DIR = 'cypress/reports/.jsons';

if (!existsSync(JSONS_DIR)) {
  console.log('No reports directory found.');
  process.exit(0);
}

const files = readdirSync(JSONS_DIR).filter((f) => f.endsWith('.json'));
let grandTotal = 0, grandPass = 0, grandFail = 0, grandPending = 0;

files.forEach((file) => {
  const data  = JSON.parse(readFileSync(`${JSONS_DIR}/${file}`, 'utf8'));
  const stats = data.stats || {};
  const name  = file.replace('-report.json', '').toUpperCase();

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`MODULE : ${name}`);
  console.log(`Tests  : ${stats.tests ?? 0}  |  Pass: ${stats.passes ?? 0}  |  Fail: ${stats.failures ?? 0}  |  Pending: ${stats.pending ?? 0}`);

  grandTotal   += stats.tests    ?? 0;
  grandPass    += stats.passes   ?? 0;
  grandFail    += stats.failures ?? 0;
  grandPending += stats.pending  ?? 0;

  const printTests = (suites) => {
    if (!suites) return;
    suites.forEach((suite) => {
      (suite.tests || []).forEach((t) => {
        const icon = t.pass ? '✅ PASS' : (t.pending ? '⏭️ SKIP' : '❌ FAIL');
        console.log(`  ${icon}  ${t.fullTitle}  (${t.duration ?? 0}ms)`);
        if (!t.pass && !t.pending && t.err) {
          console.log(`         Error: ${t.err.message ?? t.err}`);
        }
      });
      printTests(suite.suites);
    });
  };

  (data.results || []).forEach((r) => printTests(r.suites));
});

console.log(`\n${'═'.repeat(60)}`);
console.log('OVERALL SUMMARY');
console.log(`${'═'.repeat(60)}`);
console.log(`Total Tests : ${grandTotal}`);
console.log(`Passed      : ${grandPass}`);
console.log(`Failed      : ${grandFail}`);
console.log(`Pending     : ${grandPending}`);
console.log(`Pass Rate   : ${grandTotal > 0 ? ((grandPass / grandTotal) * 100).toFixed(1) : 0}%`);
console.log(`${'═'.repeat(60)}\n`);

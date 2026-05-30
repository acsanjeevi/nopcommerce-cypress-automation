import { execSync } from 'child_process';

const args = process.argv.slice(2);
const role = args.find((a) => a.startsWith('role='))?.split('=')[1] ?? 'admin';

delete process.env['ELECTRON_RUN_AS_NODE'];
process.env['CYPRESS_SKIP_VERIFY'] = 'true';

console.log(`\n=== Running all Cypress tests as role: ${role} ===\n`);

try {
  execSync(`npx cypress run --browser chrome --headed --env role=${role}`, {
    stdio: 'inherit',
    env:   { ...process.env, ELECTRON_RUN_AS_NODE: undefined },
  });
  console.log('\n=== All tests completed successfully ===\n');
} catch {
  console.log('\n=== Tests finished (some may have failed — check the Mochawesome report) ===\n');
  process.exit(1);
}

import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'secured.env') });

const REPORT_DIR  = path.resolve(__dirname, 'cypress/reports');
const JSONS_DIR   = path.join(REPORT_DIR, '.jsons');
const MERGED_DIR  = path.join(REPORT_DIR, 'mergedjsonreport');
const MERGED_JSON = path.join(MERGED_DIR, 'report.json');

const CHROME_FLAGS = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
];

interface ReportStats {
  passes:   number;
  failures: number;
  pending:  number;
  tests:    number;
}

interface SpecReport {
  results?: unknown[];
  stats?:   Partial<ReportStats>;
}

function mergeJsonReports(): void {
  try {
    if (!fs.existsSync(MERGED_DIR)) fs.mkdirSync(MERGED_DIR, { recursive: true });
    if (!fs.existsSync(JSONS_DIR))  return;

    const jsonFiles = fs.readdirSync(JSONS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => path.join(JSONS_DIR, f));

    if (jsonFiles.length === 0) return;

    const merged: { stats: ReportStats; results: unknown[] } = {
      stats:   { passes: 0, failures: 0, pending: 0, tests: 0 },
      results: [],
    };

    for (const file of jsonFiles) {
      const data: SpecReport = JSON.parse(fs.readFileSync(file, 'utf8'));
      merged.results.push(...(data.results ?? []));
      const s = data.stats ?? {};
      merged.stats.passes   += s.passes   ?? 0;
      merged.stats.failures += s.failures ?? 0;
      merged.stats.pending  += s.pending  ?? 0;
      merged.stats.tests    += s.tests    ?? 0;
    }

    fs.writeFileSync(MERGED_JSON, JSON.stringify(merged, null, 2));
    const { passes, failures, pending, tests } = merged.stats;
    console.log(`\nMerged report → ${MERGED_JSON}`);
    console.log(`Tests: ${tests} | Pass: ${passes} | Fail: ${failures} | Pending: ${pending}\n`);
  } catch (err) {
    console.error('Failed to merge reports:', err);
  }
}

function logLatestHtmlReport(): void {
  try {
    const htmlFiles = fs.readdirSync(REPORT_DIR)
      .filter((f) => f.endsWith('.html'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(REPORT_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    if (htmlFiles.length > 0) {
      const htmlPath = path.join(REPORT_DIR, htmlFiles[0].name);
      console.log(`\nReport generated → ${htmlPath}`);
      console.log('Open the file above in your browser to view the full test report.\n');
    }
  } catch {
    // Intentionally silent — report path log failure must not fail the run
  }
}

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth:  1920,

  allowCypressEnv: true,

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    embeddedScreenshots:    true,
    screenshotOnRunFailure: true,
    saveJson:               true,
    inlineAssets:           true,
    saveAllAttempts:        true,
    videoOnFailOnly:        true,
    reportDir:              'cypress/reports',
    overwrite:              true,
    html:                   true,
    json:                   true,
    charts:                 true,
    attachments:            true,
    toConsole:              true,
    reportFilename:         '[name]-report',
  },

  env: {
    url:              process.env['CYPRESS_BASE_URL'],
    adminUrl:         process.env['CYPRESS_ADMIN_URL'],
    apiUrl:           process.env['CYPRESS_API_URL'],
    customerEmail:    process.env['CYPRESS_CUSTOMER_EMAIL'],
    customerPassword: process.env['CYPRESS_CUSTOMER_PASSWORD'],
    customerUsername: process.env['CYPRESS_CUSTOMER_USERNAME'],
    adminEmail:       process.env['CYPRESS_ADMIN_EMAIL'],
    adminPassword:    process.env['CYPRESS_ADMIN_PASSWORD'],
    encryptionKey:    process.env['CYPRESS_ENCRYPTION_KEY'],
    role:             process.env['CYPRESS_ROLE'] || 'admin',
    grep:             null,
  },

  retries: {
    runMode: 1,
    openMode: 0,
  },

  defaultCommandTimeout: 15_000,
  responseTimeout:       60_000,
  requestTimeout:        40_000,
  pageLoadTimeout:      180_000,

  e2e: {
    watchForFileChanges: false,
    testIsolation:       false,
    specPattern: [
      'cypress/e2e/setup/nopcommerce-setup.cy.ts',
      'cypress/e2e/categories/categories-creation.cy.ts',
      'cypress/e2e/products/products-creation.cy.ts',
      'cypress/e2e/users/users-creation.cy.ts',
      'cypress/e2e/cart/cart-creation.cy.ts',
      'cypress/e2e/categories/categories-overview.cy.ts',
      'cypress/e2e/products/products-overview.cy.ts',
      'cypress/e2e/users/users-overview.cy.ts',
      'cypress/e2e/orders/orders-overview.cy.ts',
      'cypress/e2e/cart/cart-overview.cy.ts',
      'cypress/e2e/api/api-tests.cy.ts',
      'cypress/e2e/mobile/mobile-viewport-testing.cy.ts',
      'cypress/e2e/order-journey/order-journey.cy.ts',
      'cypress/e2e/deleterecords/wipeout-allcreatedrecords.cy.ts',
    ],
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      on('before:browser:launch', (browser: Cypress.Browser, launchOptions: Cypress.BeforeBrowserLaunchOptions) => {
        if (browser.name === 'chrome') {
          CHROME_FLAGS.forEach((flag) => launchOptions.args.push(flag));
        }
        return launchOptions;
      });

      on('after:run', () => {
        mergeJsonReports();
        logLatestHtmlReport();
      });

      on('task', {
        readFileContent(filePath: string): string {
          return fs.readFileSync(filePath, 'utf8');
        },
        getFilePathByName(fileNamePattern: string): string | null {
          const folderPath = 'cypress/fixtures/attachments';
          const files = fs.readdirSync(folderPath);
          const matched = files.find((f) => f.includes(fileNamePattern));
          return matched ? path.join(folderPath, matched) : null;
        },
      });

      return config;
    },
  },
});

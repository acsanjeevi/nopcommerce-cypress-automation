# Cypress Automation Blueprint

> **Purpose:** The single source of truth for this Cypress automation project.  
> Covers the project plan (what to automate and why), credentials, test scenarios, and the complete framework architecture guide (how to build and extend it).

---

## Table of Contents

0. [Project Overview & Test Plan](#0-project-overview--test-plan)
1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Root Setup](#2-project-root-setup)
3. [Folder Scaffold (Full Structure)](#3-folder-scaffold-full-structure)
4. [cypress/tsconfig.json](#4-cyprestsconfigjson)
5. [cypress/page-objects/](#5-cypresspage-objects)
6. [cypress/support/](#6-cypresssupport)
7. [cypress/business-function/](#7-cypressbusiness-function)
8. [cypress/fixtures/](#8-cypressfixtures)
9. [cypress/e2e/](#9-cypresse2e)
10. [cypress/reports/ & downloads/](#10-cypressreports--downloads)
11. [Fixture JSON Conventions & Rules](#11-fixture-json-conventions--rules)
12. [Command Naming Conventions](#12-command-naming-conventions)
13. [PrimeNG Checkbox Rule (Permanent)](#13-primeng-checkbox-rule-permanent)
14. [How All Layers Connect](#14-how-all-layers-connect)
15. [Step-by-Step New Project Setup](#15-step-by-step-new-project-setup)
16. [Per-Module Replication Checklist](#16-per-module-replication-checklist)
17. [Copilot / AI Governance Rules](#17-copilot--ai-governance-rules)

---

## 0. Project Overview & Test Plan

### Target Application

**URL:** https://www.nopcommerce.com/en

**Stack:** Cypress + TypeScript

---

### Login Credentials

| Field     | Value                    |
| --------- | ------------------------ |
| Email     | acsanjeevi@gmail.com     |
| User Name | Sanjeevi                 |
| Password  | Sanjeevi$Test$369        |

---

### Core Test Scenarios

The following end-to-end journeys must be automated and split into individual test modules:

#### Frontend Flow
1. Login to the frontend store
2. Search for a product and verify its details
3. Add multiple quantities to the cart
4. Place an order
5. Verify all details at each stage (product details, cart totals, order confirmation)

#### Admin Flow
1. Login as Admin
2. Navigate to Sales
3. Search for the order placed in the frontend flow
4. Verify order details match what was placed
5. Change the order status

---

### Module Breakdown

Derive and split the above scenarios into the following modules, each with creation and overview specs:

| Module         | Key Scenarios                                      |
| -------------- | -------------------------------------------------- |
| Users          | User registration, login, profile verification     |
| Products       | Product search, detail verification                |
| Categories     | Category browsing and filtering                    |
| Cart           | Add to cart, quantity update, cart overview        |
| Orders         | Order placement, confirmation, detail verification |
| Order Journey  | Full end-to-end flow: login → cart → order → admin |
| Delete Records | Cleanup all test-created records after runs        |

---

### General Instructions

- Always ask before taking any action or when confirmation is needed.
- Framework setup must follow the structure defined in Sections 1–17 below.
- All tests must be written in **Cypress + TypeScript**.
- Credentials must be stored in `secured.env` (gitignored — never hardcoded).

---

# Cypress QA Framework — Complete Structure Guide

### Portable Reference for Any New Project

> **Purpose:** A complete, copy-paste-ready guide to build this Cypress QA framework from scratch on any new project.  
> All project-specific names are replaced with generic `<ProjectName>` / `<module>` placeholders.  
> Includes: installation, folder scaffold, every file template, naming rules, and a step-by-step replication checklist.

---

## 1. Tech Stack & Dependencies

### Core QA Framework Packages

| Package                                | Version Used | Purpose                                       |
| -------------------------------------- | ------------ | --------------------------------------------- |
| `cypress`                              | `^13.13.0`   | Test runner                                   |
| `typescript`                           | `^5.4.2`     | Type safety across all test files             |
| `ts-node`                              | `^10.9.2`    | Run `.ts` scripts (test runner orchestration) |
| `dotenv`                               | `^16.4.7`    | Load `secured.env` into `process.env`         |
| `crypto-js` + `@types/crypto-js`       | `^4.2.0`     | AES encrypt/decrypt passwords in tests        |
| `dayjs`                                | `^1.11.13`   | Date parsing and comparison in assertions     |
| `@cypress/grep`                        | `^4.1.0`     | Tag-based test filtering (`{ tags: 'prod' }`) |
| `cypress-mochawesome-reporter`         | `^3.8.2`     | HTML + JSON test reports with screenshots     |
| `mochawesome`                          | `^7.1.3`     | Reporter engine                               |
| `mochawesome-merge`                    | `^4.3.0`     | Merge per-spec JSON reports into one          |
| `marge` (mochawesome-report-generator) | `^1.0.1`     | Generate final HTML from merged JSON          |
| `jsonwebtoken` + `@types/jsonwebtoken` | `^9.0.2`     | Decode JWT tokens for Azure AD login bypass   |
| `cypress-wait-until`                   | `^3.0.2`     | `cy.waitUntil()` utility                      |
| `nodemailer`                           | `^7.0.7`     | Send test reports by email (optional)         |
| `vite`                                 | `^6.4.1`     | Bundler used by Cypress NX preset (NX only)   |

### Install Command (fresh project)

```bash
npm install --save-dev \
  cypress \
  typescript \
  ts-node \
  dotenv \
  crypto-js @types/crypto-js \
  dayjs \
  @cypress/grep \
  cypress-mochawesome-reporter \
  mochawesome \
  mochawesome-merge \
  marge \
  jsonwebtoken @types/jsonwebtoken \
  cypress-wait-until \
  nodemailer
```

> **Note:** If not using NX monorepo, remove `@nx/cypress` and replace the `nxE2EPreset` block in `cypress.config.ts`
> with plain `specPattern` and `supportFile` settings only (see Section 2b below).

---

## 2. Project Root Setup

### 2a. `package.json` — scripts section

```json
{
  "name": "<project-name>",
  "version": "1.0.0",
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run --headed --browser chrome",
    "cleanReports": "node clean-reports.mjs",
    "dataCleanUp": "npx cypress run --spec cypress/e2e/deleterecords/wipeout-allcreatedrecords.cy.ts --env role=admin --headed --browser chrome",
    "cleanUpDataAndReports": "npm run dataCleanUp && npm run cleanReports || npm run cleanReports",
    "mochawesome-report-merge": "npx mochawesome-merge cypress/reports/*.json > cypress/reports/mergedjsonreport/report.json",
    "finalreport": "marge cypress/reports/mergedjsonreport/report.json --inline -f <ProjectName>_TestReport -o cypress/reports/",
    "mergeAndGenerateFinalReport": "npm run mochawesome-report-merge && npm run finalreport",
    "runTestsAsAdmin": "npm run cleanUpDataAndReports && npx ts-node run-tests.ts role=admin && npm run mergeAndGenerateFinalReport || npm run mergeAndGenerateFinalReport",
    "runProductionTest": "npm run cleanReports && npx cypress run --headed --browser chrome --env grepTags=prod && npm run mergeAndGenerateFinalReport || npm run mergeAndGenerateFinalReport"
  }
}
```

### 2b. `cypress.config.ts` — full generic template

```typescript
import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load secrets from secured.env (gitignored)
dotenv.config({ path: path.resolve(__dirname, 'secured.env') });

const reportFilename =
  process.env['CYPRESS_REPORT_FILENAME'] || '[name]-report';

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,

  // Reporter: generates HTML + JSON per spec run
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    embeddedScreenshots: true,
    screenshotOnRunFailure: true,
    saveJson: true,
    inlineAssets: true,
    saveAllAttempts: true,
    videoOnFailOnly: true,
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    attachments: true,
    toConsole: true,
    reportFilename: reportFilename,
  },

  // Environment variables — loaded from secured.env
  env: {
    url: process.env['CYPRESS_BASE_URL'], // e.g. http://localhost:4200/#
    apiUrl: process.env['CYPRESS_API_URL'], // e.g. http://localhost:3000
    encryptionKey: process.env['CYPRESS_ENCRYPTION_KEY'], // AES key for password encryption
    role: process.env['CYPRESS_ROLE'] || 'admin', // 'admin' | 'user'
    grep: null, // tag filter (set at runtime)
  },

  // Retry failed tests once in run mode
  retries: {
    runMode: 1,
    openMode: 0,
  },

  // Timeouts
  defaultCommandTimeout: 15000,
  responseTimeout: 60000,
  requestTimeout: 40000,
  pageLoadTimeout: 180000,

  e2e: {
    watchForFileChanges: false,
    testIsolation: false, // set true if tests must not share session state
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      // Register mochawesome reporter
      require('cypress-mochawesome-reporter/plugin')(on);

      // Custom tasks — add project-specific Node.js tasks here
      on('task', {
        // Read a file from disk (used for downloaded file validation)
        readFileContent(filePath: string): string {
          return fs.readFileSync(filePath, 'utf8');
        },

        // List files in a folder matching a name pattern
        getFilePathByName(fileNamePattern: string): string | null {
          const folderPath = 'cypress/fixtures/attachments';
          const files = fs.readdirSync(folderPath);
          const matchedFile = files.find((f) => f.includes(fileNamePattern));
          return matchedFile ? path.join(folderPath, matchedFile) : null;
        },
      });

      return config;
    },
  },
});
```

### 2c. `secured.env` — template (**gitignore this file!**)

```
# secured.env — NEVER commit this file to source control
CYPRESS_BASE_URL=http://localhost:4200/#
CYPRESS_API_URL=http://localhost:3000
CYPRESS_ENCRYPTION_KEY=your-aes-secret-key-here
CYPRESS_ROLE=admin
CYPRESS_REPORT_FILENAME=[name]-report
```

### 2d. `tsconfig.json` — project root

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "dom"],
    "strict": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {}
  },
  "exclude": ["node_modules", "dist"]
}
```

### 2e. `clean-reports.mjs` — clears reports & downloads before each run

```javascript
import { rmSync, mkdirSync, existsSync } from 'fs';

const dirs = ['cypress/reports', 'cypress/downloads'];

dirs.forEach((dir) => {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned: ${dir}`);
  }
  mkdirSync(dir, { recursive: true });
  console.log(`Recreated: ${dir}`);
});
```

### 2f. `.gitignore` additions

```
secured.env
cypress.env.json
cypress/reports/
cypress/downloads/
cypress/videos/
cypress/screenshots/
node_modules/
dist/
```

---

## 3. Folder Scaffold (Full Structure)

Run these commands from the project root to create the full folder structure:

```bash
mkdir -p cypress/page-objects
mkdir -p cypress/support
mkdir -p cypress/business-function/audit-logs-viewer
mkdir -p cypress/fixtures/common
mkdir -p cypress/fixtures/attachments
mkdir -p cypress/fixtures/<module1>
mkdir -p cypress/fixtures/<module2>
mkdir -p cypress/e2e/<module1>
mkdir -p cypress/e2e/<module2>
mkdir -p cypress/e2e/deleterecords
mkdir -p cypress/e2e/e2e-all-module
mkdir -p cypress/reports
mkdir -p cypress/downloads
mkdir -p docs
```

**Resulting structure:**

```
<project-root>/
├── cypress.config.ts
├── secured.env                              ← gitignored
├── cypress.env.json                         ← gitignored (local overrides only)
├── clean-reports.mjs
├── run-tests.ts                             ← test orchestrator (ts-node)
├── tsconfig.json
├── package.json
└── cypress/
    ├── tsconfig.json
    ├── page-objects/
    │   ├── common-page.ts                   ← ALL shared UI helpers (static class)
    │   └── encryptPassword.ts               ← AES encrypt/decrypt helpers
    ├── support/
    │   ├── e2e.ts                           ← Bootstrap: imports all business-function files
    │   ├── commands.ts                      ← Shared cross-module Cypress commands
    │   ├── index.d.ts                       ← TypeScript declarations for ALL cy.* commands
    │   ├── authentication.ts                ← Azure AD / OAuth login-bypass helper
    │   ├── auth-settings.json               ← Azure AD credentials (gitignored)
    │   ├── app.po.ts                        ← Minimal page-object stub
    │   └── preservedata.ts                  ← Session/localStorage preservation
    ├── business-function/
    │   ├── <module1>-commands.ts            ← Cypress.Commands for module 1
    │   ├── <module2>-commands.ts            ← Cypress.Commands for module 2
    │   └── audit-logs-viewer/
    │       └── audit-logs-viewer.ts
    ├── fixtures/
    │   ├── selectors.json                   ← Global shared selectors
    │   ├── common/
    │   │   ├── common-selectors.json        ← Shared button/input selectors
    │   │   ├── common-test-data.json        ← Shared test records (used by E2E suites)
    │   │   ├── all-module-api-endpoints.json← ALL REST API glob patterns
    │   │   ├── toast-messages.json          ← All expected success/fail messages
    │   │   └── delete-dialogbox.json        ← Delete confirmation dialog text per module
    │   ├── <module1>/
    │   │   ├── <module1>-selectors.json
    │   │   └── <module1>-test-data.json
    │   ├── <module2>/
    │   │   ├── <module2>-selectors.json
    │   │   └── <module2>-test-data.json
    │   └── attachments/                     ← Files used in upload tests
    ├── e2e/
    │   ├── <module1>/
    │   │   ├── <module1>-overview.cy.ts
    │   │   └── <module1>-creation.cy.ts
    │   ├── <module2>/
    │   │   └── <module2>-overview.cy.ts
    │   ├── deleterecords/
    │   │   └── wipeout-allcreatedrecords.cy.ts
    │   └── e2e-all-module/
    │       └── e2e-full-suite.cy.ts
    ├── reports/                              ← Auto-generated (gitignored)
    └── downloads/                            ← Auto-generated (gitignored)
```

---

## 4. cypress/tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "node"],
    "lib": ["es2015", "dom"],
    "isolatedModules": false,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts", "../cypress.config.ts"]
}
```

---

## 5. cypress/page-objects/

**Rule:** This is the ONLY place where raw `cy.get()` calls are wrapped into reusable helpers.  
All business-function command files and test specs call these methods.  
Never repeat raw Cypress chains across files.

### `common-page.ts` — complete template

```typescript
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export class CommonPage {
  // ─── Input ───────────────────────────────────────────────────────────────

  /** Type into any input field — clears existing value first */
  static enterText(selector: string, value: string) {
    cy.get(selector).clear({ force: true }).type(value);
    return this;
  }

  // ─── Buttons ─────────────────────────────────────────────────────────────

  /** Click a visible, enabled button */
  static clickOnButton(selector: string) {
    cy.get(selector, { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click()
      .then(() => cy.wait(500));
    return this;
  }

  /** Click a menu/nav item (no visibility check — menus may animate) */
  static menuClick(selector: string) {
    cy.get(selector, { timeout: 10000 }).click();
    return this;
  }

  // ─── Dropdowns ───────────────────────────────────────────────────────────

  /** Open a PrimeNG p-dropdown and select option by visible text */
  static selectDropdownOption(selector: string, value: string) {
    cy.get(selector).click();
    cy.get('li.p-dropdown-item').contains(value).click();
    return this;
  }

  // ─── Checkboxes (PrimeNG-safe) ────────────────────────────────────────────

  /**
   * Toggle a checkbox to the desired state.
   * Handles 3 cases automatically:
   *   Case 1 — selector IS .p-checkbox-box directly
   *   Case 2 — selector is p-checkbox wrapper (PrimeNG) — finds inner .p-checkbox-box
   *   Case 3 — native HTML <input type="checkbox">
   *
   * ❌ NEVER use input[type='checkbox'] directly in PrimeNG table rows
   */
  static checkOrClickCheckbox(selector: string, shouldCheck = true) {
    cy.get(selector).then(($el) => {
      if ($el.hasClass('p-checkbox-box')) {
        const isChecked = $el.hasClass('p-highlight');
        if (isChecked !== shouldCheck) cy.wrap($el).click();
        return;
      }
      const $checkboxBox = $el.find('.p-checkbox-box');
      if ($checkboxBox.length > 0) {
        const isChecked = $checkboxBox.hasClass('p-highlight');
        if (isChecked !== shouldCheck) cy.wrap($checkboxBox).click();
      } else {
        cy.wrap($el)
          .should('exist')
          .then(($checkbox) => {
            const isChecked = $checkbox.prop('checked');
            if (isChecked !== shouldCheck)
              cy.get(selector).click({ force: true });
          });
      }
    });
    return this;
  }

  // ─── Context Menus ───────────────────────────────────────────────────────

  /** Click ⋮ ellipsis button then select a context menu option */
  static clickEllipsisButton(ellipsisSelector: string, optionSelector: string) {
    cy.get(ellipsisSelector).first().click();
    cy.get(optionSelector).should('be.visible').click();
    return this;
  }

  // ─── Spinners ────────────────────────────────────────────────────────────

  /** Wait for spinner/overlay to disappear */
  static spinnerLoad(selector: string) {
    cy.get(selector).should('not.exist');
    return this;
  }

  // ─── Assertions ──────────────────────────────────────────────────────────

  /** Assert element contains expected text */
  static verifyInputText(selector: string, value: string) {
    cy.get(selector).should('contain.text', value);
    return this;
  }

  /** Assert a PrimeNG toast notification appears with correct title and detail */
  static verifyToastMessage(title: string, detail: string) {
    cy.get('.p-toast-summary', { timeout: 10000 }).should(
      'contain.text',
      title
    );
    cy.get('.p-toast-detail').should('contain.text', detail);
    return this;
  }

  /** Assert delete confirmation dialog contains the record name */
  static deleteConfirmation(confirmationMessage: string, recordName: string) {
    cy.get('.p-dialog-content').should('contain.text', confirmationMessage);
    cy.get('.p-dialog-content').should('contain.text', recordName);
    return this;
  }

  // ─── Date Helpers ─────────────────────────────────────────────────────────

  /** Assert a date string falls within an expected range (inclusive) */
  static verifyDateInRange(
    dateText: string,
    startDate: string,
    endDate: string,
    format = 'DD/MM/YYYY'
  ) {
    const date = dayjs(dateText, format);
    const start = dayjs(startDate, format);
    const end = dayjs(endDate, format);
    expect(date.isBetween(start, end, 'day', '[]')).to.be.true;
    return this;
  }
}
```

### `encryptPassword.ts` — complete template

```typescript
import * as cryptoJs from 'crypto-js';

/**
 * Encrypt a plain text password using AES.
 * Key is read from Cypress.env('encryptionKey') — set CYPRESS_ENCRYPTION_KEY in secured.env.
 */
export function encryptPasswordSync(plainTextPassword: string): string {
  const secretKey = Cypress.env('encryptionKey');
  if (!secretKey) {
    throw new Error(
      'Encryption key missing. Set CYPRESS_ENCRYPTION_KEY in secured.env'
    );
  }
  const encrypted = cryptoJs.AES.encrypt(
    plainTextPassword,
    secretKey
  ).toString();
  cy.log('Password encrypted successfully');
  return encrypted;
}

/**
 * Decrypt an AES-encrypted password back to plain text.
 * Key is read from Cypress.env('encryptionKey').
 */
export function decryptPasswordSync(encryptedPassword: string): string {
  const secretKey = Cypress.env('encryptionKey');
  if (!secretKey) {
    throw new Error(
      'Encryption key missing. Set CYPRESS_ENCRYPTION_KEY in secured.env'
    );
  }
  const bytes = cryptoJs.AES.decrypt(encryptedPassword, secretKey);
  const decrypted = bytes.toString(cryptoJs.enc.Utf8);
  if (!decrypted) {
    throw new Error('Decryption failed. Verify encryption key and ciphertext.');
  }
  return decrypted;
}
```

---

## 6. cypress/support/

### `e2e.ts` — bootstrap template

> Update the module import list to match your project's business-function files.

```typescript
// ─── Shared cross-module commands ─────────────────────────────────────────
import './commands';

// ─── Module business-function imports ─────────────────────────────────────
// Add one import per business-function file you create
import '../business-function/<module1>-commands';
import '../business-function/<module2>-commands';
// import '../business-function/<module3>-commands';

// ─── Reporter & plugins ───────────────────────────────────────────────────
import 'cypress-mochawesome-reporter/register';
import 'mochawesome/addContext';

// ─── Tag-based filtering ─────────────────────────────────────────────────
// @ts-ignore
import registerCypressGrep from '@cypress/grep';
registerCypressGrep();

// ─── Suppress known third-party cross-origin errors ───────────────────────
Cypress.on('uncaught:exception', (err) => {
  const ignoredMessages = [
    'cdn',
    'Failed to load external resource',
    'msauth.net',
    'Things went bad',
  ];
  if (ignoredMessages.some((msg) => err.message.includes(msg))) {
    return false; // suppress — not a test failure
  }
  return true; // all other exceptions fail the test
});

// ─── Global beforeEach ────────────────────────────────────────────────────
beforeEach(() => {
  const role = Cypress.env('role') || 'user';
  cy.log(`Running as role: ${role}`);
});
```

### `commands.ts` — shared commands template

```typescript
import { CommonPage } from '../page-objects/common-page';
import selectors from '../fixtures/selectors.json';
import commonSelectors from '../fixtures/common/common-selectors.json';

// ─── Spinner ──────────────────────────────────────────────────────────────

/** Wait for the global PrimeNG loading spinner to disappear */
Cypress.Commands.add('waitForSpinnerToDisappear', () => {
  cy.get('.p-progress-spinner', { timeout: 30000 }).should('not.exist');
});

// ─── Delete Record ────────────────────────────────────────────────────────

/**
 * Find a record by name, open its context menu, confirm the delete dialog,
 * wait for the DELETE API response, and assert the success toast.
 * Gracefully skips if the record is not found in the table.
 */
Cypress.Commands.add(
  'deleteRecords',
  (
    recordsName,
    confirmationMessage,
    toastMessage,
    searchApi,
    clearApi,
    deleteApi,
    isSearchApi = false
  ) => {
    cy.log(`Searching for record: ${recordsName}`);
    CommonPage.clickOnButton(selectors.pkiSelectors.searchField);
    cy.waitForSpinnerToDisappear();
    CommonPage.enterText(selectors.pkiSelectors.searchInput, recordsName);

    if (!isSearchApi) {
      cy.intercept('GET', searchApi).as('searchInterceptAlias');
      cy.wait('@searchInterceptAlias')
        .its('response.statusCode')
        .should('eq', 200);
    }

    cy.waitForSpinnerToDisappear();
    cy.get('table tbody', { timeout: 20000 }).should('exist');
    cy.wait(500);

    cy.get('body').then(($body) => {
      if (
        $body.find(commonSelectors.columnCell).text().includes('No data found')
      ) {
        cy.log(`"${recordsName}" not found — skipping deletion.`);
      } else {
        cy.contains('table tbody tr', recordsName, { timeout: 10000 })
          .should('exist')
          .within(() => {
            cy.get('td i.pi-ellipsis-v').should('be.visible').click();
          });
        CommonPage.clickOnButton(selectors.pkiSelectors.deleteMenuButton);
        CommonPage.deleteConfirmation(confirmationMessage, recordsName);
        cy.intercept('DELETE', deleteApi).as('deleteApiAlias');
        CommonPage.clickOnButton(selectors.pkiSelectors.deleteButton);
        cy.wait('@deleteApiAlias').then((interception) => {
          const statusCode = interception.response?.statusCode ?? 0;
          expect(statusCode).to.be.oneOf([200, 204]);
        });
        CommonPage.verifyToastMessage('Success', toastMessage);
      }
    });
  }
);

// ─── Table Validation ─────────────────────────────────────────────────────

/** Assert table column headers match expected array (checks up to maxColumns) */
Cypress.Commands.add(
  'validateHeaders',
  (expectedHeaders: string[], maxColumns: number) => {
    cy.get('thead th').then(($ths) => {
      const $tableHeaderElements = $ths.slice(0, maxColumns);
      expectedHeaders.forEach((header, i) => {
        expect($tableHeaderElements.eq(i).text().trim()).to.equal(header);
      });
    });
  }
);

/** Search by keyword, wait for API, then assert result appears in table */
Cypress.Commands.add(
  'searchAndValidateInTable',
  (searchText: string, searchApi: string) => {
    cy.intercept('GET', searchApi).as('searchInterceptAlias');
    CommonPage.enterText(selectors.pkiSelectors.searchInput, searchText);
    cy.wait('@searchInterceptAlias');
    cy.waitForSpinnerToDisappear();
    cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    cy.get('table tbody').should('contain.text', searchText);
  }
);

/** Click a quick-filter chip and assert all visible rows show the expected column value */
Cypress.Commands.add(
  'selectedQuickFilter',
  (filterLabel: string, columnSelector: string, expectedValue: string) => {
    cy.contains(filterLabel).click();
    cy.waitForSpinnerToDisappear();
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).find(columnSelector).should('contain.text', expectedValue);
    });
  }
);

/** Open context menu and assert all expected menu items are present */
Cypress.Commands.add(
  'validateContextMenu',
  (
    triggerSelector: string,
    menuItemSelector: string,
    expectedItems: string[]
  ) => {
    cy.get(triggerSelector).first().click();
    cy.get(menuItemSelector).then(($items) => {
      const actualItems = $items
        .toArray()
        .map((el) => el.textContent?.trim() ?? '');
      expectedItems.forEach((item) => {
        expect(actualItems).to.include(item);
      });
    });
    cy.get('body').click(0, 0); // close context menu
  }
);

/** Assert a list of buttons are all visible on the overview page */
Cypress.Commands.add('overviewButtons', (buttonSelectors: string[]) => {
  buttonSelectors.forEach((selector) => {
    cy.get(selector).should('be.visible');
  });
});
```

### `index.d.ts` — type declarations template

> **Rule:** Every single `Cypress.Commands.add('name', ...)` call across ALL files
> must have a matching declaration here. This keeps TypeScript from complaining.

```typescript
declare namespace Cypress {
  interface Chainable<Subject = any> {

    // ─── Shared / Cross-module ─────────────────────────────────────────────

    /** Wait for loading spinner to disappear */
    waitForSpinnerToDisappear(): void;

    /**
     * Find a record by name, delete it via context menu, confirm dialog,
     * wait for DELETE API, assert success toast. Skips if record not found.
     */
    deleteRecords(
      recordsName: string,
      confirmationMessage: string,
      toastMessage: string,
      searchApi: string,
      clearApi: string,
      deleteApi: string,
      isSearchApi?: boolean
    ): void;

    /** Assert table column headers match expected array */
    validateHeaders(expectedHeaders: string[], maxColumns: number): void;

    /** Search keyword and assert it appears in the data table */
    searchAndValidateInTable(searchText: string, searchApi: string): void;

    /** Apply quick-filter and verify all rows show the expected column value */
    selectedQuickFilter(filterLabel: string, columnSelector: string, expectedValue: string): void;

    /** Assert context menu contains all expected items */
    validateContextMenu(triggerSelector: string, menuItemSelector: string, expectedItems: string[]): void;

    /** Assert a set of buttons are visible on the overview page */
    overviewButtons(buttonSelectors: string[]): void;

    // ─── <Module1> commands ────────────────────────────────────────────────

    /** Navigate to Add <Module1> form and assert URL */
    clickOnAdd<Module1>(): void;

    /** Visit <Module1> overview, intercept list API, wait for spinner */
    load<Module1>Overview(): void;

    /** Fill and submit the <Module1> creation form */
    create<Module1>(data: any): void;

    /** Search for a record and open its Edit form */
    edit<Module1>(recordName: string): void;

    // ─── <Module2> commands ────────────────────────────────────────────────

    /** Navigate to Add <Module2> form and assert URL */
    clickOnAdd<Module2>(): void;

    /** Fill and submit the <Module2> creation form */
    create<Module2>(data: any): void;
  }
}
```

---

## 7. cypress/business-function/

**Rule:** One file per domain module. Each file contains ONLY `Cypress.Commands.add()` calls for that module.  
All shared logic (delete, search, header validation) lives in `support/commands.ts` — never duplicate it here.

### `<module>-commands.ts` — complete template

```typescript
import moduleSelectors from '../fixtures/<module>/<module>-selectors.json';
import { CommonPage } from '../page-objects/common-page';
import moduleData from '../fixtures/<module>/<module>-test-data.json';
import commonSelectors from '../fixtures/selectors.json';
import apiEndpoints from '../fixtures/common/all-module-api-endpoints.json';

// ─── Navigation ───────────────────────────────────────────────────────────

/** Navigate to the Add <Module> page and assert URL contains /<module>/add */
Cypress.Commands.add('clickOnAdd<Module>', () => {
  cy.waitForSpinnerToDisappear();
  cy.get(commonSelectors.pkiSelectors.addButton, { timeout: 30000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click();
  cy.url().should('include', '/<module>/add');
});

/** Visit <Module> overview, intercept list API, and wait for spinner to clear */
Cypress.Commands.add('load<Module>Overview', () => {
  cy.intercept('GET', moduleData.listApi).as('<module>ListAlias');
  cy.visit(Cypress.env('url') + moduleData.moduleUrl);
  cy.wait('@<module>ListAlias');
  cy.waitForSpinnerToDisappear();
});

// ─── Refresh ──────────────────────────────────────────────────────────────

/** Trigger a page reload and assert the list API returns HTTP 200 */
Cypress.Commands.add('clickRefreshButton', (api: string) => {
  cy.intercept('GET', api).as('reloadAlias');
  cy.get(commonSelectors.tableValidation.refreshButton)
    .should('be.visible')
    .click();
  cy.wait('@reloadAlias').then((intercept) => {
    expect(intercept.response?.statusCode).to.equal(200);
  });
});

// ─── CRUD ─────────────────────────────────────────────────────────────────

/** Fill all required fields in the <Module> creation form and submit */
Cypress.Commands.add('create<Module>', (data) => {
  CommonPage.enterText(moduleSelectors.field1Input, data.field1);
  CommonPage.enterText(moduleSelectors.field2Input, data.field2);
  CommonPage.selectDropdownOption(
    moduleSelectors.categoryDropdown,
    data.category
  );
  CommonPage.clickOnButton(moduleSelectors.createButton);
  cy.waitForSpinnerToDisappear();
});

/** Search for a record then open its Edit form via context menu */
Cypress.Commands.add('edit<Module>', (recordName: string) => {
  cy.searchAndValidateInTable(recordName, moduleData.listApi);
  CommonPage.clickEllipsisButton(
    commonSelectors.tableValidation.clickElipsisButton,
    moduleSelectors.editOption
  );
});

// ─── Validation ───────────────────────────────────────────────────────────

/** Validate the context menu options for the first table row */
Cypress.Commands.add('validate<Module>ContextMenu', () => {
  cy.validateContextMenu(
    moduleSelectors.contextMenuTrigger,
    moduleSelectors.contextMenuItems,
    moduleData.contextMenuOptions
  );
});
```

---

## 8. cypress/fixtures/

**Rule:** JSON files only. No logic. No functions. Three purposes: **selectors**, **test data**, **API endpoints**.

### `fixtures/selectors.json` — global shared selectors

```json
{
  "pkiSelectors": {
    "breadCrumb": ".topbar-breadcrumb",
    "addButton": "[label='Add']",
    "searchField": "#search",
    "searchInput": "input#search",
    "deleteMenuButton": "#Delete",
    "deleteButton": "p-button:contains(\"Delete\")",
    "overviewTable": ".p-datatable-tbody > tr.ng-star-inserted",
    "columnCell": "td",
    "tooltip": ".p-tooltip",
    "tooltipContentContainer": ".p-tooltip-text"
  },
  "tableValidation": {
    "refreshButton": "button[aria-label='Refresh']",
    "clickElipsisButton": "td i.pi-ellipsis-v",
    "paginatorRowCount": ".p-paginator-current"
  }
}
```

### `fixtures/common/common-selectors.json` — shared UI element selectors

```json
{
  "contextMenu": ".pi-ellipsis-v",
  "searchField": "#search",
  "editMenuButton": "#Edit",
  "addButton": "[label='Add']",
  "createButton": "p-button:contains(\"Create\")",
  "updateButton": "p-button:contains(\"Update\")",
  "deleteButton": "p-button:contains(\"Delete\")",
  "cancelButton": "[label='Cancel']",
  "saveButton": "#persist-button",
  "columnCell": "td",
  "tableRow": "tbody tr",
  "textWithColor": ".p-tag",
  "exportDropdown": "p-splitbutton .p-button-icon-only",
  "filterLogs": ".date-range-container .p-dropdown-label",
  "calendar": "p-calendar input"
}
```

### `fixtures/common/toast-messages.json` — all expected toast messages

```json
{
  "toastMessages": {
    "toastMessageTitles": {
      "toastSuccessTitle": "Success",
      "toastFailedTitle": "Failed"
    },
    "<module1>Module": {
      "createToastMessage": "New <Module1> '{recordName}' created successfully.",
      "editToastMessage": "<Module1> '{recordName}' details updated successfully.",
      "deleteToastMessage": "<Module1> '{recordName}' deleted successfully."
    },
    "<module2>Module": {
      "createToastMessage": "New <Module2> '{recordName}' created successfully.",
      "editToastMessage": "<Module2> '{recordName}' details updated successfully.",
      "deleteToastMessage": "<Module2> '{recordName}' deleted successfully."
    }
  }
}
```

> **Usage in tests:**
>
> ```typescript
> toastMessages.toastMessages.<module1>Module.createToastMessage
>   .replace('{recordName}', actualRecordName)
> ```

### `fixtures/common/all-module-api-endpoints.json` — all REST API glob patterns

```json
{
  "<module1>": {
    "getList": "**/api/<module1>?**",
    "getSingle": "**/api/<module1>/**",
    "create": "**/api/<module1>",
    "update": "**/api/<module1>/**",
    "delete": "**/api/<module1>/**"
  },
  "<module2>": {
    "getList": "**/api/<module2>?**",
    "getSingle": "**/api/<module2>/**",
    "create": "**/api/<module2>",
    "delete": "**/api/<module2>/**"
  },
  "auth": {
    "login": "**/api/auth/token",
    "logout": "**/api/auth/logout"
  }
}
```

### `fixtures/<module>/<module>-selectors.json` — module CSS selectors

```json
{
  "addButton": "p-button:contains(\"Add\")",
  "createButton": "p-button:contains(\"Create\")",
  "updateButton": "p-button:contains(\"Update\")",
  "deleteButton": "p-button:contains(\"Delete\")",
  "cancelButton": "[label='Cancel']",
  "editOption": "#Edit",
  "deleteOption": "#Delete",
  "contextMenuTrigger": ".pi-ellipsis-v",
  "contextMenuItems": "li[role='menuitem'] a",
  "searchInput": "#search",
  "tableRows": ".p-datatable-tbody > tr.ng-star-inserted",
  "toastTitle": ".p-toast-summary",
  "toastDetail": ".p-toast-detail",
  "noDataMessage": "div.flex.align-items-center span",
  "field1Input": "#field1",
  "field2Input": "#field2",
  "categoryDropdown": "#category .p-dropdown-trigger",
  "dropdownSearchBox": "input[role='searchbox']",
  "enabledToggle": "p-checkbox[id='enabled']",
  "tableCheckbox": "td .p-checkbox-box",
  "selectAllCheckbox": ".p-datatable-thead .p-checkbox-box"
}
```

### `fixtures/<module>/<module>-test-data.json` — module test data

```json
{
  "moduleUrl": "/<module>",
  "listApi": "**/api/<module>?**",
  "singleApi": "**/api/<module>/**",
  "refreshApi": "**/api/<module>*",
  "tableHeaders": ["Column1", "Column2", "Column3", "Status", "Actions"],
  "contextMenuOptions": ["Edit", "Delete"],
  "validInputs": {
    "field1": "ValidTestValue1",
    "field2": "ValidTestValue2",
    "category": "CategoryOption1"
  },
  "invalidInputs": {
    "field1TooLong": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "field1SpecialChars": "!!@@##$$",
    "field1Empty": ""
  },
  "validationMessages": {
    "noDataMessage": "No data found",
    "requiredField": "This field is required",
    "duplicateRecord": "Record already exists"
  },
  "searchText": "ValidTestValue1",
  "deleteRecords": ["TestRecord_001", "TestRecord_002"],
  "pageCount": ["1 - 30", "31 - 60"]
}
```

---

## 9. cypress/e2e/

**Rule:** One folder per module. Each spec imports only its own fixtures — no shared state between `describe` blocks.  
`testIsolation: false` means session state persists within a spec file (by default in this framework).

### `e2e/<module>/<module>-overview.cy.ts` — complete spec template

```typescript
import moduleData from '../../fixtures/<module>/<module>-test-data.json';
import moduleSelectors from '../../fixtures/<module>/<module>-selectors.json';
import selectors from '../../fixtures/selectors.json';
import { CommonPage } from '../../page-objects/common-page';
import toastMessages from '../../fixtures/common/toast-messages.json';
import apiEndpoints from '../../fixtures/common/all-module-api-endpoints.json';
import commonSelectors from '../../fixtures/common/common-selectors.json';

describe('<Module> Overview', () => {

  // Visit page and wait for data to load before every test
  beforeEach(() => {
    cy.intercept('GET', moduleData.listApi).as('get<Module>List');
    cy.visit(Cypress.env('url') + moduleData.moduleUrl);
    cy.wait('@get<Module>List');
    cy.waitForSpinnerToDisappear();
  });

  // ─── Overview Validation ─────────────────────────────────────────────────
  describe('<Module> Overview Validation', () => {

    it('Test:1 - Verify table column headers', { tags: 'prod' }, () => {
      cy.validateHeaders(moduleData.tableHeaders, moduleData.tableHeaders.length - 1);
    });

    it('Test:2 - Verify correct URL is loaded', () => {
      cy.url().should('include', moduleData.moduleUrl);
    });

    it('Test:3 - Validate Refresh button triggers API reload', { tags: 'prod' }, () => {
      cy.clickRefreshButton(moduleData.refreshApi);
    });

    it('Test:4 - Navigate to Add <Module> form page', () => {
      cy.clickOnAdd<Module>();
    });

    it('Test:5 - Search by keyword and validate table result', { tags: 'prod' }, () => {
      cy.searchAndValidateInTable(moduleData.searchText, moduleData.listApi);
    });

    it('Test:6 - Validate context menu options', { tags: 'prod' }, () => {
      cy.validateContextMenu(
        moduleSelectors.contextMenuTrigger,
        moduleSelectors.contextMenuItems,
        moduleData.contextMenuOptions
      );
    });
  });

  // ─── CRUD Operations ─────────────────────────────────────────────────────
  describe('<Module> CRUD Operations', () => {

    it('Test:7 - Create a new record and verify success toast', () => {
      cy.clickOnAdd<Module>();
      cy.create<Module>(moduleData.validInputs);
      CommonPage.verifyToastMessage(
        toastMessages.toastMessages.toastMessageTitles.toastSuccessTitle,
        toastMessages.toastMessages.<module>Module.createToastMessage.replace(
          '{recordName}', moduleData.validInputs.field1
        )
      );
    });

    it('Test:8 - Edit a record and verify update toast', () => {
      cy.edit<Module>(moduleData.searchText);
      CommonPage.enterText(moduleSelectors.field2Input, 'UpdatedValue');
      CommonPage.clickOnButton(moduleSelectors.updateButton);
      CommonPage.verifyToastMessage(
        toastMessages.toastMessages.toastMessageTitles.toastSuccessTitle,
        toastMessages.toastMessages.<module>Module.editToastMessage.replace(
          '{recordName}', moduleData.validInputs.field1
        )
      );
    });

    it('Test:9 - Delete a record and verify delete toast', () => {
      cy.deleteRecords(
        moduleData.deleteRecords[0],
        'Are you sure',
        toastMessages.toastMessages.<module>Module.deleteToastMessage.replace(
          '{recordName}', moduleData.deleteRecords[0]
        ),
        apiEndpoints.<module>.getList,
        apiEndpoints.<module>.getList,
        apiEndpoints.<module>.delete
      );
    });
  });

  // ─── Form Validation (negative cases) ────────────────────────────────────
  describe('<Module> Form Validation', () => {

    it('Test:10 - Show error for empty required field', () => {
      cy.clickOnAdd<Module>();
      CommonPage.clickOnButton(moduleSelectors.createButton); // attempt empty submit
      cy.get(moduleSelectors.field1Input)
        .parents('.p-field')
        .find('small.p-error')
        .should('contain.text', moduleData.validationMessages.requiredField);
    });
  });
});
```

### `e2e/<module>/<module>-creation.cy.ts` — data-driven creation template

```typescript
import creationData from '../../fixtures/<module>/<module>-creations-testdata.json';

/**
 * Data-driven: loops over all records in the JSON array.
 * Each record becomes an independent it() test case.
 */
describe('<Module> Bulk Creation', () => {
  creationData.records.forEach((record, index) => {
    it(`Test:${index + 1} — Create record: ${record.field1}`, () => {
      cy.load < Module > Overview();
      cy.clickOnAdd<Module>();
      cy.create<Module>(record);
    });
  });
});
```

**Matching fixture `<module>-creations-testdata.json`:**

```json
{
  "records": [
    { "field1": "TestRecord_001", "field2": "Value1", "category": "TypeA" },
    { "field1": "TestRecord_002", "field2": "Value2", "category": "TypeB" },
    { "field1": "TestRecord_003", "field2": "Value3", "category": "TypeA" }
  ]
}
```

### `e2e/deleterecords/wipeout-allcreatedrecords.cy.ts` — cleanup spec template

```typescript
import apiEndpoints from '../../fixtures/common/all-module-api-endpoints.json';
import toastMessages from '../../fixtures/common/toast-messages.json';
import module1Data from '../../fixtures/<module1>/<module1>-test-data.json';
import module2Data from '../../fixtures/<module2>/<module2>-test-data.json';

describe('Wipeout — Delete All Test Records', () => {

  describe('Delete <Module1> test records', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('url') + module1Data.moduleUrl);
      cy.waitForSpinnerToDisappear();
    });

    module1Data.deleteRecords.forEach((recordName) => {
      it(`Delete <Module1>: ${recordName}`, () => {
        cy.deleteRecords(
          recordName,
          'Are you sure',
          toastMessages.toastMessages.<module1>Module.deleteToastMessage.replace('{recordName}', recordName),
          apiEndpoints.<module1>.getList,
          apiEndpoints.<module1>.getList,
          apiEndpoints.<module1>.delete
        );
      });
    });
  });

  describe('Delete <Module2> test records', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('url') + module2Data.moduleUrl);
      cy.waitForSpinnerToDisappear();
    });

    module2Data.deleteRecords.forEach((recordName) => {
      it(`Delete <Module2>: ${recordName}`, () => {
        cy.deleteRecords(
          recordName,
          'Are you sure',
          toastMessages.toastMessages.<module2>Module.deleteToastMessage.replace('{recordName}', recordName),
          apiEndpoints.<module2>.getList,
          apiEndpoints.<module2>.getList,
          apiEndpoints.<module2>.delete
        );
      });
    });
  });
});
```

---

## 10. cypress/reports/ & downloads/

```
reports/
├── [spec-name]-report.html          ← Human-readable HTML per spec run
├── [spec-name]-report.json          ← JSON consumed by mochawesome-merge
└── mergedjsonreport/
    └── report.json                  ← Merged JSON — input for marge final report

downloads/
└── (files downloaded during tests — e.g. .zip, .csv, .pdf exports)
```

> Both folders are **gitignored** and **cleared** by `npm run cleanReports` before each run.

---

## 11. Fixture JSON Conventions & Rules

### File naming

| Type                   | Filename Pattern                   | Folder               |
| ---------------------- | ---------------------------------- | -------------------- |
| Module selectors       | `<module>-selectors.json`          | `fixtures/<module>/` |
| Module test data       | `<module>-test-data.json`          | `fixtures/<module>/` |
| Bulk creation records  | `<module>-creations-testdata.json` | `fixtures/<module>/` |
| Global selectors       | `selectors.json`                   | `fixtures/`          |
| Shared UI selectors    | `common-selectors.json`            | `fixtures/common/`   |
| Shared test data       | `common-test-data.json`            | `fixtures/common/`   |
| Toast messages         | `toast-messages.json`              | `fixtures/common/`   |
| API endpoint patterns  | `all-module-api-endpoints.json`    | `fixtures/common/`   |
| Delete dialog messages | `delete-dialogbox.json`            | `fixtures/common/`   |

### PrimeNG checkbox selector rules

| Context                           | ❌ Wrong                                      | ✅ Correct                              |
| --------------------------------- | --------------------------------------------- | --------------------------------------- |
| Table row checkbox                | `"td input[type='checkbox']"`                 | `"td .p-checkbox-box"`                  |
| Select-all in thead               | `".p-datatable-thead input[type='checkbox']"` | `".p-datatable-thead .p-checkbox-box"`  |
| PrimeNG form toggle (visibility)  | `.should('be.visible')` on `p-checkbox`       | `.should('exist')`                      |
| PrimeNG form toggle (interaction) | Call directly                                 | Use `CommonPage.checkOrClickCheckbox()` |

---

## 12. Command Naming Conventions

### Required variable names

| Context                 | ❌ Banned    | ✅ Required                                    |
| ----------------------- | ------------ | ---------------------------------------------- |
| Intercept alias         | `alias`      | `searchInterceptAlias`, `exportInterceptAlias` |
| Table headers jQuery    | `$ths`       | `$tableHeaderElements`                         |
| Export label            | `fileLabel`  | `exportFormatLabel`, `fileFormatLabel`         |
| File read task          | `headerTask` | `fileHeaderReadTask`                           |
| Column label            | `colLabel`   | `columnPositionLabel`                          |
| Regex / paginator match | `match`      | `paginatorCountMatch`, `regexMatch`            |
| Table body cells        | `$cells`     | `$firstRowCells`, `$tableBodyCells`            |

### Command naming pattern

| Purpose              | Pattern                                | Example                             |
| -------------------- | -------------------------------------- | ----------------------------------- |
| Navigate to add page | `clickOnAdd<Module>()`                 | `cy.clickOnAddGateway()`            |
| Load overview page   | `load<Module>Overview()`               | `cy.loadUserOverview()`             |
| Create a record      | `create<Module>(data)`                 | `cy.createGateway(data)`            |
| Edit a record        | `edit<Module>(name)`                   | `cy.editUser('TestUser')`           |
| Delete records       | `deleteRecords(...)`                   | shared — do not recreate per module |
| Search in table      | `searchAndValidateInTable(text, api)`  | shared                              |
| Quick filter         | `selectedQuickFilter(label, col, val)` | shared                              |
| Validate headers     | `validateHeaders(headers, count)`      | shared                              |

### TypeScript task typing

```typescript
// ❌ BANNED: unknown then cast
cy.task('readFile', path).then((result) => {
  const data = result as MyType[];
});

// ✅ REQUIRED: use generic type parameter
cy.task<MyType[]>('readFile', path).then((data) => {
  // data is already MyType[]
});
```

---

## 13. PrimeNG Checkbox Rule (Permanent)

PrimeNG `<p-checkbox>` hides its inner `<input#binary>` using `transform: translate(-100%)`.  
Asserting `.should('be.visible')` on `input#binary` will **always fail** — especially in CI.

### ❌ NEVER write

```typescript
cy.get("p-checkbox[id='enabled']").should('be.visible'); // fails — hidden input
cy.get("td input[type='checkbox']").click(); // fails in PrimeNG tables
cy.find("input[type='checkbox']").click({ force: true }); // bypasses visibility safety
cy.get('td [type="checkbox"]').click(); // same problem
```

### ✅ ALWAYS write

```typescript
// Visibility check on PrimeNG checkbox — use 'exist' not 'be.visible'
cy.get("p-checkbox[id='enabled']").should('exist');

// Click a checkbox in a table row
cy.get('td .p-checkbox-box').first().click();

// Click the select-all checkbox in the table header
cy.get('.p-datatable-thead').find('.p-checkbox-box').click();

// Best practice: use the safe helper — handles all 3 cases automatically
CommonPage.checkOrClickCheckbox("p-checkbox[id='enabled']", true); // check it
CommonPage.checkOrClickCheckbox("p-checkbox[id='enabled']", false); // uncheck it
```

---

## 14. How All Layers Connect

```
cypress/e2e/<module>/<module>-overview.cy.ts
    │
    │  imports JSON data & selectors ─────────────────────────────────────────
    ├──► fixtures/<module>/<module>-test-data.json    (URLs, API globs, test values)
    ├──► fixtures/<module>/<module>-selectors.json    (CSS selectors for this module)
    ├──► fixtures/common/toast-messages.json          (expected toast text)
    ├──► fixtures/common/all-module-api-endpoints.json(REST API glob patterns)
    ├──► fixtures/common/common-selectors.json        (shared buttons/inputs)
    │
    │  calls cy.* commands defined in business-function ──────────────────────
    ├──► business-function/<module>-commands.ts
    │         └── uses CommonPage  (page-objects/common-page.ts)
    │         └── uses fixtures/<module>/*.json
    │
    │  calls shared cy.* commands ────────────────────────────────────────────
    └──► support/commands.ts
              └── uses CommonPage  (page-objects/common-page.ts)
              └── uses fixtures/selectors.json

All business-function files registered once in:
    ► support/e2e.ts  ←── Cypress loads this automatically before EVERY spec

Type declarations for all cy.* commands:
    ► support/index.d.ts  ←── declare namespace Cypress { interface Chainable {...} }
```

---

## 15. Step-by-Step New Project Setup

Follow these steps **in order** when starting a brand new project.

### Step 1 — Initialize

```bash
mkdir my-qa-project && cd my-qa-project
npm init -y
```

### Step 2 — Install all dependencies

```bash
npm install --save-dev \
  cypress typescript ts-node dotenv \
  crypto-js @types/crypto-js dayjs \
  @cypress/grep \
  cypress-mochawesome-reporter mochawesome mochawesome-merge marge \
  jsonwebtoken @types/jsonwebtoken \
  cypress-wait-until nodemailer
```

### Step 3 — Create folder structure

```bash
mkdir -p cypress/page-objects
mkdir -p cypress/support
mkdir -p cypress/business-function
mkdir -p cypress/fixtures/common
mkdir -p cypress/fixtures/attachments
mkdir -p cypress/e2e/deleterecords
mkdir -p cypress/e2e/e2e-all-module
mkdir -p cypress/reports
mkdir -p cypress/downloads
mkdir -p docs
```

### Step 4 — Create root config files

Copy and adapt from templates in this guide:

| File                    | What to change                                  |
| ----------------------- | ----------------------------------------------- |
| `cypress.config.ts`     | `baseUrl`, `apiUrl`, env var names              |
| `tsconfig.json`         | `target`, `lib` if needed                       |
| `cypress/tsconfig.json` | No change needed                                |
| `secured.env`           | Fill in real URLs and keys — **gitignore this** |
| `clean-reports.mjs`     | No change needed                                |
| `package.json` scripts  | Replace `<ProjectName>` in `finalreport` script |

### Step 5 — Copy framework files (no changes needed)

```
cypress/page-objects/common-page.ts        ← copy as-is
cypress/page-objects/encryptPassword.ts    ← copy as-is
cypress/support/commands.ts                ← copy as-is
```

Copy and then add your module imports:

```
cypress/support/e2e.ts                     ← add: import '../business-function/<module>-commands'
cypress/support/index.d.ts                 ← add type declarations for all new commands
```

### Step 6 — Create shared fixture JSONs

```
cypress/fixtures/selectors.json
cypress/fixtures/common/common-selectors.json
cypress/fixtures/common/toast-messages.json
cypress/fixtures/common/all-module-api-endpoints.json
cypress/fixtures/common/delete-dialogbox.json
```

### Step 7 — For each domain module, do all of these:

```
a) Create: cypress/fixtures/<module>/<module>-selectors.json
b) Create: cypress/fixtures/<module>/<module>-test-data.json
c) Create: cypress/business-function/<module>-commands.ts
d) Register: support/e2e.ts  → add import '../business-function/<module>-commands'
e) Declare: support/index.d.ts → add all new command types
f) Create: cypress/e2e/<module>/<module>-overview.cy.ts
g) Create: cypress/e2e/<module>/<module>-creation.cy.ts  (if data-driven needed)
h) Add toast messages in: fixtures/common/toast-messages.json
i) Add API patterns in: fixtures/common/all-module-api-endpoints.json
j) Add delete records in: fixtures/<module>/<module>-test-data.json → deleteRecords[]
k) Add to wipeout spec: cypress/e2e/deleterecords/wipeout-allcreatedrecords.cy.ts
```

### Step 8 — Run and verify

```bash
# Open Cypress interactive runner
npm run cy:open

# Headless full run as admin role
npm run runTestsAsAdmin

# Production smoke tests only (tagged 'prod')
npm run runProductionTest
```

---

## 16. Per-Module Replication Checklist

Use this checklist for every new module you add to an existing project.

### Fixtures

- [ ] `fixtures/<module>/<module>-selectors.json` — all form, table, dialog selectors
- [ ] `fixtures/<module>/<module>-test-data.json` — `moduleUrl`, `listApi`, `tableHeaders`, `validInputs`, `deleteRecords[]`
- [ ] `fixtures/<module>/<module>-creations-testdata.json` — `records[]` array (if data-driven)
- [ ] `fixtures/common/toast-messages.json` — `<module>Module` create / edit / delete messages added
- [ ] `fixtures/common/all-module-api-endpoints.json` — `<module>` section added with getList, create, delete
- [ ] **All checkbox selectors use `.p-checkbox-box`** — never `input[type='checkbox']` in table context

### Business Function

- [ ] `business-function/<module>-commands.ts` created
- [ ] `clickOnAdd<Module>()` — navigates to add form, asserts URL
- [ ] `load<Module>Overview()` — visits page, intercepts list API, waits for spinner
- [ ] `create<Module>(data)` — fills all required fields, clicks create button
- [ ] `edit<Module>(name)` — searches for record, opens edit via context menu
- [ ] File imported in `support/e2e.ts`

### TypeScript Types

- [ ] All new commands declared in `support/index.d.ts`
- [ ] No `(param: unknown)` in `.then()` callbacks — use `cy.task<Type>()`
- [ ] No banned variable names used

### Spec Files

- [ ] `e2e/<module>/<module>-overview.cy.ts` created
- [ ] `beforeEach` intercepts list API and calls `cy.waitForSpinnerToDisappear()`
- [ ] Tests numbered sequentially: `Test:1`, `Test:2`, ...
- [ ] Production smoke tests tagged `{ tags: 'prod' }`
- [ ] Create test asserts success toast
- [ ] Edit test asserts update toast
- [ ] Delete test uses shared `cy.deleteRecords()` — no inline delete logic
- [ ] All delete test records in `deleteRecords[]` in test-data JSON
- [ ] Wipeout spec updated with new module's delete loop

### Quality Gates

- [ ] Zero `cy.get('input[type="checkbox"]')` in PrimeNG table row contexts
- [ ] No `.should('be.visible')` on `p-checkbox` or `input#binary`
- [ ] All repeated button/input interactions use `CommonPage.*` — no raw `cy.get()` chains
- [ ] All API calls use `cy.intercept().as('...')` + `cy.wait('@...')`
- [ ] `cy.waitForSpinnerToDisappear()` called after every page navigation and form submit
- [ ] No logic from `commands.ts` duplicated in module business-function files
- [ ] `index.d.ts` stays fully in sync with every `Cypress.Commands.add()` call

---

## 17. Copilot / AI Governance Rules

> These rules control AI code generation (GitHub Copilot, ChatGPT, etc.) for this framework.  
> When using this framework on a new project, copy this section into a new file at  
> **`.github/copilot-instructions.md`** in your project root — see the instruction at the bottom of this section.

---

### STRICT RULES (DO NOT VIOLATE)

1. **NEVER** rename existing methods, variables, classes, or files.
2. **NEVER** change method signatures or parameters.
3. **ALWAYS** reuse existing utilities, helpers, and commands.
4. **ALWAYS** follow existing naming conventions and folder structure.
5. **DO NOT** introduce new patterns if an existing one exists.
6. **DO NOT** modify config files (`.env`, `cypress.config.ts`, support files) unless explicitly asked.
7. **DO NOT** duplicate logic — reuse existing functions.
8. **MATCH** coding style exactly with existing test files.

---

### ❌ BANNED: PrimeNG Checkbox Native Input Assertions

#### Rule (PERMANENT)

PrimeNG renders checkboxes as `<p-checkbox>` components. The inner native `<input#binary>` is **hidden by CSS transform** and will ALWAYS fail `.should('be.visible')`.

#### ❌ NEVER write:

```typescript
cy.get("p-checkbox[id='enabled']").should('be.visible');
cy.get("td input[type='checkbox']").click();
cy.find("input[type='checkbox']").click({ force: true });
cy.get('td [type="checkbox"]').click();
```

#### ✅ ALWAYS write:

```typescript
// Use 'exist' not 'be.visible' for PrimeNG checkbox visibility check
cy.get("p-checkbox[id='enabled']").should('exist');

// Use .p-checkbox-box for clicking/state checking in tables
cy.get('td .p-checkbox-box').first().click();
cy.get('.p-datatable-thead').find('.p-checkbox-box').click();

// Use the safe helper — it handles all 3 PrimeNG/native cases automatically
CommonPage.checkOrClickCheckbox(selector, true);
```

#### Why this rule exists

- PrimeNG hides `<input#binary class="p-element">` using `transform: translate(-100%)` for accessibility
- `.should('be.visible')` on `input#binary` fails with: `expected '<input#binary.p-element>' to be 'visible' — hidden by transform`
- This single pattern has caused cascading test suite failures across multiple module groups

#### Selector rule for fixture JSON files

| Context             | ❌ Wrong                                      | ✅ Correct                             |
| ------------------- | --------------------------------------------- | -------------------------------------- |
| Table row checkbox  | `"td input[type='checkbox']"`                 | `"td .p-checkbox-box"`                 |
| Select-all in thead | `".p-datatable-thead input[type='checkbox']"` | `".p-datatable-thead .p-checkbox-box"` |
| Form enabled toggle | Direct `.should('be.visible')`                | Use via `checkOrClickCheckbox` only    |

---

### ❌ BANNED: Variable Naming Patterns

| Banned       | Required                                       |
| ------------ | ---------------------------------------------- |
| `alias`      | `exportInterceptAlias`, `searchInterceptAlias` |
| `$ths`       | `$tableHeaderElements`                         |
| `fileLabel`  | `exportFormatLabel`, `fileFormatLabel`         |
| `headerTask` | `fileHeaderReadTask`                           |
| `colLabel`   | `columnPositionLabel`                          |
| `match`      | `paginatorCountMatch`, `regexMatch`            |
| `$cells`     | `$firstRowCells`, `$tableBodyCells`            |

---

### ❌ BANNED: TypeScript Patterns

| Banned                                           | Required                                                |
| ------------------------------------------------ | ------------------------------------------------------- |
| `(param: unknown)` in `.then()`                  | `cy.task<ExpectedType>(...)` generic                    |
| `const x = result as SomeType[]` after `unknown` | `cy.task<SomeType[]>(name, arg).then((typed) => {...})` |

---

### ✅ Checkbox Interaction Checklist

Before writing ANY checkbox interaction, ask:

1. Is this a PrimeNG `<p-checkbox>` component? → Use `CommonPage.checkOrClickCheckbox(selector, bool)` or target `.p-checkbox-box`
2. Is this a native HTML `<input type="checkbox">`? → Use `.prop('checked')` and `.click({ force: true })`
3. Never assert `.should('be.visible')` on a selector that resolves to `input#binary`

#### How `checkOrClickCheckbox` works (hardened — do not bypass it)

`CommonPage.checkOrClickCheckbox` handles 3 cases automatically:

- Selector already IS `.p-checkbox-box` → clicked directly
- Selector is a `p-checkbox` wrapper → finds `.p-checkbox-box` inside
- Native `<input>` → uses `.prop('checked')` with `{ force: true }`

**Never bypass this helper.** Never call `.find('input[type="checkbox"]')` or `[type="checkbox"]` in table row contexts — always use `.p-checkbox-box`.

---

### ✅ AI Code Generation — Pre-flight Checklist

Before accepting any AI-generated code for this framework, verify:

- [ ] No new variable names that match the banned list above
- [ ] No `input[type='checkbox']` selectors in table row or thead contexts
- [ ] No `.should('be.visible')` on any selector that may resolve to a PrimeNG hidden input
- [ ] No new helper methods created when an existing `CommonPage.*` method already covers the case
- [ ] No raw `cy.get()` chains repeated across files — they belong in `CommonPage`
- [ ] No new `Cypress.Commands.add()` without a matching declaration in `index.d.ts`
- [ ] No modifications to `cypress.config.ts`, `support/e2e.ts`, or `support/commands.ts` unless explicitly requested
- [ ] No logic duplicated between a business-function file and `support/commands.ts`
- [ ] All intercept aliases use the approved suffix pattern (`searchInterceptAlias`, `exportInterceptAlias`)
- [ ] All TypeScript `.then()` callbacks use typed generics, not `unknown` + cast

---

> ### ACTION FOR NEW PROJECTS
>
> When you use this framework guide to set up a new project:
>
> **Create the file `.github/copilot-instructions.md`** in your new project root and copy
> the entire **Section 17 (Copilot / AI Governance Rules)** into it — starting from
> "STRICT RULES (DO NOT VIOLATE)" down to the end of the Pre-flight Checklist.
>
> This file is automatically read by GitHub Copilot in VS Code and enforces all the
> above rules on every AI suggestion made inside that project workspace.
>
> **Folder:** `.github/` (create it if it doesn't exist)  
> **File:** `copilot-instructions.md`  
> **Content:** Everything under Section 17 above, adapted with your project's module names where relevant.
>
> ```bash
> # Command to create the folder and file on a new project
> mkdir -p .github
> touch .github/copilot-instructions.md
> ```

---

_Framework reference generated: May 23, 2026_  
_Source project: Cypress QA Automation — nopCommerce_

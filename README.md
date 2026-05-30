# nopCommerce Cypress Automation Suite

> End-to-end automated test suite for the **nopCommerce 4.70.5** e-commerce platform.
> 60 tests · 12 modules · 100 % pass rate · Cypress 15 + TypeScript

---

## What is this project? *(for everyone)*

This project automatically tests an online shopping website the same way a real customer or store manager would use it — clicking buttons, filling forms, placing orders, and verifying everything works correctly.

Instead of a person manually checking the website before every release, these automated tests run in minutes and produce a clear report showing what passed and what (if anything) failed.

**Think of it as a robot that shops on the website and manages the store on your behalf, then tells you whether everything worked.**

---

## What does it test? *(business view)*

| # | Area | What it checks |
|---|------|----------------|
| 1 | **Application Setup** | Site loads correctly and admin can log in |
| 2 | **Category Management** | Create Electronics, Clothing, Home Appliances categories |
| 3 | **Product Management** | Create Headphones, Smart Watch, Bluetooth Speaker products |
| 4 | **Customer Management** | Create and manage customer accounts |
| 5 | **Cart & Checkout** | Add products to cart, fill address, place orders |
| 6 | **Category Admin** | Search, create, edit and validate categories in the admin panel |
| 7 | **Product Admin** | Search, create, edit products and validate pricing |
| 8 | **Customer Admin** | Search, edit customers, validate duplicate email rules |
| 9 | **Order Admin** | View orders, search by email, open order detail pages |
| 10 | **Storefront Validation** | Browse products, add to cart, remove items, proceed to checkout |
| 11 | **End-to-End Purchase Journey** | Full buy flow: browse → add to cart → checkout → payment → order confirmed → admin verifies |
| 12 | **Data Cleanup** | Remove all test data so the database stays clean after every run |

**Total: 60 tests — all automated, all passing.**

---

## Tech stack *(for developers)*

| Tool | Version | Purpose |
|------|---------|---------|
| [Cypress](https://cypress.io) | 15.x | Test framework — runs tests in a real browser |
| TypeScript | 5.x | Type-safe test code |
| Node.js | 20+ | Runtime for all scripts |
| Docker Desktop | latest | Runs nopCommerce + PostgreSQL locally |
| PostgreSQL | 15 | Database for nopCommerce |
| nopCommerce | 4.70.5 | Application under test |
| Mochawesome | 7.x | JSON test results per spec |
| Chrome | 100+ | Browser used for all tests |

---

## Prerequisites

Before running the tests, make sure you have these installed on your machine:

- **[Node.js](https://nodejs.org) v20 or higher** — `node --version` to check
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** — must be installed (the setup script starts it automatically)
- **[Git](https://git-scm.com)** — to clone this repo
- **Google Chrome** — installed at its default location

---

## Quick Start — Two Commands

```bash
# 1. Clone the repository
git clone https://github.com/acsanjeevi/nopcommerce-cypress-automation.git
cd nopcommerce-cypress-automation

# 2. Install dependencies
npm install

# 3. Set up your environment file
cp .env.example secured.env
#    → Open secured.env and fill in your credentials (see Environment Setup below)

# 4. Start Docker + nopCommerce (takes ~60 seconds first time)
node setup-docker.mjs

# 5. Run all 60 tests and generate the HTML report
node run-all-modules.mjs
```

That's it. When the run finishes, the test report opens automatically at:
```
cypress/reports/nopCommerce-Test-Report-YYYYMMDD-HHmmss.html
```
Open this file in any browser — no server needed, fully self-contained and shareable with the team.

---

## Environment Setup

Copy `.env.example` to `secured.env` (which is gitignored and never committed):

```bash
cp .env.example secured.env
```

Then edit `secured.env`:

```env
# The nopCommerce app URL (default Docker setup — no change needed)
CYPRESS_BASE_URL=http://localhost:8080
CYPRESS_ADMIN_URL=http://localhost:8080

# A customer account registered on the storefront
CYPRESS_CUSTOMER_EMAIL=your-email@example.com
CYPRESS_CUSTOMER_PASSWORD=YourPassword

# Admin panel credentials
CYPRESS_ADMIN_EMAIL=admin@yourstore.com
CYPRESS_ADMIN_PASSWORD=admin
```

> **Note:** The default `admin@yourstore.com / admin` credentials work out of the box with the Docker setup provided in this repo.

---

## Running Options

| Command | What it does |
|---------|-------------|
| `node setup-docker.mjs` | Starts Docker Desktop, brings up containers, waits for app |
| `node run-all-modules.mjs` | Runs all 60 tests + generates HTML report |
| `node parse-reports.mjs` | Prints a quick pass/fail summary of the last run in the terminal |
| `node generate-html-report.mjs` | Regenerates the HTML report from the last run's JSON data |
| `node clean-reports.mjs` | Deletes all report files |

---

## Test Report

Every run produces a **self-contained HTML report** — no server, no dependencies, just open the file.

- **Filename**: `nopCommerce-Test-Report-YYYYMMDD-HHmmss.html` *(timestamp tells you exactly when it ran)*
- **Location**: `cypress/reports/`
- **Contents**:
  - Overall pass rate and total duration at the top
  - Module-by-module breakdown table
  - Expandable test rows with pass/fail status and duration
  - Error messages inline for any failures
  - Failed modules auto-expand so issues are immediately visible

To share with a team member — just email or Slack them the `.html` file.

---

## Project Structure

```
nopcommerce-cypress-automation/
│
├── cypress/
│   ├── e2e/                        # Test spec files (12 modules)
│   │   ├── setup/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── users/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── order-journey/
│   │   └── deleterecords/
│   │
│   ├── business-function/          # Reusable Cypress commands per domain
│   │   ├── cart-commands.ts
│   │   ├── categories-commands.ts
│   │   ├── products-commands.ts
│   │   ├── users-commands.ts
│   │   └── orders-commands.ts
│   │
│   ├── fixtures/                   # Test data and selectors (JSON)
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── users/
│   │   ├── orders/
│   │   ├── order-journey/
│   │   └── common/
│   │
│   └── support/
│       ├── commands.ts             # Custom Cypress commands (spinner wait, delete, etc.)
│       ├── authentication.ts       # loginAsCustomer / loginAsAdmin commands
│       ├── constants.ts            # Shared timeouts and wait durations
│       ├── e2e.ts                  # Global support file (imports all commands)
│       └── index.d.ts              # TypeScript declarations for custom commands
│
├── nopcommerce-docker/
│   ├── docker-compose.yml          # PostgreSQL 15 + nopCommerce 4.70.5
│   └── postgres/init/init.sql      # Database initialisation script
│
├── setup-docker.mjs                # Step 1: start Docker + wait for app
├── run-all-modules.mjs             # Step 2: run all tests + generate report
├── generate-html-report.mjs        # Standalone HTML report generator
├── parse-reports.mjs               # Quick terminal summary
├── clean-reports.mjs               # Delete all report output
├── cypress.config.ts               # Cypress configuration (retries, timeouts, reporter)
├── CHANGELOG.md                    # Version history
├── .env.example                    # Environment variable template
└── .gitignore
```

---

## Branching & Versioning Strategy

```
main      ←── stable, released code only. Tagged with version numbers.
develop   ←── all new work goes here first.
```

### Version numbering

| Version bump | Example | When to use |
|-------------|---------|-------------|
| **Patch** | `v1.0.0 → v1.0.1` | Bug fix, selector fix, timing improvement |
| **Minor** | `v1.0.0 → v1.1.0` | New test module or new feature |
| **Major** | `v1.0.0 → v2.0.0` | Full framework change or major restructure |

### Download / checkout a specific version

```bash
# See all available versions
git tag

# Switch to a specific version
git checkout v1.0.0

# Or clone directly at a version
git clone --branch v1.0.0 https://github.com/acsanjeevi/nopcommerce-cypress-automation.git
```

### Release history

| Version | Date | Summary |
|---------|------|---------|
| [v1.0.1](../../tree/develop) | 2026-05-30 | Flake fixes, timestamped report, Docker setup script, CHANGELOG |
| [v1.0.0](../../releases/tag/v1.0.0) | 2026-05-30 | Initial release — 60 tests, 12 modules, 100% pass rate |

---

## How Flakiness Is Handled

Tests running against a live web application can sometimes be slow due to network timing. This suite uses three layers of defence:

1. **Retry policy** — every test automatically retries once if it fails (`runMode: 1` in `cypress.config.ts`)
2. **Smart spinner wait** — `waitForSpinnerToDisappear()` polls the DOM every 250 ms until all loading indicators are gone, rather than taking a single snapshot
3. **Explicit waits** — key async steps (country dropdown loading, payment method rendering) use generous timeouts defined in `constants.ts`

---

## Adding New Tests

1. Create a new spec file under `cypress/e2e/<module-name>/`
2. Add fixture files (selectors + test data) under `cypress/fixtures/<module-name>/`
3. If the module needs reusable commands, add a file under `cypress/business-function/`
4. Register the spec in the `specPattern` array in `cypress.config.ts`
5. Add the module label to the `moduleLabels` map in `generate-html-report.mjs`
6. Commit to `develop` with a short description, merge to `main` when stable, and tag a new version

---

## Requesting Access

This repository is **private**. To request access:

- Contact the repository owner at **acsanjeevi@gmail.com**
- Specify whether you need read-only (download) or contributor access
- Access is granted on a per-person basis

---

## License

Internal use only. Not licensed for public distribution.

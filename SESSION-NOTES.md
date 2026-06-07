# Session Notes — nopCommerce Cypress Automation

> **Purpose:** Complete record of work done across all sessions.  
> Use this to resume work in any future conversation without losing context.  
> Last updated: 2026-05-30

---

## Quick Resume Checklist

Before starting any new session, run these to restore the environment:

```bash
# 1. Make sure you're on develop
git checkout develop
git pull origin develop

# 2. Start Docker + nopCommerce
node setup-docker.mjs

# 3. Verify everything is working
node run-all-modules.mjs
```

Expected result: **60/60 tests passing (100%)**

---

## Project Identity

| Field | Value |
|-------|-------|
| **Project name** | nopCommerce Cypress Automation Suite |
| **GitHub repo** | https://github.com/acsanjeevi/nopcommerce-cypress-automation (private) |
| **App under test** | nopCommerce 4.70.5 — http://localhost:8080 |
| **Framework** | Cypress 15 + TypeScript |
| **Node.js** | v24.x |
| **OS** | Windows 11 Pro |
| **Working directory** | D:\Automation_Demo |

---

## Current State (as of 2026-05-30)

### Test Results
```
Total Tests : 60
Passed      : 60
Failed      : 0
Pass Rate   : 100%
Run time    : ~8 minutes
```

### Git State
```
main    → v1.0.1  (stable, released)
develop → v1.0.2  (1 commit ahead — presentation generator added)
```

### Version History
| Tag | Branch | Date | What it contains |
|-----|--------|------|-----------------|
| v1.0.0 | main | 2026-05-30 | Initial release — 60 tests, 12 modules, full suite |
| v1.0.1 | main | 2026-05-30 | Flake fixes, timestamped report, README, CHANGELOG, Docker setup |
| v1.0.2 | develop | 2026-05-30 | PowerPoint presentation generator (not yet on main) |

---

## All 12 Test Modules

| # | Module | Tests | Status |
|---|--------|-------|--------|
| 01 | Application Setup | 2 | ✅ |
| 02 | Category Management – Data Setup | 3 | ✅ |
| 03 | Product Management – Data Setup | 3 | ✅ |
| 04 | Customer Management – Data Setup | 3 | ✅ |
| 05 | Storefront – Cart and Checkout | 3 | ✅ |
| 06 | Category Admin | 7 | ✅ |
| 07 | Product Admin | 7 | ✅ |
| 08 | Customer Admin | 7 | ✅ |
| 09 | Order Admin | 5 | ✅ |
| 10 | Storefront Validation | 5 | ✅ |
| 11 | End-to-End Purchase Journey | 8 | ✅ |
| 12 | Data Cleanup | 7 | ✅ |

---

## Every Command You Need

### Environment
```bash
node setup-docker.mjs          # Start Docker Desktop + containers + wait for app
```

### Running Tests
```bash
node run-all-modules.mjs       # Run all 60 tests + auto-generate HTML report
node parse-reports.mjs         # Print pass/fail summary of last run
```

### Reports
```bash
node generate-html-report.mjs  # Regenerate HTML report from last run's JSON
node clean-reports.mjs         # Delete all report files
```

### Presentation
```bash
node generate-presentation.mjs # Generate 17-slide PowerPoint (.pptx)
```

### Git Workflow
```bash
# Daily work — always on develop
git checkout develop
git add <files>
git commit -m "v1.x.x — short description of changes"
git push origin develop

# Release — promote develop to main
git checkout main
git merge develop
# bump "version" in package.json
git add package.json
git commit -m "Bump version to 1.x.x"
git tag -a v1.x.x -m "v1.x.x — description of what's in this release"
git push origin main
git push origin v1.x.x
git checkout develop          # back to develop immediately
git merge main --ff-only      # keep develop in sync
git push origin develop
```

---

## Key Files Reference

| File | What it does |
|------|-------------|
| `setup-docker.mjs` | Auto-starts Docker Desktop, runs compose up, waits for app |
| `run-all-modules.mjs` | Runs all 12 specs in order, calls report generator at end |
| `generate-html-report.mjs` | Reads JSON files from cypress/reports/.jsons/, builds standalone HTML |
| `generate-presentation.mjs` | Builds 17-slide PowerPoint with pptxgenjs |
| `parse-reports.mjs` | Console summary: module-by-module pass/fail |
| `clean-reports.mjs` | Deletes cypress/reports/ and cypress/downloads/ |
| `cypress.config.ts` | Cypress config — retries, timeouts, reporter, Chrome flags |
| `secured.env` | Credentials (gitignored — NEVER commit) |
| `.env.example` | Safe template for onboarding new team members |
| `CHANGELOG.md` | Version history |
| `README.md` | Full project documentation |
| `automation-blueprint.md` | Original framework design guide and AI governance rules |

---

## Important Decisions Made

### Why `testIsolation: false`
Tests within a spec share browser state. The E2E purchase journey (Module 11) depends on state built across Tests 01–06 (add to cart, navigate to checkout, etc.). Isolation would require each test to rebuild that state, making the suite much slower.

### Why `retries: { runMode: 1 }`
nopCommerce is a live web app with async operations. One retry means each test gets 2 attempts — catches transient timing issues without tripling run time.

### Why Docker for nopCommerce
Ensures every team member runs against an identical, reproducible environment. No "works on my machine" problems. Single `node setup-docker.mjs` command handles the entire setup.

### Why separate `develop` and `main` branches
`main` is always production-stable and tagged. Anyone can clone `v1.0.0` at any time and know exactly what they're getting. `develop` is where active work happens — merged to `main` only when all 60 tests pass.

---

## Critical nopCommerce 4.70.5 Discoveries

These are not obvious from the code — essential knowledge for any future test work:

| Discovery | Detail |
|-----------|--------|
| **Billing save button** | `#save-billing-address-button` is permanently `display:none`. Always click `#billing-buttons-container .button-1` instead. |
| **Cancel order modal** | `button[name="cancelorder"]` matches BOTH the trigger AND the hidden modal "Yes" button. Use `.filter(":visible").first()` on trigger, then wait for `#cancelorder-action-confirmation` and click `#cancelorder-action-confirmation-submit-button`. |
| **Confirm order items** | Selector must be `#checkout-step-confirm-order table tbody tr` — there is NO `.table-wrap` class in 4.70.5. |
| **Customer create toast** | nopCommerce 4.70.5 does NOT show `.alert-success` after customer creation. Check for URL redirect to `/Customer/Edit/` instead. |
| **DataTables empty rows** | Always chain `.filter(":visible").not(".dataTables_empty")` before `.first()` on grid rows. |
| **Product quantity** | Notebooks in sample data require minimum quantity 2 — using quantity 1 will fail add-to-cart. |
| **Terms of service** | Checking `#termsofservice` may auto-redirect to `/onepagecheckout` — handle this in tests. |
| **Edit link selector** | Use `td:last-child a` — nopCommerce DataTables puts edit links in the last column. |
| **Spinner check** | `waitForSpinnerToDisappear` uses `cy.waitUntil` polling every 250ms — catches late-appearing `.blockUI` and `.dataTables_processing:visible`. |

---

## Credentials (reference only — actual values in secured.env)

| Purpose | Variable |
|---------|----------|
| Customer storefront login | `CYPRESS_CUSTOMER_EMAIL` / `CYPRESS_CUSTOMER_PASSWORD` |
| Admin panel login | `CYPRESS_ADMIN_EMAIL` / `CYPRESS_ADMIN_PASSWORD` |
| App URL | `CYPRESS_BASE_URL` = http://localhost:8080 |
| Admin URL | `CYPRESS_ADMIN_URL` = http://localhost:8080 |
| Encryption key | `CYPRESS_ENCRYPTION_KEY` |

---

## Pending / Future Work

These were discussed but not implemented yet:

| Item | Priority | Notes |
|------|----------|-------|
| Release v1.0.2 to main | High | Merge develop (presentation generator) → main + tag |
| CI/CD with GitHub Actions | Medium | Trigger 60-test suite on push to develop; block merge if tests fail |
| Cross-browser testing | Medium | Add Firefox + Edge using Cypress multi-browser support |
| API test layer | Medium | `cy.request()` tests for nopCommerce REST API — faster, independent of UI |
| Parallel execution | Medium | cypress-parallel or Cypress Cloud — target: under 3 min run time |
| Mobile viewport testing | Low | iPhone (375×812) and iPad (768×1024) viewports |
| Test trend dashboard | Low | Plot pass-rate history from JSON reports over time |

---

## Session History

### Session 1 — Initial Build (day before 2026-05-30)
- Set up Cypress 15 + TypeScript framework from scratch
- Wrote automation-blueprint.md as the project design document
- Built all 12 spec files with `Test: NN` naming convention
- Built 5 business-function command files
- Created all fixture JSON files (selectors + test data per module)
- Set up Docker compose for nopCommerce 4.70.5 + PostgreSQL 15
- First run: **53/60 = 88.3%** — failing: Cart (0/3) + E2E Journey (4/8)
- Root cause found: `#save-billing-address-button` permanently hidden
- Fix applied to `cart-commands.ts` and `order-journey.cy.ts` but not yet run

### Session 2 — 2026-05-30 (this session)

**Part 1 — Bug fixes and 100% pass rate**
- Started Docker Desktop via `powershell.exe Start-Process`
- Confirmed billing button fix was correctly applied
- Ran full suite: **58/60** — still failing Tests 07 and 08 in E2E Journey
- Fixed Test 07: `confirmOrderItems` selector had `.table-wrap` which doesn't exist in 4.70.5
- Fixed Test 08: cancel order selector matched hidden modal button — added `.filter(":visible")` + explicit modal confirmation
- Ran full suite again: **60/60 = 100%** ✅

**Part 2 — Developer tooling**
- Created `setup-docker.mjs` — one command to start Docker Desktop + containers + app health check
- Updated `generate-html-report.mjs` — timestamped filename + Total Duration KPI tile in report
- Improved `waitForSpinnerToDisappear` — replaced snapshot check with `cy.waitUntil` polling
- Created `.gitignore` (expanded) and `.env.example` (safe credentials template)

**Part 3 — GitHub**
- Initialized git repo in D:\Automation_Demo
- Created private GitHub repo: `acsanjeevi/nopcommerce-cypress-automation`
- Initial commit: 66 files, pushed to `main`
- Created `develop` branch, pushed to GitHub
- Tagged `main` as `v1.0.0` with full description

**Part 4 — Versioning workflow demo**
- Added `CHANGELOG.md` to develop — first real develop commit
- Added `README.md` to develop — full project documentation (technical + non-technical)
- Merged develop → main, bumped package.json to 1.0.1, tagged `v1.0.1`
- Synced develop with main

**Part 5 — PowerPoint presentation**
- Installed `pptxgenjs` as dev dependency
- Created `generate-presentation.mjs` — 17-slide widescreen deck
- Fixed shape type names (pptxgenjs uses camelCase: `roundRect`, `rightArrow`, `rect`)
- Generated `nopCommerce-Automation-Presentation.pptx` ✅
- Pushed to develop as v1.0.2 commit

---

## How to Share Access to the Repo

The repository is private. To grant access:
1. Go to: https://github.com/acsanjeevi/nopcommerce-cypress-automation/settings/access
2. Click **Add people** or **Add teams**
3. Enter the person's GitHub username or email
4. Choose **Read** (view/clone only) or **Write** (can push)

---

## Tech Stack Versions (locked)

```json
{
  "cypress":                       "^15.15.0",
  "typescript":                    "^5.4.2",
  "cypress-mochawesome-reporter":  "^3.8.2",
  "cypress-wait-until":            "^3.0.2",
  "@cypress/grep":                 "^4.1.0",
  "dotenv":                        "^16.4.7",
  "pptxgenjs":                     "latest",
  "Node.js":                       "v24.x",
  "Chrome":                        "148",
  "Docker Desktop":                "latest",
  "PostgreSQL":                    "15",
  "nopCommerce":                   "4.70.5"
}
```

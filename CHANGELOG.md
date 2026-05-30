# Changelog

All notable changes to this project are documented here.  
Format: `vMAJOR.MINOR.PATCH` — MAJOR breaking change · MINOR new feature · PATCH bug fix

---

## [v1.0.1] - 2026-05-30 — develop
### Changed
- `waitForSpinnerToDisappear` replaced with `cy.waitUntil` polling (250 ms interval)
  — catches late-appearing `.blockUI` and `.dataTables_processing` spinners reliably
- HTML report filename now timestamped: `nopCommerce-Test-Report-YYYYMMDD-HHmmss.html`
- HTML report adds **Total Duration** KPI tile and shows duration in footer
- `.gitignore` updated — added `*.tsbuildinfo`, `.idea/`, `.vscode/settings.json`
- `.env.example` added as a safe template for onboarding new team members

### Fixed
- Test 07 (Confirm and Place Order): selector updated to `#checkout-step-confirm-order table tbody tr`
  — removed non-existent `.table-wrap` class that caused timeout
- Test 08 (Admin Cancel Order): cancel trigger now uses `.filter(':visible').first()` to avoid
  matching the hidden modal "Yes" button; modal `#cancelorder-action-confirmation` explicitly
  waited before clicking submit
- `cart-commands.ts` / `order-journey.cy.ts`: billing step uses `#billing-buttons-container .button-1`
  — `#save-billing-address-button` is permanently `display:none` in nopCommerce 4.70.5

### Added
- `setup-docker.mjs` — single command to start Docker Desktop, bring up containers,
  and wait for the app to be healthy on http://localhost:8080

---

## [v1.0.0] - 2026-05-30 — main
### Added
- Initial release: 60 tests across 12 modules, 100% pass rate
- App under test: nopCommerce 4.70.5 on Docker (PostgreSQL 15, port 8080)
- Framework: Cypress 15 + TypeScript, Chrome headed
- `run-all-modules.mjs` — runs all 12 spec files in order, prints summary,
  auto-generates standalone HTML report at end
- `generate-html-report.mjs` — self-contained HTML report, no server needed, shareable
- `parse-reports.mjs` — console summary of last run
- Retry policy: `runMode: 1` (each test gets 2 attempts)
- Modules: Setup · Category/Product/Customer CRUD · Cart & Checkout ·
  Order Admin · Storefront Validation · E2E Purchase Journey · Data Cleanup

---

<!--
## [vX.Y.Z] - YYYY-MM-DD — branch
### Added     — new tests, new modules, new tooling
### Changed   — behaviour change in existing tests or commands
### Fixed     — selector fixes, timing fixes, flake fixes
### Removed   — deleted tests or deprecated helpers
-->

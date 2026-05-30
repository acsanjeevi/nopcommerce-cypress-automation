/**
 * Generates nopCommerce-Automation-Presentation.pptx
 * Run: node generate-presentation.mjs
 */

import PptxGenJS from 'pptxgenjs';

const prs = new PptxGenJS();
prs.layout  = 'LAYOUT_WIDE'; // 13.33" x 7.5"
prs.title   = 'nopCommerce Cypress Automation Suite';
prs.subject = 'End-to-End Test Automation — Technical & Business Overview';
prs.author  = 'Sanjeevi — QA Automation Engineer';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:    '1a1a2e', navyMid: '16213e', navyLight: '0f3460',
  blue:    '3b82f6', blueDark: '1d4ed8',
  green:   '22c55e', greenDark: '166534', greenBg: 'dcfce7',
  amber:   'f59e0b', amberBg: 'fef9c3',
  red:     'ef4444', redBg:   'fee2e2',
  purple:  '8b5cf6', purpleBg: 'ede9fe',
  white:   'FFFFFF', offWhite: 'F8FAFC',
  gray:    '718096', grayLight: 'E2E8F0', grayDark: '2d3748',
  teal:    '0d9488',
};
const FONT = 'Calibri';

// ── Reusable helpers ─────────────────────────────────────────────────────────

/** Dark header banner at top of every content slide */
function addHeader(slide, title, subtitle) {
  slide.addShape('rect', {
    x: 0, y: 0, w: 13.33, h: 1.1,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  slide.addText(title, {
    x: 0.35, y: 0.1, w: 10, h: 0.55,
    fontFace: FONT, fontSize: 22, bold: true, color: C.white,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.35, y: 0.62, w: 12.5, h: 0.38,
      fontFace: FONT, fontSize: 11, color: 'a0aec0', italic: true,
    });
  }
  // Accent bar
  slide.addShape('rect', {
    x: 0, y: 1.1, w: 13.33, h: 0.045,
    fill: { color: C.blue }, line: { color: C.blue },
  });
  // Slide number area on right
  slide.addText('nopCommerce Automation Suite  |  Cypress 15 + TypeScript', {
    x: 0.3, y: 7.18, w: 12.7, h: 0.28,
    fontFace: FONT, fontSize: 8, color: C.gray, align: 'center',
  });
}

/** Coloured KPI box */
function kpi(slide, x, y, value, label, fillColor, textColor) {
  slide.addShape('roundRect', {
    x, y, w: 2.6, h: 1.1, rectRadius: 0.1,
    fill: { color: fillColor }, line: { color: fillColor },
  });
  slide.addText(value, {
    x, y: y + 0.05, w: 2.6, h: 0.6,
    fontFace: FONT, fontSize: 28, bold: true, color: textColor, align: 'center',
  });
  slide.addText(label, {
    x, y: y + 0.65, w: 2.6, h: 0.35,
    fontFace: FONT, fontSize: 9, color: textColor, align: 'center',
    charSpacing: 1,
  });
}

/** Section divider pill */
function sectionPill(slide, x, y, text, color) {
  slide.addShape('roundRect', {
    x, y, w: 2.2, h: 0.32, rectRadius: 0.1,
    fill: { color: color }, line: { color: color },
  });
  slide.addText(text, {
    x, y, w: 2.2, h: 0.32,
    fontFace: FONT, fontSize: 9, bold: true, color: C.white, align: 'center',
  });
}

/** Two-column layout helper — returns [leftX, rightX] */
const L = 0.4, R = 7.0, CW = 6.1;

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 01 — Title
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.navy };

  // Gradient overlay rectangle
  sl.addShape('rect', {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.navyMid }, line: { color: C.navyMid },
  });
  sl.addShape('rect', {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.blue }, line: { color: C.blue },
  });

  sl.addText('nopCommerce', {
    x: 0.6, y: 1.0, w: 12, h: 0.9,
    fontFace: FONT, fontSize: 48, bold: true, color: C.white,
  });
  sl.addText('Cypress Automation Suite', {
    x: 0.6, y: 1.85, w: 12, h: 0.75,
    fontFace: FONT, fontSize: 36, bold: false, color: C.blue,
  });
  sl.addShape('rect', {
    x: 0.6, y: 2.72, w: 5, h: 0.04,
    fill: { color: C.blue }, line: { color: C.blue },
  });
  sl.addText('End-to-End Test Automation for E-Commerce', {
    x: 0.6, y: 2.9, w: 12, h: 0.45,
    fontFace: FONT, fontSize: 16, color: 'a0aec0', italic: true,
  });

  // KPI row
  const kpis = [
    ['60', 'Tests'],
    ['12', 'Modules'],
    ['100%', 'Pass Rate'],
    ['v1.0.1', 'Released'],
  ];
  kpis.forEach(([v, l], i) => {
    const bx = 0.6 + i * 3.1;
    sl.addShape('roundRect', {
      x: bx, y: 3.6, w: 2.7, h: 1.0, rectRadius: 0.12,
      fill: { color: C.navyLight }, line: { color: C.blue, pt: 1 },
    });
    sl.addText(v, {
      x: bx, y: 3.65, w: 2.7, h: 0.55,
      fontFace: FONT, fontSize: 26, bold: true, color: C.blue, align: 'center',
    });
    sl.addText(l, {
      x: bx, y: 4.18, w: 2.7, h: 0.3,
      fontFace: FONT, fontSize: 10, color: 'a0aec0', align: 'center',
    });
  });

  sl.addText('Cypress 15  ·  TypeScript  ·  Docker  ·  PostgreSQL 15  ·  Chrome', {
    x: 0.6, y: 5.0, w: 12, h: 0.35,
    fontFace: FONT, fontSize: 12, color: '718096',
  });
  sl.addText('Prepared by: Sanjeevi — QA Automation Engineer  |  May 2026', {
    x: 0.6, y: 6.6, w: 12, h: 0.3,
    fontFace: FONT, fontSize: 10, color: '4a5568',
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 02 — Agenda
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Agenda', 'What we will cover in this presentation');

  const items = [
    ['01', 'What Is This Project?',         'Plain-English overview for everyone'],
    ['02', 'Application Under Test',        'nopCommerce 4.70.5 — what it does'],
    ['03', 'How We Started',                'From blueprint to 100% pass rate'],
    ['04', 'Technical Stack',               'Tools, versions, and why we chose them'],
    ['05', 'Framework Architecture',        'How all layers connect'],
    ['06', 'Login Types & Purpose',         'Admin vs Customer — what each role tests'],
    ['07', 'Project Structure',             'Folder layout and file responsibilities'],
    ['08', 'All 12 Modules',                'Business view of every test area'],
    ['09', 'End-to-End Purchase Journey',   '8-step full buy flow — deep dive'],
    ['10', 'Two-Command Workflow',          'Running everything with two commands'],
    ['11', 'Challenges & Solutions',        'Key fixes that got us to 100%'],
    ['12', 'Branching & Versioning',        'main / develop / tags — how releases work'],
    ['13', 'Future Enhancements',           'Where we take this next'],
  ];

  const col1 = items.slice(0, 7);
  const col2 = items.slice(7);

  [[col1, 0.35], [col2, 6.85]].forEach(([col, xOff]) => {
    col.forEach(([num, title, sub], i) => {
      const yy = 1.35 + i * 0.83;
      sl.addShape('roundRect', {
        x: xOff, y: yy, w: 0.48, h: 0.38, rectRadius: 0.06,
        fill: { color: C.navy }, line: { color: C.navy },
      });
      sl.addText(num, {
        x: xOff, y: yy, w: 0.48, h: 0.38,
        fontFace: FONT, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle',
      });
      sl.addText(title, {
        x: xOff + 0.56, y: yy, w: 5.6, h: 0.22,
        fontFace: FONT, fontSize: 11, bold: true, color: C.grayDark,
      });
      sl.addText(sub, {
        x: xOff + 0.56, y: yy + 0.2, w: 5.6, h: 0.18,
        fontFace: FONT, fontSize: 8.5, color: C.gray, italic: true,
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 03 — What Is This? (Non-technical)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'What Is This Project?', 'A plain-English explanation — no technical background needed');

  // Big analogy box
  sl.addShape('roundRect', {
    x: 0.35, y: 1.3, w: 12.6, h: 1.2, rectRadius: 0.12,
    fill: { color: 'EFF6FF' }, line: { color: C.blue, pt: 1.5 },
  });
  sl.addText('💡  Think of it as a robot that shops on your website and manages the store — ', {
    x: 0.55, y: 1.38, w: 12.2, h: 0.38,
    fontFace: FONT, fontSize: 13, bold: true, color: C.navyLight,
  });
  sl.addText('     then reports back whether every step worked correctly, in minutes, every single time.', {
    x: 0.55, y: 1.73, w: 12.2, h: 0.35,
    fontFace: FONT, fontSize: 12, color: C.grayDark, italic: true,
  });

  const points = [
    ['🛒', 'Automated Shopping',   'The suite places real orders on the website, verifies products are in the cart, fills in addresses, and confirms the order is complete — exactly as a customer would.'],
    ['🏪', 'Store Management',     'It also logs into the admin panel and verifies categories, products, customers, and orders are all visible and correct — as a store manager would check.'],
    ['🔁', 'Runs Every Time',      'Instead of a person spending hours checking the site before each release, these 60 tests run automatically in about 8 minutes and produce a shareable report.'],
    ['📊', 'Clear Report',         'The output is a self-contained HTML file — open it in any browser, see what passed, what failed, and how long each step took. No tools needed to read it.'],
  ];

  points.forEach(([icon, title, body], i) => {
    const x = i < 2 ? 0.35 : 0.35;
    const y = 2.72 + (i < 2 ? i : i - 2) * 1.55 + (i >= 2 ? 0 : 0);
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = i < 2 ? 2.7 : 4.38;
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.35, rectRadius: 0.1,
      fill: { color: C.offWhite }, line: { color: C.grayLight, pt: 1 },
    });
    sl.addText(`${icon}  ${title}`, {
      x: xOff + 0.18, y: yOff + 0.1, w: 5.6, h: 0.3,
      fontFace: FONT, fontSize: 12, bold: true, color: C.navy,
    });
    sl.addText(body, {
      x: xOff + 0.18, y: yOff + 0.42, w: 5.65, h: 0.78,
      fontFace: FONT, fontSize: 10, color: C.grayDark,
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 04 — Application Under Test
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Application Under Test', 'nopCommerce 4.70.5 — Open-source E-Commerce Platform');

  // Left column
  sl.addText('What is nopCommerce?', {
    x: L, y: 1.3, w: 5.8, h: 0.35,
    fontFace: FONT, fontSize: 14, bold: true, color: C.navy,
  });
  const desc = [
    'nopCommerce is a free, open-source e-commerce platform used worldwide for building online shops.',
    'It has two main areas that the automation tests cover:',
    '',
    '  🛒  Customer Storefront  — the public-facing shopping website where customers browse, add to cart, and place orders.',
    '',
    '  ⚙️   Admin Panel  — the back-office where store managers manage products, categories, customers, and orders.',
    '',
    'In this project, nopCommerce runs inside Docker on your local machine at:',
    '  http://localhost:8080',
  ];
  sl.addText(desc.join('\n'), {
    x: L, y: 1.72, w: 5.9, h: 4.2,
    fontFace: FONT, fontSize: 10.5, color: C.grayDark,
  });

  // Right column — two boxes
  ['Customer Storefront', 'Admin Panel'].forEach((label, i) => {
    const yy = 1.3 + i * 2.5;
    const color  = i === 0 ? C.blue    : C.purple;
    const bgCol  = i === 0 ? 'EFF6FF'  : C.purpleBg;
    const items  = i === 0
      ? ['Browse & search products', 'Add to cart, update quantity', 'Enter billing + shipping address', 'Select payment method', 'Confirm & place order', 'View order confirmation']
      : ['Log in as admin', 'Manage categories & products', 'Manage customer accounts', 'View & update order status', 'Search and filter records', 'Validate grid data'];
    sl.addShape('roundRect', {
      x: R, y: yy, w: CW, h: 2.2, rectRadius: 0.12,
      fill: { color: bgCol }, line: { color: color, pt: 1.5 },
    });
    sl.addText(label, {
      x: R + 0.2, y: yy + 0.1, w: 5.7, h: 0.32,
      fontFace: FONT, fontSize: 12, bold: true, color: color,
    });
    items.forEach((item, j) => {
      sl.addText(`•  ${item}`, {
        x: R + 0.25, y: yy + 0.48 + j * 0.28, w: 5.6, h: 0.26,
        fontFace: FONT, fontSize: 9.5, color: C.grayDark,
      });
    });
  });

  // Docker badge
  sl.addShape('roundRect', {
    x: L, y: 6.2, w: 5.8, h: 0.7, rectRadius: 0.1,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  sl.addText('Runs on: Docker Desktop  ·  PostgreSQL 15  ·  nopCommerce 4.70.5  ·  Port 8080', {
    x: L, y: 6.2, w: 5.8, h: 0.7,
    fontFace: FONT, fontSize: 9.5, color: C.white, align: 'center', valign: 'middle', bold: true,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 05 — How We Started: The Journey
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'How We Started — The Journey', 'From blueprint to 100% pass rate');

  const steps = [
    { num: '01', color: C.blue,   title: 'Blueprint Defined',    body: 'Created automation-blueprint.md — the single source of truth covering test plan, credentials, module breakdown, folder structure, and all coding rules.' },
    { num: '02', color: C.teal,   title: 'Framework Built',      body: 'Set up Cypress 15 + TypeScript, Docker with nopCommerce 4.70.5, all 12 spec files, 5 business-function command files, fixture JSONs, and support layer.' },
    { num: '03', color: C.amber,  title: '88.3% — First Run',    body: '53/60 tests passed. Failing: Storefront Cart (0/3) and E2E Journey (4/8). Root cause: billing button selector — nopCommerce uses a permanently hidden #save-billing-address-button.' },
    { num: '04', color: C.green,  title: '96.7% — Second Run',   body: 'Billing fix applied. 58/60 passing. Remaining: Test 07 (confirmOrderItems selector had non-existent .table-wrap) and Test 08 (cancel modal hidden button conflict).' },
    { num: '05', color: C.purple, title: '100% — Final Run',     body: 'All selector and modal fixes applied. 60/60 tests passing. waitForSpinnerToDisappear upgraded to cy.waitUntil polling. Two-command workflow documented.' },
    { num: '06', color: C.navy,   title: 'v1.0.1 Released',      body: 'README, CHANGELOG added. Code pushed to GitHub private repo (acsanjeevi/nopcommerce-cypress-automation). Branching strategy: main (stable) + develop (active work).' },
  ];

  steps.forEach((s, i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 1.32 + Math.floor(i / 2) * 1.95;
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.78, rectRadius: 0.1,
      fill: { color: C.offWhite }, line: { color: C.grayLight, pt: 1 },
    });
    sl.addShape('roundRect', {
      x: xOff + 0.12, y: yOff + 0.12, w: 0.52, h: 0.38, rectRadius: 0.06,
      fill: { color: s.color }, line: { color: s.color },
    });
    sl.addText(s.num, {
      x: xOff + 0.12, y: yOff + 0.12, w: 0.52, h: 0.38,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle',
    });
    sl.addText(s.title, {
      x: xOff + 0.75, y: yOff + 0.12, w: 5.1, h: 0.38,
      fontFace: FONT, fontSize: 12, bold: true, color: C.navy,
    });
    sl.addText(s.body, {
      x: xOff + 0.15, y: yOff + 0.58, w: 5.7, h: 1.08,
      fontFace: FONT, fontSize: 9.5, color: C.grayDark,
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 06 — Technical Stack
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Technical Stack', 'Every tool used, its version, and why it was chosen');

  const rows = [
    [{ text: 'Tool', options: { bold: true, color: C.white, fill: C.navy } },
     { text: 'Version', options: { bold: true, color: C.white, fill: C.navy } },
     { text: 'Purpose', options: { bold: true, color: C.white, fill: C.navy } }],
    ['Cypress', '15.x', 'Test runner — controls a real Chrome browser, intercepts network, takes screenshots on failure'],
    ['TypeScript', '5.x', 'Type-safe test code — catches selector typos and missing parameters at compile time'],
    ['Node.js', '24.x', 'Runtime for all scripts — setup-docker, run-all-modules, report generator'],
    ['Docker Desktop', 'latest', 'Runs nopCommerce + PostgreSQL locally in isolated containers with one command'],
    ['PostgreSQL', '15', 'Database for nopCommerce — stores all product, order, and customer data'],
    ['nopCommerce', '4.70.5', 'Application under test — open-source e-commerce platform'],
    ['Cypress Mochawesome Reporter', '3.8.2', 'Generates per-spec JSON + HTML reports with embedded screenshots'],
    ['cypress-wait-until', '3.0.2', 'Adds cy.waitUntil() — used in waitForSpinnerToDisappear polling'],
    ['@cypress/grep', '4.1.0', 'Tag-based test filtering — run only { tags: "prod" } smoke tests'],
    ['dotenv', '16.x', 'Loads secured.env into process.env — keeps credentials out of source code'],
    ['pptxgenjs', 'latest', 'Generates this PowerPoint presentation from a Node.js script'],
  ];

  const tableRows = rows.map((row, i) => {
    if (i === 0) return row;
    const bg = i % 2 === 0 ? C.offWhite : C.white;
    return row.map(cell => ({ text: cell, options: { fill: bg, color: C.grayDark, fontSize: 9.5, fontFace: FONT } }));
  });

  sl.addTable(tableRows, {
    x: 0.35, y: 1.28, w: 12.63,
    colW: [2.3, 1.4, 8.93],
    border: { color: C.grayLight, pt: 0.5 },
    fontSize: 9.5,
    fontFace: FONT,
    rowH: 0.42,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 07 — Framework Architecture
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Framework Architecture', 'How all layers connect — from test spec to browser action');

  const layers = [
    { label: 'Test Spec  (.cy.ts)',         sub: 'cypress/e2e/<module>/', color: C.navy,  desc: 'Describes WHAT to test in business language. Calls cy.* commands. Imports fixture JSON for data and selectors.' },
    { label: 'Business Function Commands',  sub: 'cypress/business-function/', color: C.blue,   desc: 'Domain-specific cy.* commands (e.g. cy.proceedToCheckout, cy.loginAsAdmin). One file per module. Calls CommonPage helpers.' },
    { label: 'Shared Commands',             sub: 'cypress/support/commands.ts', color: C.teal,   desc: 'Cross-module commands: waitForSpinnerToDisappear, deleteRecords, validateHeaders, searchAndValidateInTable.' },
    { label: 'Page Objects / Helpers',      sub: 'cypress/page-objects/',       color: C.purple, desc: 'CommonPage static methods: enterText, clickOnButton, selectDropdownOption, checkOrClickCheckbox. Only layer that uses raw cy.get().' },
    { label: 'Fixture JSON',                sub: 'cypress/fixtures/',           color: C.amber,  desc: 'CSS selectors and test data stored as JSON — completely separate from code. Selectors file + test-data file per module.' },
    { label: 'Cypress Config + Secrets',    sub: 'cypress.config.ts + secured.env', color: C.gray,   desc: 'Timeouts, retries, reporter config. Credentials loaded from gitignored secured.env via dotenv.' },
  ];

  layers.forEach((l, i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 1.28 + Math.floor(i / 2) * 1.98;
    sl.addShape('rect', {
      x: xOff, y: yOff, w: 0.14, h: 1.78,
      fill: { color: l.color }, line: { color: l.color },
    });
    sl.addShape('roundRect', {
      x: xOff + 0.14, y: yOff, w: 5.86, h: 1.78, rectRadius: 0,
      fill: { color: C.offWhite }, line: { color: C.grayLight, pt: 1 },
    });
    sl.addText(l.label, {
      x: xOff + 0.28, y: yOff + 0.1, w: 5.5, h: 0.3,
      fontFace: FONT, fontSize: 12, bold: true, color: l.color,
    });
    sl.addText(l.sub, {
      x: xOff + 0.28, y: yOff + 0.4, w: 5.5, h: 0.22,
      fontFace: FONT, fontSize: 8.5, color: C.gray, italic: true,
    });
    sl.addText(l.desc, {
      x: xOff + 0.28, y: yOff + 0.65, w: 5.55, h: 1.0,
      fontFace: FONT, fontSize: 9.5, color: C.grayDark,
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 08 — Login Types & Purpose
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Login Types & Purpose', 'Two roles — each tested for a different part of the application');

  [[C.blue, 'EFF6FF', 'Customer Login', 'cy.loginAsCustomer()', 'acsanjeevi@gmail.com', 'storefront user', [
    'Visit and browse the product catalogue',
    'Add products to cart with selected attributes',
    'Fill billing address, select shipping & payment',
    'Place an order and confirm the success page',
    'Verify cart contents and order totals',
    'Used in: cart-creation, cart-overview, order-journey specs',
  ]],
  [C.purple, C.purpleBg, 'Admin Login', 'cy.loginAsAdmin()', 'admin@yourstore.com', 'store administrator', [
    'Create and edit Categories, Products, Customers',
    'View the Orders grid and search by email',
    'Open order detail pages and update order status',
    'Verify cancel-order flow and status changes',
    'Validate admin grid headers, search, and pagination',
    'Used in: all admin overview specs + order-journey admin flow',
  ]]].forEach(([color, bg, title, cmd, email, role, bullets], i) => {
    const xOff = i === 0 ? 0.35 : 6.85;
    sl.addShape('roundRect', {
      x: xOff, y: 1.25, w: 6.0, h: 5.65, rectRadius: 0.14,
      fill: { color: bg }, line: { color: color, pt: 2 },
    });
    sl.addText(title, {
      x: xOff + 0.2, y: 1.38, w: 5.6, h: 0.38,
      fontFace: FONT, fontSize: 16, bold: true, color: color,
    });
    sl.addText(`Command: ${cmd}`, {
      x: xOff + 0.2, y: 1.78, w: 5.6, h: 0.28,
      fontFace: FONT, fontSize: 9.5, color: C.gray, italic: true,
    });
    sl.addShape('rect', {
      x: xOff + 0.2, y: 2.1, w: 5.6, h: 0.01,
      fill: { color: color }, line: { color: color },
    });
    [['Email', email], ['Role', role]].forEach(([k, v], j) => {
      sl.addText(`${k}:`, {
        x: xOff + 0.25, y: 2.2 + j * 0.32, w: 0.7, h: 0.28,
        fontFace: FONT, fontSize: 9.5, bold: true, color: color,
      });
      sl.addText(v, {
        x: xOff + 0.98, y: 2.2 + j * 0.32, w: 4.8, h: 0.28,
        fontFace: FONT, fontSize: 9.5, color: C.grayDark,
      });
    });
    sl.addShape('rect', {
      x: xOff + 0.2, y: 2.9, w: 5.6, h: 0.01,
      fill: { color: C.grayLight }, line: { color: C.grayLight },
    });
    sl.addText('What this role tests:', {
      x: xOff + 0.25, y: 2.95, w: 5.5, h: 0.25,
      fontFace: FONT, fontSize: 9, bold: true, color: C.grayDark,
    });
    bullets.forEach((b, j) => {
      sl.addText(`✓  ${b}`, {
        x: xOff + 0.25, y: 3.25 + j * 0.48, w: 5.5, h: 0.42,
        fontFace: FONT, fontSize: 9.5, color: C.grayDark,
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 09 — Project Structure
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Project Structure', 'Every folder has a single clear responsibility');

  const tree = [
    ['nopcommerce-cypress-automation/',    C.navy,   true,  ''],
    ['├── cypress/',                        C.blue,   true,  'All test code lives here'],
    ['│   ├── e2e/',                        C.blue,   false, '12 spec files (one folder per module)'],
    ['│   ├── business-function/',          C.teal,   false, '5 domain command files (cart, categories, products, users, orders)'],
    ['│   ├── fixtures/',                   C.amber,  false, 'CSS selectors + test data as JSON (one subfolder per module)'],
    ['│   ├── support/',                    C.purple, false, 'commands.ts, authentication.ts, constants.ts, index.d.ts, e2e.ts'],
    ['│   └── page-objects/',              C.gray,   false, 'CommonPage helpers + password encryption utilities'],
    ['├── nopcommerce-docker/',             C.navy,   true,  'Docker Compose + PostgreSQL init SQL'],
    ['├── setup-docker.mjs',               C.green,  false, 'COMMAND 1 — starts Docker Desktop, containers, waits for app health'],
    ['├── run-all-modules.mjs',            C.green,  false, 'COMMAND 2 — runs all 60 tests, prints summary, generates HTML report'],
    ['├── generate-html-report.mjs',       C.teal,   false, 'Builds the self-contained timestamped HTML report from JSON data'],
    ['├── generate-presentation.mjs',      C.purple, false, 'Generates this PowerPoint from Node.js (pptxgenjs)'],
    ['├── cypress.config.ts',              C.blue,   false, 'Retries, timeouts, reporter config, Chrome flags, after:run hook'],
    ['├── secured.env',                    C.red,    false, '🔒 GITIGNORED — credentials, URLs, encryption key'],
    ['├── .env.example',                   C.amber,  false, 'Safe template for onboarding — copy to secured.env'],
    ['├── CHANGELOG.md',                   C.gray,   false, 'Version history for all releases'],
    ['└── README.md',                      C.gray,   false, 'Full project documentation (technical + non-technical)'],
  ];

  sl.addShape('roundRect', {
    x: 0.35, y: 1.25, w: 12.63, h: 5.7, rectRadius: 0.1,
    fill: { color: '0d1117' }, line: { color: C.grayDark, pt: 1 },
  });

  tree.forEach(([path, color, bold, comment], i) => {
    sl.addText(path, {
      x: 0.55, y: 1.38 + i * 0.32, w: 5.4, h: 0.28,
      fontFace: 'Courier New', fontSize: 9, bold: bold, color: color,
    });
    if (comment) {
      sl.addText(`← ${comment}`, {
        x: 6.05, y: 1.38 + i * 0.32, w: 6.7, h: 0.28,
        fontFace: FONT, fontSize: 8.5, color: '6b7280', italic: true,
      });
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — All 12 Modules
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'All 12 Test Modules', 'Business purpose of every automated test area');

  const modules = [
    ['01', 'Application Setup',              '2',  'Verifies site loads correctly and admin login works'],
    ['02', 'Category Management – Setup',    '3',  'Creates Electronics, Clothing, Home Appliances categories'],
    ['03', 'Product Management – Setup',     '3',  'Creates Wireless Headphones, Smart Watch, Bluetooth Speaker'],
    ['04', 'Customer Management – Setup',    '3',  'Creates customer accounts: Alice Johnson, Bob Williams, Carol Smith'],
    ['05', 'Storefront – Cart & Checkout',   '3',  'Places 3 real orders end-to-end through the storefront'],
    ['06', 'Category Admin',                 '7',  'View list, search, add, edit, validate rules in admin panel'],
    ['07', 'Product Admin',                  '7',  'View list, search, add, edit price, validate required fields'],
    ['08', 'Customer Admin',                 '7',  'View list, search, add, edit, validate duplicate email rule'],
    ['09', 'Order Admin',                    '5',  'View order list, search by email, open detail, verify columns'],
    ['10', 'Storefront Validation',          '5',  'Browse products, add/remove from cart, proceed to checkout'],
    ['11', 'End-to-End Purchase Journey',    '8',  'Full 8-step buy flow: browse → cart → billing → shipping → payment → confirm → admin verify'],
    ['12', 'Data Cleanup',                   '7',  'Deletes all test-created customers, categories, and products'],
  ];

  const colors = [C.teal, C.blue, C.blue, C.blue, C.green, C.navy, C.navy, C.navy, C.navy, C.teal, C.purple, C.red];

  const header = [
    { text: '#', options: { bold: true, color: C.white, fill: C.navy, align: 'center' } },
    { text: 'Module Name', options: { bold: true, color: C.white, fill: C.navy } },
    { text: 'Tests', options: { bold: true, color: C.white, fill: C.navy, align: 'center' } },
    { text: 'Business Purpose', options: { bold: true, color: C.white, fill: C.navy } },
  ];

  const rows = [header, ...modules.map(([num, name, tests, purpose], i) => {
    const bg = i % 2 === 0 ? C.offWhite : C.white;
    return [
      { text: num, options: { fill: bg, color: colors[i], bold: true, align: 'center', fontFace: FONT, fontSize: 9 } },
      { text: name, options: { fill: bg, color: C.grayDark, bold: true, fontFace: FONT, fontSize: 9.5 } },
      { text: tests, options: { fill: bg, color: colors[i], bold: true, align: 'center', fontFace: FONT, fontSize: 11 } },
      { text: purpose, options: { fill: bg, color: C.grayDark, fontFace: FONT, fontSize: 9 } },
    ];
  })];

  sl.addTable(rows, {
    x: 0.35, y: 1.28, w: 12.63,
    colW: [0.55, 3.2, 0.65, 8.23],
    border: { color: C.grayLight, pt: 0.5 },
    rowH: 0.44,
  });

  // Total bar
  sl.addShape('rect', {
    x: 0.35, y: 6.68, w: 12.63, h: 0.32,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  sl.addText('TOTAL  →  60 tests across 12 modules  |  100% pass rate  |  ~8 minutes total run time', {
    x: 0.55, y: 6.68, w: 12.3, h: 0.32,
    fontFace: FONT, fontSize: 10, bold: true, color: C.white, valign: 'middle',
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — End-to-End Purchase Journey Deep Dive
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'End-to-End Purchase Journey', 'Module 11 — 8 tests covering the complete buy flow (customer + admin)');

  const steps = [
    { num: '01', role: 'Customer', title: 'Browse Products',       detail: 'Visit Electronics category, verify product listing, click first item, confirm detail page loads with name and price.' },
    { num: '02', role: 'Customer', title: 'Add to Cart',           detail: 'Select product attributes (size, colour), set quantity = 2, click Add to Cart, verify notification bar confirms addition.' },
    { num: '03', role: 'Customer', title: 'Verify Cart Contents',  detail: 'Navigate to cart page, verify item row exists, confirm quantity input shows 2, check subtotal is visible.' },
    { num: '04', role: 'Customer', title: 'Complete Billing',      detail: 'Accept terms → auto-redirect to /onepagecheckout. Fill first name, last name, email, country, state, city, address, zip, phone. Click visible Continue button.' },
    { num: '05', role: 'Customer', title: 'Select Shipping',       detail: 'Shipping section expands. Click Continue on shipping address. Shipping methods appear — select first radio option, click Continue.' },
    { num: '06', role: 'Customer', title: 'Select Payment',        detail: 'Choose Check/Money Order payment method, continue. Payment info section appears, click Continue.' },
    { num: '07', role: 'Customer', title: 'Confirm & Place Order', detail: 'Order summary table visible. Click Confirm button. Page redirects to /checkout/completed. Order number captured and verified.' },
    { num: '08', role: 'Admin',    title: 'Admin Verifies Order',  detail: 'Admin logs in, searches order list. Opens latest order. Clicks Cancel Order → modal confirmation → submits. Verifies success alert and Cancelled status.' },
  ];

  const roleColors = { Customer: C.blue, Admin: C.purple };
  const roleBg     = { Customer: 'EFF6FF', Admin: C.purpleBg };

  steps.forEach((s, i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 1.28 + Math.floor(i / 2) * 1.52;
    const rc   = roleColors[s.role];
    const rb   = roleBg[s.role];
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.38, rectRadius: 0.1,
      fill: { color: rb }, line: { color: rc, pt: 1 },
    });
    sl.addShape('roundRect', {
      x: xOff + 0.1, y: yOff + 0.1, w: 0.45, h: 0.32, rectRadius: 0.06,
      fill: { color: rc }, line: { color: rc },
    });
    sl.addText(s.num, {
      x: xOff + 0.1, y: yOff + 0.1, w: 0.45, h: 0.32,
      fontFace: FONT, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle',
    });
    sl.addText(`[${s.role}]  ${s.title}`, {
      x: xOff + 0.64, y: yOff + 0.1, w: 5.2, h: 0.32,
      fontFace: FONT, fontSize: 10.5, bold: true, color: rc,
    });
    sl.addText(s.detail, {
      x: xOff + 0.15, y: yOff + 0.5, w: 5.7, h: 0.78,
      fontFace: FONT, fontSize: 9, color: C.grayDark,
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Two-Command Workflow
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Two-Command Workflow', 'Everything from a cold start to a shareable report — two commands');

  // Command 1
  sl.addShape('roundRect', {
    x: 0.35, y: 1.28, w: 5.9, h: 5.55, rectRadius: 0.14,
    fill: { color: 'F0FDF4' }, line: { color: C.green, pt: 2 },
  });
  sl.addText('COMMAND  1', {
    x: 0.55, y: 1.38, w: 5.5, h: 0.28,
    fontFace: FONT, fontSize: 8.5, bold: true, color: C.green, charSpacing: 2,
  });
  sl.addText('node setup-docker.mjs', {
    x: 0.45, y: 1.68, w: 5.7, h: 0.42,
    fontFace: 'Courier New', fontSize: 14, bold: true, color: C.greenDark,
  });
  sl.addShape('rect', {
    x: 0.55, y: 2.14, w: 5.4, h: 0.02,
    fill: { color: C.green }, line: { color: C.green },
  });
  const steps1 = [
    ['Step 1', 'Checks if Docker daemon is running'],
    ['Step 2', 'Launches Docker Desktop automatically if stopped'],
    ['Step 3', 'Polls until Docker daemon responds (up to 3 min)'],
    ['Step 4', 'Runs: docker compose up -d (PostgreSQL + nopCommerce)'],
    ['Step 5', 'Polls http://localhost:8080 every 10 seconds'],
    ['Step 6', 'Prints ✅ "Environment is ready" when app responds'],
  ];
  steps1.forEach(([label, text], i) => {
    sl.addText(`${label}:`, { x: 0.55, y: 2.25 + i * 0.68, w: 1.0, h: 0.28, fontFace: FONT, fontSize: 9, bold: true, color: C.green });
    sl.addText(text, { x: 1.58, y: 2.25 + i * 0.68, w: 4.5, h: 0.55, fontFace: FONT, fontSize: 9.5, color: C.grayDark });
  });

  // Arrow
  sl.addShape('rightArrow', {
    x: 6.32, y: 3.4, w: 0.68, h: 0.6,
    fill: { color: C.navy }, line: { color: C.navy },
  });

  // Command 2
  sl.addShape('roundRect', {
    x: 7.08, y: 1.28, w: 5.9, h: 5.55, rectRadius: 0.14,
    fill: { color: 'EFF6FF' }, line: { color: C.blue, pt: 2 },
  });
  sl.addText('COMMAND  2', {
    x: 7.25, y: 1.38, w: 5.5, h: 0.28,
    fontFace: FONT, fontSize: 8.5, bold: true, color: C.blue, charSpacing: 2,
  });
  sl.addText('node run-all-modules.mjs', {
    x: 7.15, y: 1.68, w: 5.7, h: 0.42,
    fontFace: 'Courier New', fontSize: 13, bold: true, color: C.blueDark,
  });
  sl.addShape('rect', {
    x: 7.25, y: 2.14, w: 5.4, h: 0.02,
    fill: { color: C.blue }, line: { color: C.blue },
  });
  const steps2 = [
    ['Step 1', 'Clears old report files from cypress/reports/'],
    ['Step 2', 'Launches Cypress with Chrome browser (headed)'],
    ['Step 3', 'Runs all 12 spec files in defined order'],
    ['Step 4', 'Prints live module-by-module pass/fail to console'],
    ['Step 5', 'Generates timestamped HTML report automatically'],
    ['Step 6', 'Prints final summary: 60/60 (100%) + report path'],
  ];
  steps2.forEach(([label, text], i) => {
    sl.addText(`${label}:`, { x: 7.25, y: 2.25 + i * 0.68, w: 1.0, h: 0.28, fontFace: FONT, fontSize: 9, bold: true, color: C.blue });
    sl.addText(text, { x: 8.28, y: 2.25 + i * 0.68, w: 4.5, h: 0.55, fontFace: FONT, fontSize: 9.5, color: C.grayDark });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — Key Challenges & Solutions
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Key Challenges & Solutions', 'What we discovered about nopCommerce 4.70.5 — and how we fixed it');

  const issues = [
    {
      num: '01', color: C.red,   bgColor: 'FFF1F2',
      title: 'Billing button permanently hidden',
      problem: '#save-billing-address-button has display:none in nopCommerce 4.70.5. Using invoke("show") triggers server error "Address can\'t be loaded".',
      fix: 'Always click #billing-buttons-container .button-1 (the visible Continue button) regardless of whether a new address form is shown.',
    },
    {
      num: '02', color: C.amber, bgColor: 'FFFBEB',
      title: 'Cancel order modal hidden button conflict',
      problem: 'Selector button[name="cancelorder"] matched both the trigger button AND the hidden Bootstrap modal "Yes" button. Clicking the hidden one fails with "element is not visible".',
      fix: 'Use .filter(":visible").first() on the trigger. Then explicitly wait for #cancelorder-action-confirmation to be visible and click #cancelorder-action-confirmation-submit-button.',
    },
    {
      num: '03', color: C.blue,  bgColor: 'EFF6FF',
      title: 'Confirm order items selector wrong',
      problem: '#checkout-step-confirm-order .cart.table-wrap tbody tr — the .table-wrap class does not exist in nopCommerce 4.70.5 one-page checkout. Timed out every run.',
      fix: 'Updated to #checkout-step-confirm-order table tbody tr — works with the actual HTML structure.',
    },
    {
      num: '04', color: C.purple, bgColor: C.purpleBg,
      title: 'Customer create — no success toast',
      problem: 'nopCommerce 4.70.5 does NOT show .alert-success after creating a customer. Waiting for the toast caused a timeout on every customer creation test.',
      fix: 'Check URL redirect to /Customer/Edit/ instead — if the URL changes, the create was successful.',
    },
    {
      num: '05', color: C.teal,  bgColor: 'F0FDFA',
      title: 'DataTables — hidden "no data" rows',
      problem: 'DataTables renders hidden placeholder rows even when data is present. Using .first() without filtering returned the hidden empty row instead of the first real data row.',
      fix: 'Always chain .filter(":visible").not(".dataTables_empty") before .first() on any DataTables grid row.',
    },
    {
      num: '06', color: C.green, bgColor: C.greenBg,
      title: 'Late-appearing spinner missed',
      problem: 'waitForSpinnerToDisappear used a single cy.get("body").then() snapshot. If .blockUI appeared 50ms after the snapshot, the check was missed — causing the next action to run on a loading page.',
      fix: 'Replaced with cy.waitUntil() polling every 250ms until both .blockUI and .dataTables_processing:visible are gone.',
    },
  ];

  issues.forEach((s, i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 1.28 + Math.floor(i / 2) * 2.05;
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.88, rectRadius: 0.1,
      fill: { color: s.bgColor }, line: { color: s.color, pt: 1 },
    });
    sl.addShape('roundRect', {
      x: xOff + 0.1, y: yOff + 0.08, w: 0.38, h: 0.3, rectRadius: 0.05,
      fill: { color: s.color }, line: { color: s.color },
    });
    sl.addText(s.num, {
      x: xOff + 0.1, y: yOff + 0.08, w: 0.38, h: 0.3,
      fontFace: FONT, fontSize: 8, bold: true, color: C.white, align: 'center', valign: 'middle',
    });
    sl.addText(s.title, {
      x: xOff + 0.56, y: yOff + 0.08, w: 5.3, h: 0.32,
      fontFace: FONT, fontSize: 10.5, bold: true, color: s.color,
    });
    sl.addText('Problem:', { x: xOff + 0.14, y: yOff + 0.46, w: 0.72, h: 0.2, fontFace: FONT, fontSize: 8.5, bold: true, color: C.red });
    sl.addText(s.problem, { x: xOff + 0.86, y: yOff + 0.44, w: 5.0, h: 0.46, fontFace: FONT, fontSize: 8.5, color: C.grayDark });
    sl.addText('Fix:', { x: xOff + 0.14, y: yOff + 0.98, w: 0.5, h: 0.2, fontFace: FONT, fontSize: 8.5, bold: true, color: C.green });
    sl.addText(s.fix, { x: xOff + 0.68, y: yOff + 0.96, w: 5.2, h: 0.78, fontFace: FONT, fontSize: 8.5, color: C.grayDark });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — Branching & Versioning
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Branching & Versioning Strategy', 'How code is developed, released, and tagged on GitHub');

  // Branch boxes
  [['main', C.green, C.greenBg, 'Stable, released code only.\nTagged with a version number on every release.\nAnyone can clone a specific version with: git checkout v1.0.0'],
   ['develop', C.blue, 'EFF6FF', 'Active development branch.\nAll new test code, fixes, and features go here first.\nMerged into main when fully stable and reviewed.']
  ].forEach(([name, color, bg, desc], i) => {
    const xOff = i === 0 ? 0.35 : 7.05;
    sl.addShape('roundRect', {
      x: xOff, y: 1.28, w: 5.9, h: 1.78, rectRadius: 0.12,
      fill: { color: bg }, line: { color: color, pt: 2 },
    });
    sl.addText(name, {
      x: xOff + 0.2, y: 1.38, w: 5.5, h: 0.42,
      fontFace: 'Courier New', fontSize: 20, bold: true, color: color,
    });
    sl.addText(desc, {
      x: xOff + 0.2, y: 1.84, w: 5.6, h: 1.1,
      fontFace: FONT, fontSize: 10, color: C.grayDark,
    });
  });

  // Merge arrow
  sl.addShape('rightArrow', {
    x: 6.28, y: 1.82, w: 0.7, h: 0.55,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  sl.addText('merge when\nstable', {
    x: 6.15, y: 2.38, w: 0.95, h: 0.42,
    fontFace: FONT, fontSize: 7.5, color: C.gray, align: 'center',
  });

  // Version table
  const vtRows = [
    [{ text: 'Version', options: { bold: true, color: C.white, fill: C.navy } },
     { text: 'Type', options: { bold: true, color: C.white, fill: C.navy } },
     { text: 'Date', options: { bold: true, color: C.white, fill: C.navy } },
     { text: 'Summary', options: { bold: true, color: C.white, fill: C.navy } }],
    ['v1.0.0', 'Initial Release', '2026-05-30', '60/60 tests, 12 modules, two-command workflow, HTML report, Docker setup'],
    ['v1.0.1', 'Patch', '2026-05-30', 'waitForSpinnerToDisappear polling, timestamped report, README, CHANGELOG, .env.example'],
  ];
  sl.addTable(vtRows.map((row, i) => {
    if (i === 0) return row;
    const bg = i % 2 === 0 ? C.offWhite : C.white;
    return row.map(cell => ({ text: cell, options: { fill: bg, fontFace: FONT, fontSize: 10, color: C.grayDark } }));
  }), {
    x: 0.35, y: 3.22, w: 12.63, colW: [1.3, 1.5, 1.6, 8.23],
    border: { color: C.grayLight, pt: 0.5 }, rowH: 0.5,
  });

  // Version number guide
  sl.addText('Version Numbering:  MAJOR . MINOR . PATCH', {
    x: 0.35, y: 4.38, w: 6.5, h: 0.3,
    fontFace: FONT, fontSize: 11, bold: true, color: C.navy,
  });
  [['MAJOR', C.red,   'Breaking change or full rewrite'],
   ['MINOR', C.blue,  'New test module or feature added'],
   ['PATCH', C.green, 'Bug fix, selector fix, timing improvement']].forEach(([v, c, d], i) => {
    sl.addShape('roundRect', {
      x: 0.35 + i * 4.1, y: 4.78, w: 1.0, h: 0.3, rectRadius: 0.06,
      fill: { color: c }, line: { color: c },
    });
    sl.addText(v, { x: 0.35 + i * 4.1, y: 4.78, w: 1.0, h: 0.3, fontFace: FONT, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle' });
    sl.addText(d, { x: 1.42 + i * 4.1, y: 4.78, w: 2.8, h: 0.3, fontFace: FONT, fontSize: 10, color: C.grayDark });
  });

  // Clone command
  sl.addShape('roundRect', {
    x: 0.35, y: 5.28, w: 12.63, h: 1.45, rectRadius: 0.1,
    fill: { color: '0d1117' }, line: { color: C.grayDark, pt: 1 },
  });
  sl.addText(
    '# Clone latest stable release\ngit clone https://github.com/acsanjeevi/nopcommerce-cypress-automation.git\n\n# OR pull a specific version\ngit checkout v1.0.0',
    {
      x: 0.55, y: 5.33, w: 12.2, h: 1.32,
      fontFace: 'Courier New', fontSize: 10, color: C.green,
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — Future Enhancements
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Future Enhancements', 'Where we take this automation suite next — as recommended by the QA team');

  const items = [
    { icon: '🔄', title: 'CI/CD Pipeline (GitHub Actions)',   color: C.blue,   body: 'Trigger the full 60-test suite automatically on every push to develop. Block merges to main if tests fail. Publish the HTML report as a GitHub Actions artefact.' },
    { icon: '🌐', title: 'Cross-Browser Testing',             color: C.teal,   body: 'Currently Chrome-only. Add Firefox and Edge using Cypress\'s multi-browser support. Ensure the checkout flow and admin panel work identically across all browsers.' },
    { icon: '📡', title: 'API Test Layer',                    color: C.purple, body: 'Add cy.request() tests for the nopCommerce REST API. Validate response schemas, status codes, and CRUD operations at the API level — faster and independent of the UI.' },
    { icon: '⚡', title: 'Parallel Execution',                color: C.amber,  body: 'Split the 12 modules across 3-4 parallel Cypress workers using cypress-parallel or Cypress Cloud. Target: reduce total run time from 8 minutes to under 3 minutes.' },
    { icon: '📱', title: 'Mobile Viewport Testing',           color: C.green,  body: 'Run the storefront tests at 375×812 (iPhone) and 768×1024 (iPad) viewports using Cypress viewport presets. Catch responsive-layout issues automatically.' },
    { icon: '📈', title: 'Test Trend Dashboard',              color: C.navy,   body: 'Store pass/fail history over time. Build a simple Node.js dashboard that reads historical JSON reports and plots pass-rate trend charts for team review each sprint.' },
  ];

  items.forEach((s, i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 1.28 + Math.floor(i / 2) * 1.98;
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.82, rectRadius: 0.1,
      fill: { color: C.offWhite }, line: { color: s.color, pt: 1.5 },
    });
    sl.addText(`${s.icon}  ${s.title}`, {
      x: xOff + 0.2, y: yOff + 0.1, w: 5.6, h: 0.38,
      fontFace: FONT, fontSize: 12, bold: true, color: s.color,
    });
    sl.addShape('rect', {
      x: xOff + 0.2, y: yOff + 0.5, w: 5.6, h: 0.02,
      fill: { color: C.grayLight }, line: { color: C.grayLight },
    });
    sl.addText(s.body, {
      x: xOff + 0.2, y: yOff + 0.58, w: 5.65, h: 1.12,
      fontFace: FONT, fontSize: 9.5, color: C.grayDark,
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 16 — Summary & Key Metrics
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.white };
  addHeader(sl, 'Summary & Key Metrics', 'Everything we built — at a glance');

  // Big KPI row
  [
    ['60',     'Automated Tests',    C.greenBg,  C.greenDark],
    ['12',     'Test Modules',       'EFF6FF',   C.blueDark],
    ['100%',   'Pass Rate',          'DCFCE7',   C.greenDark],
    ['~8 min', 'Total Run Time',     C.purpleBg, '6d28d9'],
    ['2',      'Commands to Run',    'FEF9C3',   '92400e'],
    ['v1.0.1', 'Current Version',    'F1F5F9',   C.navy],
  ].forEach(([val, lbl, bg, fg], i) => {
    kpi(sl, 0.35 + i * 2.12, 1.3, val, lbl, bg, fg);
  });

  // Key points
  const points = [
    ['What We Built',      '60 automated tests across 12 modules covering the full e-commerce workflow — from data setup through checkout to admin order management and cleanup.'],
    ['Framework Choice',   'Cypress 15 + TypeScript was chosen for its real-browser testing, rich selector engine, built-in retry logic, and excellent async handling — ideal for a dynamic web app like nopCommerce.'],
    ['Reliability Strategy', 'Retries at runMode=1 (2 attempts per test) + cy.waitUntil spinner polling + explicit waits at critical async points. Result: consistent 100% pass rate across repeated runs.'],
    ['Two-Command Simplicity', '"node setup-docker.mjs" then "node run-all-modules.mjs" — anyone on the team can run the full suite and get a shareable HTML report in under 10 minutes, with zero manual setup.'],
    ['Version Control',    'Private GitHub repo with main (stable) and develop branches. Every release is tagged (v1.0.0, v1.0.1) with a description. Anyone can clone a specific version by tag.'],
  ];

  points.forEach(([title, body], i) => {
    const xOff = i % 2 === 0 ? 0.35 : 6.85;
    const yOff = 2.7 + Math.floor(i / 2) * 1.5 + (i === 4 ? 0 : 0);
    if (i === 4) {
      sl.addShape('roundRect', {
        x: 0.35, y: 5.58, w: 12.63, h: 1.1, rectRadius: 0.1,
        fill: { color: C.offWhite }, line: { color: C.grayLight, pt: 1 },
      });
      sl.addText(`${title}:`, { x: 0.55, y: 5.65, w: 1.9, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
      sl.addText(body, { x: 2.48, y: 5.65, w: 10.25, h: 0.88, fontFace: FONT, fontSize: 9.5, color: C.grayDark });
      return;
    }
    sl.addShape('roundRect', {
      x: xOff, y: yOff, w: 6.0, h: 1.32, rectRadius: 0.1,
      fill: { color: C.offWhite }, line: { color: C.grayLight, pt: 1 },
    });
    sl.addText(`${title}:`, { x: xOff + 0.2, y: yOff + 0.1, w: 5.6, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
    sl.addText(body, { x: xOff + 0.2, y: yOff + 0.42, w: 5.65, h: 0.78, fontFace: FONT, fontSize: 9.5, color: C.grayDark });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 17 — Thank You
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.background = { color: C.navy };

  sl.addShape('rect', {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.blue }, line: { color: C.blue },
  });

  sl.addText('Thank You', {
    x: 0.6, y: 1.2, w: 12, h: 1.1,
    fontFace: FONT, fontSize: 52, bold: true, color: C.white,
  });
  sl.addText('Questions & Discussion', {
    x: 0.6, y: 2.3, w: 12, h: 0.55,
    fontFace: FONT, fontSize: 22, color: C.blue,
  });
  sl.addShape('rect', {
    x: 0.6, y: 2.95, w: 4.5, h: 0.04,
    fill: { color: C.blue }, line: { color: C.blue },
  });

  [
    ['GitHub Repo',  'https://github.com/acsanjeevi/nopcommerce-cypress-automation', '(private — request access via email)'],
    ['Email',        'acsanjeevi@gmail.com', ''],
    ['Run Command 1', 'node setup-docker.mjs', '→ starts Docker + app'],
    ['Run Command 2', 'node run-all-modules.mjs', '→ 60 tests + HTML report'],
    ['Current Version', 'v1.0.1  |  60/60 tests  |  100% pass rate', ''],
  ].forEach(([label, value, note], i) => {
    sl.addText(`${label}:`, { x: 0.6, y: 3.3 + i * 0.62, w: 2.2, h: 0.4, fontFace: FONT, fontSize: 11, bold: true, color: C.blue });
    sl.addText(value, { x: 2.85, y: 3.3 + i * 0.62, w: 7.5, h: 0.4, fontFace: FONT, fontSize: 11, color: C.white });
    if (note) sl.addText(note, { x: 10.4, y: 3.3 + i * 0.62, w: 2.5, h: 0.4, fontFace: FONT, fontSize: 9, color: '718096', italic: true });
  });

  sl.addText('Prepared by: Sanjeevi — QA Automation Engineer  |  May 2026  |  Cypress 15 + TypeScript + Docker + nopCommerce 4.70.5', {
    x: 0.6, y: 7.0, w: 12.4, h: 0.3,
    fontFace: FONT, fontSize: 8.5, color: '4a5568',
  });
}

// ── Save ──────────────────────────────────────────────────────────────────────
const OUT = 'nopCommerce-Automation-Presentation.pptx';
await prs.writeFile({ fileName: OUT });
console.log(`\n✅  Presentation saved → ${OUT}`);
console.log(`   ${prs.slides.length} slides  |  16:9 widescreen  |  Calibri font\n`);

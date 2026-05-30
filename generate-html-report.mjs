import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const JSONS_DIR   = 'cypress/reports/.jsons';
const REPORTS_DIR = 'cypress/reports';

const ts   = new Date();
const pad  = (n) => String(n).padStart(2, '0');
const stamp = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
const OUTPUT_FILE = path.join(REPORTS_DIR, `nopCommerce-Test-Report-${stamp}.html`);

if (!existsSync(JSONS_DIR)) {
  console.error('No report JSON files found. Run tests first.');
  process.exit(1);
}

const files = readdirSync(JSONS_DIR).filter((f) => f.endsWith('.json'));
const modules = [];
let grandTotal = 0, grandPass = 0, grandFail = 0, grandPend = 0, grandDuration = 0;

const moduleLabels = {
  'nopcommerce-setup':          'Application Setup',
  'categories-creation':        'Category Management - Data Setup',
  'products-creation':          'Product Management - Data Setup',
  'users-creation':             'Customer Management - Data Setup',
  'cart-creation':              'Storefront - Cart and Checkout',
  'categories-overview':        'Category Admin',
  'products-overview':          'Product Admin',
  'users-overview':             'Customer Admin',
  'orders-overview':            'Order Admin',
  'cart-overview':              'Storefront Validation',
  'order-journey':              'End-to-End Purchase Journey',
  'wipeout-allcreatedrecords':  'Data Cleanup',
};

const specOrder = Object.keys(moduleLabels);

const sortedFiles = [...files].sort((a, b) => {
  const ka = a.replace('-report.json', '');
  const kb = b.replace('-report.json', '');
  return (specOrder.indexOf(ka) ?? 99) - (specOrder.indexOf(kb) ?? 99);
});

for (const file of sortedFiles) {
  const key  = file.replace('-report.json', '');
  const data = JSON.parse(readFileSync(path.join(JSONS_DIR, file), 'utf8'));
  const s    = data.stats || {};

  const tests = [];

  const extractTests = (suites) => {
    if (!suites) return;
    for (const suite of suites) {
      for (const t of suite.tests || []) {
        tests.push({
          title:    t.fullTitle || t.title || 'Untitled',
          state:    t.pass ? 'passed' : (t.pending ? 'pending' : 'failed'),
          duration: t.duration ?? 0,
          error:    (!t.pass && !t.pending && t.err) ? (t.err.message ?? String(t.err)) : null,
        });
      }
      extractTests(suite.suites);
    }
  };
  for (const r of data.results || []) extractTests(r.suites);

  const modTotal = s.tests    ?? 0;
  const modPass  = s.passes   ?? 0;
  const modFail  = s.failures ?? 0;
  const modPend  = s.pending  ?? 0;

  grandTotal    += modTotal;
  grandPass     += modPass;
  grandFail     += modFail;
  grandPend     += modPend;
  grandDuration += s.duration ?? 0;

  modules.push({
    key,
    label:    moduleLabels[key] || key,
    total:    modTotal,
    passed:   modPass,
    failed:   modFail,
    pending:  modPend,
    duration: s.duration ?? 0,
    tests,
  });
}

const passRate = grandTotal > 0 ? ((grandPass / grandTotal) * 100).toFixed(1) : '0';
const now      = ts.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });

function fmtDuration(ms) {
  if (ms < 1000)  return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
const totalDuration = fmtDuration(grandDuration);

const testRows = (tests) => tests.map((t, i) => {
  const icon  = t.state === 'passed' ? '✅' : (t.state === 'pending' ? '⏭' : '❌');
  const dur   = t.duration >= 1000 ? `${(t.duration / 1000).toFixed(1)}s` : `${t.duration}ms`;
  const title = t.title.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const errHtml = t.error
    ? `<div class="err-msg">${t.error.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))}</div>`
    : '';
  return `
    <tr class="test-row ${t.state}">
      <td class="tc-num">${String(i + 1).padStart(2, '0')}</td>
      <td class="tc-icon">${icon}</td>
      <td class="tc-title">${title}${errHtml}</td>
      <td class="tc-dur">${dur}</td>
    </tr>`;
}).join('');

const moduleCards = modules.map((m) => {
  const pct    = m.total > 0 ? ((m.passed / m.total) * 100).toFixed(0) : 0;
  const status = m.failed > 0 ? 'mod-fail' : (m.total === 0 ? 'mod-skip' : 'mod-pass');
  const dur    = m.duration >= 60000
    ? `${(m.duration / 60000).toFixed(1)}m`
    : m.duration >= 1000
      ? `${(m.duration / 1000).toFixed(1)}s`
      : `${m.duration}ms`;

  return `
  <div class="module-card ${status}">
    <div class="mod-header" onclick="toggle('${m.key}')">
      <div class="mod-title">
        <span class="mod-icon">${m.failed > 0 ? '❌' : '✅'}</span>
        <span>${m.label}</span>
      </div>
      <div class="mod-meta">
        <span class="badge pass-badge">${m.passed} passed</span>
        ${m.failed > 0 ? `<span class="badge fail-badge">${m.failed} failed</span>` : ''}
        <span class="badge dur-badge">${dur}</span>
        <span class="chevron" id="chev-${m.key}">▾</span>
      </div>
    </div>
    <div class="mod-body" id="body-${m.key}">
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%"></div>
        <span class="progress-label">${pct}% passed (${m.passed}/${m.total})</span>
      </div>
      <table class="test-table">
        <thead>
          <tr><th>#</th><th>Status</th><th>Test Case</th><th>Duration</th></tr>
        </thead>
        <tbody>${testRows(m.tests)}</tbody>
      </table>
    </div>
  </div>`;
}).join('');

const summaryRows = modules.map((m) => {
  const pct = m.total > 0 ? `${((m.passed / m.total) * 100).toFixed(0)}%` : '—';
  return `<tr>
    <td>${m.label}</td>
    <td class="center">${m.total}</td>
    <td class="center pass-text">${m.passed}</td>
    <td class="center fail-text">${m.failed}</td>
    <td class="center pend-text">${m.pending}</td>
    <td class="center">${pct}</td>
  </tr>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>nopCommerce — Test Execution Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;color:#1a1a2e;font-size:14px}
.header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;padding:32px 40px;display:flex;justify-content:space-between;align-items:center}
.header h1{font-size:24px;font-weight:700;letter-spacing:.5px}
.header .sub{font-size:12px;color:#a0aec0;margin-top:4px}
.kpi-bar{display:flex;gap:16px;padding:20px 40px;background:#fff;border-bottom:1px solid #e2e8f0;flex-wrap:wrap}
.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 22px;min-width:130px;text-align:center}
.kpi .val{font-size:28px;font-weight:800}
.kpi .lbl{font-size:11px;color:#718096;margin-top:3px;text-transform:uppercase;letter-spacing:.5px}
.kpi.pass .val{color:#22c55e}
.kpi.fail .val{color:#ef4444}
.kpi.pend .val{color:#f59e0b}
.kpi.rate .val{color:#3b82f6}
.kpi.time .val{color:#8b5cf6}
.content{padding:24px 40px;max-width:1300px;margin:0 auto}
.section-title{font-size:16px;font-weight:700;margin-bottom:12px;color:#2d3748;padding-left:4px;border-left:4px solid #3b82f6;padding-left:10px}
.summary-table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:28px}
.summary-table th{background:#1a1a2e;color:#fff;padding:10px 14px;font-size:12px;text-align:left;text-transform:uppercase;letter-spacing:.5px}
.summary-table td{padding:10px 14px;border-bottom:1px solid #f0f2f5;font-size:13px}
.summary-table tr:last-child td{border-bottom:none}
.summary-table tr:hover td{background:#f8fafc}
.center{text-align:center}
.pass-text{color:#22c55e;font-weight:700}
.fail-text{color:#ef4444;font-weight:700}
.pend-text{color:#f59e0b;font-weight:700}
.module-card{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:14px;overflow:hidden}
.module-card.mod-pass{border-left:5px solid #22c55e}
.module-card.mod-fail{border-left:5px solid #ef4444}
.module-card.mod-skip{border-left:5px solid #cbd5e0}
.mod-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;cursor:pointer;user-select:none;transition:background .15s}
.mod-header:hover{background:#f8fafc}
.mod-title{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px}
.mod-icon{font-size:16px}
.mod-meta{display:flex;align-items:center;gap:8px}
.badge{font-size:11px;padding:3px 9px;border-radius:12px;font-weight:600}
.pass-badge{background:#dcfce7;color:#166534}
.fail-badge{background:#fee2e2;color:#991b1b}
.dur-badge{background:#f0f9ff;color:#075985}
.chevron{font-size:16px;color:#718096;transition:transform .2s}
.mod-body{padding:16px 18px;border-top:1px solid #f0f2f5;display:none}
.mod-body.open{display:block}
.progress-bar-wrap{background:#f0f2f5;border-radius:6px;height:22px;position:relative;margin-bottom:14px;overflow:hidden}
.progress-bar-fill{background:linear-gradient(90deg,#22c55e,#16a34a);height:100%;border-radius:6px;transition:width .4s}
.progress-label{position:absolute;right:10px;top:3px;font-size:11px;font-weight:600;color:#374151}
.test-table{width:100%;border-collapse:collapse;font-size:13px}
.test-table thead th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#4a5568;border-bottom:2px solid #e2e8f0}
.test-table .tc-num{width:36px;text-align:center;color:#a0aec0;font-weight:600}
.test-table .tc-icon{width:40px;text-align:center;font-size:15px}
.test-table .tc-dur{width:80px;text-align:right;color:#718096;font-size:12px}
.test-row td{padding:8px 12px;border-bottom:1px solid #f7f7f7}
.test-row:last-child td{border-bottom:none}
.test-row.passed:hover td{background:#f0fdf4}
.test-row.failed:hover td{background:#fef2f2}
.test-row.pending{opacity:.65}
.err-msg{font-size:11px;color:#dc2626;background:#fef2f2;border-radius:4px;padding:5px 8px;margin-top:5px;font-family:monospace;white-space:pre-wrap;word-break:break-all;max-height:80px;overflow:auto}
.footer{text-align:center;padding:20px;color:#a0aec0;font-size:12px;border-top:1px solid #e2e8f0;background:#fff;margin-top:20px}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="h1">nopCommerce E-Commerce — Test Execution Report</div>
    <div class="sub">Generated: ${now}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:32px;font-weight:900;color:${grandFail > 0 ? '#ef4444' : '#22c55e'}">${passRate}%</div>
    <div style="font-size:12px;color:#a0aec0">Overall Pass Rate</div>
  </div>
</div>

<div class="kpi-bar">
  <div class="kpi"><div class="val">${grandTotal}</div><div class="lbl">Total Tests</div></div>
  <div class="kpi pass"><div class="val">${grandPass}</div><div class="lbl">Passed</div></div>
  <div class="kpi fail"><div class="val">${grandFail}</div><div class="lbl">Failed</div></div>
  <div class="kpi pend"><div class="val">${grandPend}</div><div class="lbl">Pending</div></div>
  <div class="kpi rate"><div class="val">${modules.length}</div><div class="lbl">Modules</div></div>
  <div class="kpi time"><div class="val">${totalDuration}</div><div class="lbl">Total Duration</div></div>
</div>

<div class="content">
  <div class="section-title">Module Summary</div>
  <table class="summary-table">
    <thead>
      <tr><th>Module</th><th class="center">Total</th><th class="center">Passed</th><th class="center">Failed</th><th class="center">Pending</th><th class="center">Pass Rate</th></tr>
    </thead>
    <tbody>${summaryRows}</tbody>
  </table>

  <div class="section-title">Test Results by Module</div>
  ${moduleCards}
</div>

<div class="footer">nopCommerce Automation Test Suite &nbsp;|&nbsp; Cypress 15 + TypeScript &nbsp;|&nbsp; Executed: ${now} &nbsp;|&nbsp; Duration: ${totalDuration}</div>

<script>
function toggle(key){
  const body=document.getElementById('body-'+key);
  const chev=document.getElementById('chev-'+key);
  if(body.classList.contains('open')){body.classList.remove('open');chev.style.transform='rotate(0deg)';}
  else{body.classList.add('open');chev.style.transform='rotate(180deg)';}
}
// Auto-expand failed modules
document.querySelectorAll('.module-card.mod-fail').forEach(card=>{
  const key=card.querySelector('.mod-body').id.replace('body-','');
  toggle(key);
});
</script>
</body>
</html>`;

writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log(`\nReport generated → ${OUTPUT_FILE}`);
console.log(`Tests: ${grandTotal} | Passed: ${grandPass} | Failed: ${grandFail} | Pass Rate: ${passRate}%\n`);

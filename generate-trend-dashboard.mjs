import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const HISTORY_DIR  = 'test-history';
const OUTPUT_FILE  = path.join(HISTORY_DIR, 'trend-dashboard.html');

if (!existsSync(HISTORY_DIR)) {
  console.error('No test-history directory found. Run tests first.');
  process.exit(1);
}

const files = readdirSync(HISTORY_DIR)
  .filter((f) => f.startsWith('run-') && f.endsWith('.json'))
  .sort();

if (files.length === 0) {
  console.error('No history snapshots found. Run tests first.');
  process.exit(1);
}

const runs = files.map((f) => JSON.parse(readFileSync(path.join(HISTORY_DIR, f), 'utf8')));

const labels      = runs.map((r) => `${r.date} ${r.time}`);
const passRates   = runs.map((r) => r.totals.passRate);
const totalTests  = runs.map((r) => r.totals.tests);
const totalPassed = runs.map((r) => r.totals.passed);
const totalFailed = runs.map((r) => r.totals.failed);
const durations   = runs.map((r) => parseFloat((r.totals.duration / 1000).toFixed(1)));

const latest = runs[runs.length - 1];
const oldest = runs[0];

function fmtDuration(ms) {
  if (ms < 1000)  return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

const allModuleKeys = new Map();
for (const run of runs) {
  for (const mod of run.modules) {
    if (!allModuleKeys.has(mod.key)) allModuleKeys.set(mod.key, mod.name);
  }
}

const moduleColors = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#d946ef', '#0ea5e9', '#a855f7',
];

const moduleDatasets = [];
let colorIdx = 0;
for (const [key, name] of allModuleKeys) {
  const color = moduleColors[colorIdx++ % moduleColors.length];
  const data = runs.map((r) => {
    const mod = r.modules.find((m) => m.key === key);
    if (!mod || mod.tests === 0) return null;
    return parseFloat(((mod.passed / mod.tests) * 100).toFixed(1));
  });
  moduleDatasets.push({ label: name, data, borderColor: color, backgroundColor: color + '20', tension: 0.3, spanGaps: true, pointRadius: 3 });
}

const latestModuleRows = latest.modules.map((m) => {
  const pct = m.tests > 0 ? ((m.passed / m.tests) * 100).toFixed(0) : '—';
  const statusClass = m.failed > 0 ? 'fail-text' : 'pass-text';
  return `<tr>
    <td>${m.name}</td>
    <td class="center">${m.tests}</td>
    <td class="center pass-text">${m.passed}</td>
    <td class="center fail-text">${m.failed}</td>
    <td class="center ${statusClass}">${pct}%</td>
    <td class="center">${fmtDuration(m.duration)}</td>
  </tr>`;
}).join('');

const runHistoryRows = [...runs].reverse().map((r, i) => {
  const icon = r.totals.failed > 0 ? '❌' : '✅';
  return `<tr>
    <td>${icon} ${r.date} ${r.time}</td>
    <td class="center">${r.browser}</td>
    <td class="center">${r.totals.tests}</td>
    <td class="center pass-text">${r.totals.passed}</td>
    <td class="center fail-text">${r.totals.failed}</td>
    <td class="center" style="font-weight:700;color:${r.totals.passRate === 100 ? '#22c55e' : '#ef4444'}">${r.totals.passRate}%</td>
    <td class="center">${fmtDuration(r.totals.duration)}</td>
  </tr>`;
}).join('');

const now = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });

const avgPassRate = runs.length > 0
  ? (passRates.reduce((a, b) => a + b, 0) / passRates.length).toFixed(1)
  : '0';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>nopCommerce — Test Trend Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;color:#1a1a2e;font-size:14px}
.header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;padding:32px 40px;display:flex;justify-content:space-between;align-items:center}
.header h1{font-size:24px;font-weight:700;letter-spacing:.5px}
.header .sub{font-size:12px;color:#a0aec0;margin-top:4px}
.kpi-bar{display:flex;gap:16px;padding:20px 40px;background:#fff;border-bottom:1px solid #e2e8f0;flex-wrap:wrap}
.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 22px;min-width:140px;text-align:center}
.kpi .val{font-size:28px;font-weight:800}
.kpi .lbl{font-size:11px;color:#718096;margin-top:3px;text-transform:uppercase;letter-spacing:.5px}
.kpi.pass .val{color:#22c55e}
.kpi.fail .val{color:#ef4444}
.kpi.rate .val{color:#3b82f6}
.kpi.time .val{color:#8b5cf6}
.kpi.runs .val{color:#06b6d4}
.kpi.avg .val{color:#f59e0b}
.content{padding:24px 40px;max-width:1400px;margin:0 auto}
.section-title{font-size:16px;font-weight:700;margin:24px 0 12px;color:#2d3748;border-left:4px solid #3b82f6;padding-left:10px}
.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.chart-card{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:20px}
.chart-card h3{font-size:14px;font-weight:600;margin-bottom:12px;color:#2d3748}
.chart-card.full{grid-column:1/-1}
.chart-wrap{position:relative;height:280px}
.chart-wrap.tall{height:340px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:24px}
th{background:#1a1a2e;color:#fff;padding:10px 14px;font-size:12px;text-align:left;text-transform:uppercase;letter-spacing:.5px}
td{padding:10px 14px;border-bottom:1px solid #f0f2f5;font-size:13px}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f8fafc}
.center{text-align:center}
.pass-text{color:#22c55e;font-weight:700}
.fail-text{color:#ef4444;font-weight:700}
.footer{text-align:center;padding:20px;color:#a0aec0;font-size:12px;border-top:1px solid #e2e8f0;background:#fff;margin-top:20px}
@media(max-width:900px){.chart-grid{grid-template-columns:1fr} .kpi-bar{justify-content:center}}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>nopCommerce — Test Trend Dashboard</h1>
    <div class="sub">Historical pass/fail trends across all test runs &nbsp;|&nbsp; Generated: ${now}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:32px;font-weight:900;color:${latest.totals.passRate === 100 ? '#22c55e' : '#ef4444'}">${latest.totals.passRate}%</div>
    <div style="font-size:12px;color:#a0aec0">Latest Pass Rate</div>
  </div>
</div>

<div class="kpi-bar">
  <div class="kpi runs"><div class="val">${runs.length}</div><div class="lbl">Total Runs</div></div>
  <div class="kpi rate"><div class="val">${latest.totals.tests}</div><div class="lbl">Latest Tests</div></div>
  <div class="kpi pass"><div class="val">${latest.totals.passed}</div><div class="lbl">Latest Passed</div></div>
  <div class="kpi fail"><div class="val">${latest.totals.failed}</div><div class="lbl">Latest Failed</div></div>
  <div class="kpi avg"><div class="val">${avgPassRate}%</div><div class="lbl">Avg Pass Rate</div></div>
  <div class="kpi time"><div class="val">${fmtDuration(latest.totals.duration)}</div><div class="lbl">Latest Duration</div></div>
</div>

<div class="content">

  <div class="section-title">Trend Charts</div>
  <div class="chart-grid">
    <div class="chart-card">
      <h3>Pass Rate Over Time (%)</h3>
      <div class="chart-wrap"><canvas id="passRateChart"></canvas></div>
    </div>
    <div class="chart-card">
      <h3>Test Count Over Time</h3>
      <div class="chart-wrap"><canvas id="testCountChart"></canvas></div>
    </div>
    <div class="chart-card">
      <h3>Pass / Fail Breakdown</h3>
      <div class="chart-wrap"><canvas id="passFailChart"></canvas></div>
    </div>
    <div class="chart-card">
      <h3>Run Duration (seconds)</h3>
      <div class="chart-wrap"><canvas id="durationChart"></canvas></div>
    </div>
    <div class="chart-card full">
      <h3>Module Pass Rate Over Time (%)</h3>
      <div class="chart-wrap tall"><canvas id="moduleChart"></canvas></div>
    </div>
  </div>

  <div class="section-title">Latest Run — Module Breakdown</div>
  <table>
    <thead>
      <tr><th>Module</th><th class="center">Tests</th><th class="center">Passed</th><th class="center">Failed</th><th class="center">Pass Rate</th><th class="center">Duration</th></tr>
    </thead>
    <tbody>${latestModuleRows}</tbody>
  </table>

  <div class="section-title">Run History</div>
  <table>
    <thead>
      <tr><th>Run</th><th class="center">Browser</th><th class="center">Tests</th><th class="center">Passed</th><th class="center">Failed</th><th class="center">Pass Rate</th><th class="center">Duration</th></tr>
    </thead>
    <tbody>${runHistoryRows}</tbody>
  </table>

</div>

<div class="footer">nopCommerce Test Trend Dashboard &nbsp;|&nbsp; ${runs.length} runs tracked &nbsp;|&nbsp; First run: ${oldest.date} &nbsp;|&nbsp; Latest run: ${latest.date}</div>

<script>
const labels = ${JSON.stringify(labels)};
const cfgBase = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 45, font: { size: 10 } } }, y: { beginAtZero: true } } };

new Chart(document.getElementById('passRateChart'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Pass Rate %',
      data: ${JSON.stringify(passRates)},
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  },
  options: { ...cfgBase, scales: { ...cfgBase.scales, y: { beginAtZero: false, min: Math.max(0, Math.min(...${JSON.stringify(passRates)}) - 5), max: 100, ticks: { callback: v => v + '%' } } } }
});

new Chart(document.getElementById('testCountChart'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Total Tests',
      data: ${JSON.stringify(totalTests)},
      backgroundColor: 'rgba(99,102,241,0.6)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: cfgBase
});

new Chart(document.getElementById('passFailChart'), {
  type: 'bar',
  data: {
    labels,
    datasets: [
      { label: 'Passed', data: ${JSON.stringify(totalPassed)}, backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4 },
      { label: 'Failed', data: ${JSON.stringify(totalFailed)}, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
    ]
  },
  options: { ...cfgBase, plugins: { legend: { display: true, position: 'top' } }, scales: { ...cfgBase.scales, x: { ...cfgBase.scales.x, stacked: true }, y: { ...cfgBase.scales.y, stacked: true } } }
});

new Chart(document.getElementById('durationChart'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Duration (s)',
      data: ${JSON.stringify(durations)},
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#8b5cf6',
    }]
  },
  options: { ...cfgBase, scales: { ...cfgBase.scales, y: { beginAtZero: true, ticks: { callback: v => v + 's' } } } }
});

new Chart(document.getElementById('moduleChart'), {
  type: 'line',
  data: {
    labels,
    datasets: ${JSON.stringify(moduleDatasets)}
  },
  options: {
    ...cfgBase,
    plugins: { legend: { display: true, position: 'right', labels: { font: { size: 10 }, boxWidth: 12 } } },
    scales: { ...cfgBase.scales, y: { beginAtZero: false, min: 0, max: 100, ticks: { callback: v => v + '%' } } }
  }
});
<\/script>
</body>
</html>`;

writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log(`Trend dashboard → ${OUTPUT_FILE}`);
console.log(`Tracking ${runs.length} run(s) from ${oldest.date} to ${latest.date}`);

import nodemailer from 'nodemailer';
import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';

const REPORTS_DIR = 'cypress/reports';
const HISTORY_DIR = 'test-history';
const JSONS_DIR   = 'cypress/reports/.jsons';

const TO_EMAIL      = process.env.REPORT_EMAIL || 'acsanjeevi@gmail.com';
const SMTP_HOST     = process.env.SMTP_HOST    || 'smtp.gmail.com';
const SMTP_PORT     = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER     = process.env.SMTP_USER;
const SMTP_PASS     = process.env.SMTP_PASS;
const BROWSER       = process.env.BROWSER || 'chrome';

if (!SMTP_USER || !SMTP_PASS) {
  console.error('SMTP_USER and SMTP_PASS are required. Set them as environment variables or GitHub secrets.');
  process.exit(1);
}

const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

let totalTests = 0, totalPassed = 0, totalFailed = 0, totalDuration = 0;
const moduleRows = [];

if (existsSync(JSONS_DIR)) {
  const files = readdirSync(JSONS_DIR).filter((f) => f.endsWith('.json'));
  const moduleLabels = {
    'nopcommerce-setup':          'Application Setup',
    'categories-creation':        'Category Management',
    'products-creation':          'Product Management',
    'users-creation':             'Customer Management',
    'cart-creation':              'Cart & Checkout',
    'categories-overview':        'Category Admin',
    'products-overview':          'Product Admin',
    'users-overview':             'Customer Admin',
    'orders-overview':            'Order Admin',
    'cart-overview':              'Storefront Validation',
    'api-tests':                  'API Tests',
    'mobile-viewport-testing':    'Mobile Viewport',
    'order-journey':              'E2E Purchase Journey',
    'wipeout-allcreatedrecords':  'Data Cleanup',
  };

  for (const file of files) {
    const key  = file.replace('-report.json', '');
    const data = JSON.parse(readFileSync(path.join(JSONS_DIR, file), 'utf8'));
    const s    = data.stats || {};
    const tests   = s.tests    ?? 0;
    const passed  = s.passes   ?? 0;
    const failed  = s.failures ?? 0;
    const dur     = s.duration ?? 0;
    totalTests    += tests;
    totalPassed   += passed;
    totalFailed   += failed;
    totalDuration += dur;
    const icon = failed > 0 ? '&#10060;' : '&#9989;';
    const pct  = tests > 0 ? ((passed / tests) * 100).toFixed(0) : '0';
    moduleRows.push(`<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${icon} ${moduleLabels[key] || key}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${tests}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;color:#22c55e;font-weight:700">${passed}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;color:${failed > 0 ? '#ef4444' : '#888'};font-weight:700">${failed}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${pct}%</td>
    </tr>`);
  }
}

const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
const durationStr = totalDuration < 60000
  ? `${(totalDuration / 1000).toFixed(1)}s`
  : `${Math.floor(totalDuration / 60000)}m ${Math.floor((totalDuration % 60000) / 1000)}s`;

const statusIcon  = totalFailed > 0 ? '&#10060;' : '&#9989;';
const statusColor = totalFailed > 0 ? '#ef4444' : '#22c55e';
const statusText  = totalFailed > 0 ? 'FAILED' : 'ALL PASSED';

const attachments = [];

const reportFiles = existsSync(REPORTS_DIR)
  ? readdirSync(REPORTS_DIR).filter((f) => f.endsWith('.html')).sort().reverse()
  : [];
if (reportFiles.length > 0) {
  attachments.push({
    filename: reportFiles[0],
    path: path.join(REPORTS_DIR, reportFiles[0]),
  });
}

const dashboardFile = path.join(HISTORY_DIR, 'trend-dashboard.html');
if (existsSync(dashboardFile)) {
  attachments.push({
    filename: 'trend-dashboard.html',
    path: dashboardFile,
  });
}

const subject = `${totalFailed > 0 ? 'FAIL' : 'PASS'} | nopCommerce Tests — ${passRate}% (${totalPassed}/${totalTests}) | ${dateStr} | ${BROWSER}`;

const htmlBody = `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:0 auto;background:#fff">

  <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);color:#fff;padding:28px 32px;border-radius:10px 10px 0 0">
    <h1 style="margin:0;font-size:22px;font-weight:700">nopCommerce — Daily Test Report</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#a0aec0">${dateStr} ${timeStr} | Browser: ${BROWSER} | Automated CI Pipeline</p>
  </div>

  <div style="padding:24px 32px;background:#f8fafc;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;text-align:center">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;min-width:120px">
      <div style="font-size:32px;font-weight:800;color:${statusColor}">${passRate}%</div>
      <div style="font-size:11px;color:#718096;text-transform:uppercase;margin-top:4px">Pass Rate</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;min-width:100px">
      <div style="font-size:28px;font-weight:800">${totalTests}</div>
      <div style="font-size:11px;color:#718096;text-transform:uppercase;margin-top:4px">Total</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;min-width:100px">
      <div style="font-size:28px;font-weight:800;color:#22c55e">${totalPassed}</div>
      <div style="font-size:11px;color:#718096;text-transform:uppercase;margin-top:4px">Passed</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;min-width:100px">
      <div style="font-size:28px;font-weight:800;color:${totalFailed > 0 ? '#ef4444' : '#888'}">${totalFailed}</div>
      <div style="font-size:11px;color:#718096;text-transform:uppercase;margin-top:4px">Failed</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;min-width:100px">
      <div style="font-size:28px;font-weight:800;color:#8b5cf6">${durationStr}</div>
      <div style="font-size:11px;color:#718096;text-transform:uppercase;margin-top:4px">Duration</div>
    </div>
  </div>

  <div style="padding:24px 32px">
    <h2 style="font-size:15px;font-weight:700;color:#2d3748;border-left:4px solid #3b82f6;padding-left:10px;margin-bottom:14px">Module Breakdown</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <thead>
        <tr style="background:#1a1a2e;color:#fff">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase">Module</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase">Tests</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase">Pass</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase">Fail</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase">Rate</th>
        </tr>
      </thead>
      <tbody>${moduleRows.join('')}</tbody>
      <tfoot>
        <tr style="background:#f0f2f5;font-weight:700">
          <td style="padding:10px 12px">${statusIcon} Overall</td>
          <td style="padding:10px 12px;text-align:center">${totalTests}</td>
          <td style="padding:10px 12px;text-align:center;color:#22c55e">${totalPassed}</td>
          <td style="padding:10px 12px;text-align:center;color:${totalFailed > 0 ? '#ef4444' : '#888'}">${totalFailed}</td>
          <td style="padding:10px 12px;text-align:center;color:${statusColor};font-size:15px">${passRate}%</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
    <p style="font-size:12px;color:#718096;margin:0">
      <strong>Attachments:</strong> Full HTML test report + Trend dashboard (open in browser to view charts &amp; details)
    </p>
  </div>

  <div style="padding:16px 32px;background:#1a1a2e;color:#a0aec0;font-size:11px;text-align:center;border-radius:0 0 10px 10px">
    nopCommerce Automation Suite | Cypress + TypeScript | Automated Daily Report
  </div>
</div>`;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

try {
  const info = await transporter.sendMail({
    from: `"nopCommerce Test Bot" <${SMTP_USER}>`,
    to: TO_EMAIL,
    subject,
    html: htmlBody,
    attachments,
  });
  console.log(`Email sent to ${TO_EMAIL} — Message ID: ${info.messageId}`);
} catch (err) {
  console.error('Failed to send email:', err.message);
  process.exit(1);
}

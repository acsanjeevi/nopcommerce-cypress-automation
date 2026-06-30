import { readFileSync, existsSync, readdirSync } from 'fs';

const TO_EMAIL       = 'acsanjeevi@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is required.');
  process.exit(1);
}

const body = existsSync('/tmp/email-body.html')
  ? readFileSync('/tmp/email-body.html', 'utf8')
  : '<p>No report available.</p>';

const subject = existsSync('/tmp/email-subject.txt')
  ? readFileSync('/tmp/email-subject.txt', 'utf8').trim()
  : 'nopCommerce Test Report';

const attachments = [];

if (existsSync('cypress/reports')) {
  const htmlFiles = readdirSync('cypress/reports')
    .filter((f) => f.endsWith('.html'))
    .sort()
    .reverse();
  if (htmlFiles.length > 0) {
    attachments.push({
      filename: htmlFiles[0],
      content:  readFileSync(`cypress/reports/${htmlFiles[0]}`).toString('base64'),
    });
  }
}

if (existsSync('test-history/trend-dashboard.html')) {
  attachments.push({
    filename: 'trend-dashboard.html',
    content:  readFileSync('test-history/trend-dashboard.html').toString('base64'),
  });
}

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type':  'application/json',
  },
  body: JSON.stringify({
    from:        'nopCommerce Tests <onboarding@resend.dev>',
    to:          [TO_EMAIL],
    subject,
    html:        body,
    attachments,
  }),
});

const data = await res.json();
if (!res.ok) {
  console.error('Resend API error:', JSON.stringify(data, null, 2));
  process.exit(1);
}
console.log(`Email sent to ${TO_EMAIL} — ID: ${data.id}`);

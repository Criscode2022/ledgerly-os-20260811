const API = process.env.API_URL || 'http://127.0.0.1:3001/api';
const WEB = process.env.WEB_URL || 'http://127.0.0.1:8080/';

async function req(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${url} -> ${res.status} ${text}`);
  return body;
}

async function main() {
  console.log('Health…');
  await req(`${API}/health`);
  console.log('Web…');
  const web = await fetch(WEB);
  if (!web.ok) throw new Error(`Web ${web.status}`);
  const html = await web.text();
  if (!html.includes('app-root') && !html.includes('Ledgerly')) {
    throw new Error('Web HTML missing app root');
  }

  console.log('Login…');
  const auth = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@ledgerly.app', password: 'demo1234' }),
  });
  const h = { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' };

  console.log('Dashboard…');
  const dash = await req(`${API}/dashboard`, { headers: h });
  if (!dash.metrics) throw new Error('No metrics');

  console.log('Clients…');
  const clients = await req(`${API}/clients`, { headers: h });
  if (!clients.length) throw new Error('No clients');

  console.log('Create client…');
  const client = await req(`${API}/clients`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ name: 'Smoke Test Co', email: 'smoke@example.com' }),
  });

  console.log('Create invoice…');
  const inv = await req(`${API}/invoices`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      clientId: client.id,
      issueDate: '2026-08-01',
      dueDate: '2026-08-31',
      taxRate: 10,
      status: 'sent',
      items: [{ description: 'Smoke test line', quantity: 2, unitPrice: 100 }],
    }),
  });
  if (Number(inv.total) !== 220) throw new Error(`Expected total 220 got ${inv.total}`);

  console.log('Create expense…');
  await req(`${API}/expenses`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      description: 'Smoke expense',
      category: 'Other',
      amount: 12.5,
      date: '2026-08-01',
      billable: false,
    }),
  });

  console.log('Mark invoice paid…');
  await req(`${API}/invoices/${inv.id}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ status: 'paid' }),
  });

  console.log('Cleanup…');
  await req(`${API}/invoices/${inv.id}`, { method: 'DELETE', headers: h });
  await req(`${API}/clients/${client.id}`, { method: 'DELETE', headers: h });

  console.log('ALL SMOKE TESTS PASSED');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

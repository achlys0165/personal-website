import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createContactHandler } from '../server/contact.js';

const env = {
  CONTACT_ALLOWED_ORIGINS: 'https://jan.example',
  CONTACT_FROM_EMAIL: 'Jan <contact@jan.example>',
  RESEND_API_KEY: 'test-resend-key',
  TURNSTILE_SECRET_KEY: 'test-secret',
  UPSTASH_REDIS_REST_URL: 'https://redis.example',
  UPSTASH_REDIS_REST_TOKEN: 'test-redis-key',
};
const body = { name: 'Visitor', email: 'visitor@example.com', topic: 'Web App',
  message: '<script>alert("hello")</script>\nI have a project to discuss.', token: 'valid-token', website: '' };
function request(input: unknown = body, headers: Record<string, string> = {}) {
  return new Request('https://jan.example/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://jan.example',
      'x-vercel-forwarded-for': '203.0.113.1', ...headers }, body: JSON.stringify(input),
  });
}
function fixture(options: { verify?: Record<string, unknown>; emailStatus?: number; limitError?: boolean;
  limitTimeout?: boolean; blocked?: boolean; config?: Record<string, string | undefined>; fetchError?: boolean } = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const identifiers: string[] = [];
  const handler = createContactHandler({ env: { ...env, ...options.config },
    limit: async identifier => {
      identifiers.push(identifier);
      if (options.limitError) throw new Error('Redis unavailable');
      return { success: !options.blocked, reset: Date.now() + 60_000, reason: options.limitTimeout ? 'timeout' : undefined };
    },
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      if (options.fetchError) throw new Error('Network failure');
      if (String(url).includes('siteverify')) return Response.json(options.verify ?? { success: true, action: 'contact', hostname: 'jan.example' });
      return Response.json(options.emailStatus ? { message: 'provider error with private details' } : { id: 'sent-message' }, { status: options.emailStatus ?? 200 });
    },
  });
  return { handler, calls, identifiers };
}

test('sends plain-text mail only to Jan, with visitor as Reply-To, after verification', async () => {
  const { handler, calls, identifiers } = fixture();
  const response = await handler(request({ ...body, to: 'attacker@example.com', from: 'attacker@example.com' }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  const verification = new URLSearchParams(calls[0].init?.body as URLSearchParams);
  assert.equal(verification.get('remoteip'), '203.0.113.1');
  assert.equal(verification.get('secret'), 'test-secret');
  const email = JSON.parse(calls[1].init?.body as string);
  assert.deepEqual(email.to, ['jansultan670@gmail.com']);
  assert.equal(email.from, env.CONTACT_FROM_EMAIL);
  assert.equal(email.reply_to, body.email);
  assert.equal(email.html, undefined);
  assert.ok(email.text.includes(body.message));
  assert.match(identifiers[0], /^[a-f0-9]{64}$/);
  assert.ok(!identifiers[0].includes('203.0.113.1'));
  assert.ok(new Headers(calls[1].init?.headers).has('Idempotency-Key'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('rejects methods, wrong content type, and unapproved origins before contacting services', async () => {
  const { handler, calls } = fixture();
  const get = await handler(new Request('https://jan.example/api/contact'));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  assert.equal((await handler(request(body, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await handler(request(body, { Origin: 'https://attacker.example' }))).status, 403);
  const missing = request(); missing.headers.delete('origin');
  assert.equal((await handler(missing)).status, 403);
  assert.equal(calls.length, 0);
});

test('validates fields and honeypot and rejects header injection', async () => {
  const { handler, calls, identifiers } = fixture();
  for (const input of [null, [], { ...body, name: '' }, { ...body, name: 'Jan\r\nBcc: hacker' },
    { ...body, email: 'visitor@example.com\r\nBcc:attacker@example.com' }, { ...body, email: 'visitor\x00@example.com' },
    { ...body, topic: 'Unknown' }, { ...body, message: 'short' }, { ...body, message: 'a'.repeat(5001) },
    { ...body, token: '' }, { ...body, token: 'a'.repeat(2049) }, { ...body, website: 'bot.example' }]) {
    assert.equal((await handler(request(input))).status, 400);
  }
  assert.equal(calls.length, 0);
  assert.equal(identifiers.length, 0);
});

test('bounds body size using actual bytes, not just a client supplied length', async () => {
  const { handler, calls } = fixture();
  assert.equal((await handler(request({ ...body, message: 'a'.repeat(40_000) }))).status, 413);
  assert.equal((await handler(request(body, { 'Content-Length': '999999' }))).status, 413);
  const malformed = new Request('https://jan.example/api/contact', { method: 'POST', headers: request().headers, body: '{' });
  assert.equal((await handler(malformed)).status, 400);
  assert.equal(calls.length, 0);
});

test('requires Vercel edge IP and ignores spoofed Cloudflare and forwarded IP headers', async () => {
  const { handler, identifiers } = fixture();
  const missing = request(body, { 'CF-Connecting-IP': '192.0.2.7', 'x-forwarded-for': '192.0.2.7' });
  missing.headers.delete('x-vercel-forwarded-for');
  assert.equal((await handler(missing)).status, 503);
  assert.equal((await handler(request(body, { 'x-vercel-forwarded-for': 'invalid' }))).status, 503);
  assert.equal(identifiers.length, 0);
});

test('returns 429 with Retry-After before verification or email', async () => {
  const { handler, calls } = fixture({ blocked: true });
  const response = await handler(request());
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) >= 59);
  assert.equal(calls.length, 0);
});

test('shared limiter survives separate function instances and blocks concurrent excess attempts', async () => {
  let attempts = 0;
  const limit = async () => ({ success: ++attempts <= 3, reset: Date.now() + 600_000 });
  const calls: string[] = [];
  const fetchMock: typeof fetch = async url => {
    calls.push(String(url));
    return Response.json(String(url).includes('siteverify') ? { success: true, action: 'contact', hostname: 'jan.example' } : { id: 'sent' });
  };
  const handlers = Array.from({ length: 6 }, () => createContactHandler({ env, limit, fetch: fetchMock }));
  const responses = await Promise.all(handlers.map(handler => handler(request())));
  assert.equal(responses.filter(response => response.status === 200).length, 3);
  assert.equal(responses.filter(response => response.status === 429).length, 3);
  assert.equal(calls.filter(url => url.includes('resend')).length, 3);
});

test('does not send when Redis fails or the limiter fails open on timeout', async () => {
  for (const options of [{ limitError: true }, { limitTimeout: true }]) {
    const { handler, calls } = fixture(options);
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls.length, 0);
  }
});

test('rejects invalid, replayed, foreign-host, and wrong-action Turnstile tokens', async () => {
  for (const verify of [{ success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: true, hostname: 'other.example', action: 'contact' },
    { success: true, hostname: 'jan.example', action: 'login' }, { success: true }]) {
    const { handler, calls } = fixture({ verify });
    assert.equal((await handler(request())).status, 400);
    assert.equal(calls.length, 1);
  }
});

test('missing configuration, wildcard origins, and production test keys fail closed', async () => {
  for (const config of [{ RESEND_API_KEY: '' }, { UPSTASH_REDIS_REST_TOKEN: '' }, { CONTACT_ALLOWED_ORIGINS: '*' },
    { CONTACT_ALLOWED_ORIGINS: 'https://jan.example/contact' },
    { VERCEL_ENV: 'production', TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' }]) {
    const { handler, calls } = fixture({ config });
    assert.equal((await handler(request())).status, 503);
    assert.equal(calls.length, 0);
  }
});

test('provider rejection and network failure never report success or leak provider details', async () => {
  const { handler } = fixture({ emailStatus: 403 });
  const response = await handler(request());
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes('private details'));
  assert.equal((await fixture({ fetchError: true }).handler(request())).status, 503);
});

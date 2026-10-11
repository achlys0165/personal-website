import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { categories, profile } from '../src/profile.js';

type Env = Record<string, string | undefined>;
type LimitResult = { success: boolean; reset: number; reason?: string; pending?: Promise<unknown> };
type Dependencies = {
  env?: Env;
  fetch?: typeof fetch;
  limit?: (identifier: string) => Promise<LimitResult>;
};
const topics = new Set<string>([...categories, 'Work Opportunity', 'General Message']);
const unavailable = 'The contact form is temporarily unavailable. Please use the email link to reach me.';
const maxBodyBytes = 32_768;

function reply(status: number, message: string, headers: Record<string, string> = {}) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function allowedOrigins(value: string | undefined) {
  return (value ?? '').split(',').map(value => value.trim()).filter(Boolean).map(value => {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol === 'http:')) {
      throw new Error('Invalid contact origin');
    }
    if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Invalid contact origin');
    return url.origin;
  });
}

async function readBody(request: Request) {
  if (Number(request.headers.get('content-length')) > maxBodyBytes) throw new RangeError('Body too large');
  if (!request.body) throw new SyntaxError('Missing body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBodyBytes) {
        await reader.cancel();
        throw new RangeError('Body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function validate(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (['name', 'email', 'topic', 'message', 'token', 'website'].some(key => typeof input[key] !== 'string')) return null;
  const name = (input.name as string).trim();
  const email = (input.email as string).trim();
  const topic = input.topic as string;
  const message = (input.message as string).trim();
  const token = input.token as string;
  if (!name || name.length > 100 || /[\r\n\x00-\x1f\x7f]/.test(name) || email.length > 254 ||
      /[\x00-\x1f\x7f]/.test(email) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !topics.has(topic) ||
      message.length < 10 || message.length > 5000 || /\x00/.test(message) || !token || token.length > 2048) return null;
  return { name, email, topic, message, token, website: input.website as string };
}

export function createContactHandler(dependencies: Dependencies = {}) {
  const env = dependencies.env ?? process.env;
  const requestFetch = dependencies.fetch ?? fetch;
  let limiter: Ratelimit | undefined;
  const limit = dependencies.limit ?? (async (identifier: string) => {
    limiter ??= new Ratelimit({
      redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! }),
      limiter: Ratelimit.slidingWindow(3, '10 m'),
      prefix: 'portfolio:contact:v1',
      analytics: false,
      timeout: 3000,
      ephemeralCache: false,
    });
    return limiter.limit(identifier);
  });

  return async function contactHandler(request: Request): Promise<Response> {
    if (request.method !== 'POST') return reply(405, 'Use POST to send a message.', { Allow: 'POST' });
    if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
      return reply(415, 'Please submit the form as JSON.');
    }

    let origins: string[];
    try {
      origins = allowedOrigins(env.CONTACT_ALLOWED_ORIGINS);
      if (!origins.length || ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'TURNSTILE_SECRET_KEY',
        'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'].some(key => !env[key]?.trim())) throw new Error('Missing configuration');
      // Cloudflare's test secret must never allow production submissions.
      if (env.VERCEL_ENV === 'production' && [env.TURNSTILE_SECRET_KEY, env.VITE_TURNSTILE_SITE_KEY]
        .some(key => /^[123]x0{20}/.test(key ?? ''))) throw new Error('Test key');
    } catch {
      return reply(503, unavailable);
    }
    const origin = request.headers.get('origin');
    if (!origin || !origins.includes(origin)) return reply(403, 'Please send your message from the portfolio website.');

    let input;
    try {
      input = validate(await readBody(request));
    } catch (error) {
      return reply(error instanceof RangeError ? 413 : 400, 'Please check your message and try again.');
    }
    if (!input) return reply(400, 'Please provide a name, valid email, topic, and a message between 10 and 5,000 characters.');
    if (input.website) return reply(400, 'Unable to submit this form.');

    // Vercel sets this header at its edge. Do not trust CF-Connecting-IP or arbitrary forwarded headers.
    const ip = request.headers.get('x-vercel-forwarded-for')?.trim();
    if (!ip || !isIP(ip)) return reply(503, unavailable);
    const identifier = createHmac('sha256', env.TURNSTILE_SECRET_KEY!).update(ip).digest('hex');
    try {
      const result = await limit(identifier);
      // The SDK otherwise permits traffic when Redis times out; this form must fail closed.
      if (result.reason === 'timeout') {
        void result.pending?.catch(() => {});
        return reply(503, unavailable);
      }
      if (result.pending) await result.pending;
      if (!result.success) {
        const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        return reply(429, 'Too many attempts. Please wait before sending another message.', { 'Retry-After': String(retryAfter) });
      }
    } catch {
      return reply(503, unavailable);
    }

    try {
      const verificationResponse = await requestFetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: input.token, remoteip: ip }),
        signal: AbortSignal.timeout(8000),
      });
      if (!verificationResponse.ok) return reply(503, unavailable);
      const verification = await verificationResponse.json() as { success?: boolean; hostname?: string; action?: string };
      if (verification.success !== true || verification.action !== 'contact' || verification.hostname !== new URL(origin).hostname) {
        return reply(400, 'Please complete the security check again.');
      }
    } catch {
      return reply(503, unavailable);
    }

    try {
      const emailResponse = await requestFetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `contact-${createHmac('sha256', env.TURNSTILE_SECRET_KEY!).update(input.token).digest('hex')}`,
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [profile.email],
          reply_to: input.email,
          subject: `Portfolio: ${input.topic} — ${input.name}`,
          text: `Name: ${input.name}\nEmail: ${input.email}\nTopic: ${input.topic}\n\n${input.message}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      const result = await emailResponse.json() as { id?: string };
      if (!emailResponse.ok || !result.id) return reply(502, 'Your message could not be sent. Please try again later or use the email link.');
      return reply(200, 'Your message was sent. Thanks for reaching out!');
    } catch {
      return reply(502, 'We could not confirm that your message was sent. Please use the email link if you need to reach me.');
    }
  };
}

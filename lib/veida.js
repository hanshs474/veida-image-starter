// Veida AI API calls shared by server.js (Docker, Railway, Zeabur, Dokploy) and api/ (Vercel).
import { randomUUID } from 'node:crypto';

const BASE = 'https://veida.ai';
const KEY = process.env.VEIDA_API_KEY || '';
const MODEL = process.env.VEIDA_MODEL || 'veida-image-v1';
// The free tier keys its wallet on x-anon-id, and the poll must send the same id as the
// submit. The page sends its own id so this holds on serverless too, where submit and
// poll can land on different instances; the process-wide id is only a fallback.
const ANON_ID = `starter-${randomUUID()}`;
const auth = (clientId) => KEY
  ? { authorization: `Bearer ${KEY}` }
  : { 'x-anon-id': /^[\w-]{8,64}$/.test(clientId || '') ? `starter-${clientId}` : ANON_ID };

export async function submit(prompt, aspectRatio, clientId) {
  const r = await fetch(`${BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth(clientId) },
    body: JSON.stringify({
      provider: 'kie', mediaType: 'image', model: KEY ? MODEL : 'veida-image-v1',
      scene: 'text-to-image', prompt, options: { aspect_ratio: aspectRatio || '1:1' },
    }),
  });
  const env = await r.json();
  // The quota wall is HTTP 200 with code 0 and data.wall — check it before reading an id.
  if (env.data?.wall) return { error: env.data.reason === 'ip_daily'
    ? 'The free tier is used up for today on this server. Set VEIDA_API_KEY to keep going.'
    : 'Out of free credits. Set VEIDA_API_KEY to keep going.' };
  if (env.code !== 0 || !env.data?.id) return { error: env.message || 'Veida AI refused the request.' };
  return { taskId: env.data.id };
}

export async function status(taskId, clientId) {
  const r = KEY
    ? await fetch(`${BASE}/api/ai/query`, { method: 'POST', headers: { 'content-type': 'application/json', ...auth(clientId) }, body: JSON.stringify({ taskId }) })
    : await fetch(`${BASE}/api/ai/anon-query?taskId=${encodeURIComponent(taskId)}&provider=kie&mediaType=image`, { headers: auth(clientId) });
  const env = await r.json();
  const d = env.data || {};
  const url = d.cleanImages?.[0] || d.images?.[0];
  if (url) return { done: true, url };
  // Only success and failed are final; states can step backwards in between.
  if (d.status === 'failed' || d.status === 'error') return { done: true, error: 'The prompt was refused. Try rewording it.' };
  return { done: false };
}

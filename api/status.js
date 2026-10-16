// Vercel function: GET /api/status?id=. Polling is what starts a queued free job.
import { status } from '../lib/veida.js';

export default async function handler(req, res) {
  try {
    res.status(200).json(await status(String(req.query.id || ''), String(req.headers['x-client-id'] || '')));
  } catch {
    res.status(502).json({ error: 'Could not reach Veida AI. Try again in a moment.' });
  }
}

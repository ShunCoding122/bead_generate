import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const allowed = (process.env.ALLOWED_IPS || '').split(',').map((x) => x.trim()).filter(Boolean);
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0].trim();
  if (allowed.length && !allowed.includes(ip)) {
    return res.status(403).send('Forbidden');
  }
  return res.status(200).send('ok');
}

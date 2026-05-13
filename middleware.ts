const normalizeIp = (raw: string): string => {
  const v = raw.trim();
  if (!v) return '';
  const noPort = v.includes(':') && v.includes('.') ? v.substring(v.lastIndexOf(':') + 1).includes('.') ? v.substring(0, v.lastIndexOf(':')) : v : v;
  const withoutPrefix = noPort.replace(/^::ffff:/, '');
  return withoutPrefix;
};

const getClientIp = (request: Request): string => {
  const xff = request.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0] || '';
  const realIp = request.headers.get('x-real-ip') || '';
  return normalizeIp(first || realIp);
};

export default async function middleware(request: Request): Promise<Response> {
  const allowedRaw = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.ALLOWED_IPS ?? '';
  const allowed = allowedRaw
    .split(',')
    .map((ip: string) => normalizeIp(ip))
    .filter(Boolean);

  if (!allowed.length) {
    return new Response('Forbidden: ALLOWED_IPS is empty', { status: 403 });
  }

  if (allowed.includes('*')) return fetch(request);

  const ip = getClientIp(request);
  if (!ip || !allowed.includes(ip)) {
    console.log('[allowlist-block]', { ip, allowedSample: allowed.slice(0, 5) });
    return new Response('Forbidden', { status: 403 });
  }

  return fetch(request);
}

export const config = {
  matcher: '/:path*',
};

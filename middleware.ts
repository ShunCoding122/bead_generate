const getClientIp = (request: Request): string => {
  const xff = request.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0]?.trim();
  if (first) return first;
  const realIp = request.headers.get('x-real-ip')?.trim();
  return realIp || '';
};

export default async function middleware(request: Request): Promise<Response> {
  const allowedRaw = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.ALLOWED_IPS ?? '';
  const allowed = allowedRaw
    .split(',')
    .map((ip: string) => ip.trim())
    .filter(Boolean);

  if (!allowed.length) {
    return new Response('Forbidden: ALLOWED_IPS is empty', { status: 403 });
  }

  const ip = getClientIp(request);
  if (!ip || !allowed.includes(ip)) {
    return new Response('Forbidden', { status: 403 });
  }

  return fetch(request);
}

export const config = {
  matcher: '/:path*',
};

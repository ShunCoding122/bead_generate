const getClientIp = (request: Request): string => {
  const xff = request.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0]?.trim();
  if (first) return first;
  const realIp = request.headers.get('x-real-ip')?.trim();
  return realIp || '';
};

export default function middleware(request: Request): Response {
  const allowed = (process.env.ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
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

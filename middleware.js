export function middleware(request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [type, credentials] = authHeader.split(' ');
    if (type === 'Basic') {
      const [username, password] = atob(credentials).split(':');
      if (
        username === process.env.AUTH_USER &&
        password === process.env.AUTH_PASSWORD
      ) {
        return;
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Dashboard"' },
  });
}

export const config = {
  matcher: '/:path*',
};

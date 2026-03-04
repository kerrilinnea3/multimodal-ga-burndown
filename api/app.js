import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

function validateToken(token) {
  try {
    const secret = process.env.AUTH_PASSWORD + process.env.AUTH_USER;
    const [payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (sig !== expected) return false;
    const { t } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Date.now() - t < 86400 * 1000;
  } catch {
    return false;
  }
}

export default function handler(req, res) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  if (!validateToken(cookies.session || '')) {
    res.setHeader('Location', '/');
    return res.status(302).end();
  }

  const html = readFileSync(join(process.cwd(), 'dashboard.html'), 'utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}

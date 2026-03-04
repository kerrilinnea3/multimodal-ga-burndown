import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (
    username === process.env.AUTH_USER &&
    password === process.env.AUTH_PASSWORD
  ) {
    const secret = process.env.AUTH_PASSWORD + process.env.AUTH_USER;
    const payload = Buffer.from(JSON.stringify({ t: Date.now() })).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const token = `${payload}.${sig}`;

    res.setHeader(
      'Set-Cookie',
      `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const tokenRes = await fetch('https://backboard.railway.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.VITE_APP_URL}/api/oauth/callback`,
      client_id: process.env.VITE_APP_ID,
      client_secret: process.env.RAILWAY_CLIENT_SECRET,
    }),
  });

  const { access_token } = await tokenRes.json();

  if (!access_token) {
    return res.status(401).json({ error: 'Auth failed' });
  }

  res.setHeader('Set-Cookie', `token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  res.redirect('/app');
}

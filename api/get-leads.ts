import type { VercelRequest, VercelResponse } from '@vercel/node';

// Replace with your Vercel KV, Supabase, or Redis connection
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return unified lead stream
    return res.status(200).json({ status: 'success', data: [] });
  }

  if (req.method === 'POST') {
    const lead = req.body;
    // Insert into database and trigger Telegram/WhatsApp webhook to reps
    return res.status(201).json({ status: 'created', lead });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
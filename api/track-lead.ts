import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function hashData(input: string): string {
  if (!input) return '';
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, phoneNumber, deviceModel, issue, sourceUrl } = req.body || {};

  const PIXEL_ID = process.env.META_PIXEL_ID || '4113179748819741';
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    console.error('Missing META_CAPI_ACCESS_TOKEN');
    return res.status(500).json({ error: 'Server token configuration missing' });
  }

  // Format 10-digit Indian numbers with country code 91
  let cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const hashedPhone = hashData(cleanPhone);

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress;
  const userAgent = (req.headers['user-agent'] as string) || '';

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: sourceUrl || 'https://ifixspot.com',
        action_source: 'website',
        user_data: {
          ph: [hashedPhone],
          client_ip_address: clientIp,
          client_user_agent: userAgent
        },
        custom_data: {
          value: 1.0, // Meta requires a numerical value for optimization
          currency: 'INR',
          content_name: 'Hardware Service',
          content_category: deviceModel || 'iPhone',
          // We pass the issue as a custom property instead of predicted_ltv
          status: issue || 'Triage' 
        }
      }
    ]
  };

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await metaRes.json();

    if (!metaRes.ok) {
      console.error('Meta API Error:', result);
      return res.status(400).json({ success: false, error: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('CAPI Server Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

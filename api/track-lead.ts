import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function hashData(input: string): string {
  if (!input) return '';
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phoneNumber, deviceModel, issue, sourceUrl } = req.body || {};
  
  // Environment Variables
  const PIXEL_ID = process.env.META_PIXEL_ID || '4113179748819741';
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Server configuration missing keys' });
  }

  // 1. Initialize Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 2. Save Lead to Supabase (Replaces Formspree)
  const { data: dbData, error: dbError } = await supabase
    .from('leads')
    .insert([{ phone: phoneNumber, device_model: deviceModel, issue: issue }])
    .select();

  if (dbError || !dbData || dbData.length === 0) {
    return res.status(500).json({ error: 'Failed to save lead to database', details: dbError });
  }

  // The database row ID is our permanent Lead ID
  const leadId = dbData[0].id.toString();

  // 3. Prepare Meta CAPI Payload
  let cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  const hashedPhone = hashData(cleanPhone);

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress;
  const userAgent = (req.headers['user-agent'] as string) || '';

  const payload = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: leadId, // Syncing Meta with your Database ID
      event_source_url: sourceUrl || 'https://ifixspot.com',
      action_source: 'website',
      user_data: { ph: [hashedPhone], client_ip_address: clientIp, client_user_agent: userAgent },
      custom_data: { value: 1.0, currency: 'INR', content_name: 'Hardware Service', content_category: deviceModel, status: issue }
    }]
  };

  // 4. Send to Meta
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await metaRes.json();
    return res.status(200).json({ success: true, lead_id: leadId, meta: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Meta API failed' });
  }
}
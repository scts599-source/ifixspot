import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function hashData(input: string): string {
  if (!input) return '';
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { leadId, password } = req.body;
  if (password !== 'nadeem@ifixspot2026') return res.status(401).json({ error: 'Unauthorized' });

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
  const PIXEL_ID = process.env.META_PIXEL_ID || '4113179748819741';
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Mark the lead as Paid in Supabase
  const { data: leadData, error: updateError } = await supabase
    .from('leads')
    .update({ status: 'Paid' })
    .eq('id', leadId)
    .select()
    .single();

  if (updateError || !leadData) return res.status(500).json({ error: 'Failed to update database' });

  // 2. Prepare the CRM Feedback Loop Payload for Meta
  let cleanPhone = (leadData.phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const payload = {
    data: [{
      event_name: 'Purchase', 
      event_time: Math.floor(Date.now() / 1000),
      event_id: leadId.toString(), // Ties this purchase to the exact ad click
      action_source: 'system_generated', // Required for offline CRM events
      user_data: { ph: [hashData(cleanPhone)] },
      custom_data: {
        event_source: 'crm',
        value: 2499.0, // Minimum diagnostic/repair value
        currency: 'INR',
        content_category: leadData.device_model
      }
    }]
  };

  // 3. Dispatch to Meta
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await metaRes.json();
    return res.status(200).json({ success: true, meta: result });
  } catch (err) {
    return res.status(500).json({ error: 'Meta API failed' });
  }
}
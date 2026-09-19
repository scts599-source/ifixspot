import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Meta requires SHA-256 hashes for all user data (phone, email, etc.)
function hashData(input: string): string {
  if (!input) return '';
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { leadId, password } = req.body;
  
  // Basic CRM Security Validation
  if (password !== 'nadeem@ifixspot2026') return res.status(401).json({ error: 'Unauthorized' });

  // Environment Variables
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
  const PIXEL_ID = process.env.META_PIXEL_ID || '4113179748819741';
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN!;

  if (!ACCESS_TOKEN) return res.status(500).json({ error: 'Missing Meta Access Token' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Mark the lead as Paid in Supabase so it updates instantly on your Dashboard
  const { data: leadData, error: updateError } = await supabase
    .from('leads')
    .update({ status: 'Paid' })
    .eq('id', leadId)
    .select()
    .single();

  if (updateError || !leadData) return res.status(500).json({ error: 'Failed to update database' });

  // 2. Format the phone number for Meta (must include country code, no +, no spaces)
  let cleanPhone = (leadData.phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  // 3. Construct the EXACT Meta CRM Payload
  const payload = {
    data: [
      {
        action_source: "system_generated",
        custom_data: {
          event_source: "crm",
          lead_event_source: "iFixSpot CRM",
          value: 2499, // Minimum diagnostic/repair value. Tells Meta this lead has real monetary value.
          currency: "INR",
          content_category: leadData.device_model
        },
        // We use 'Purchase' here to definitively tell the algorithm that money changed hands
        event_name: "Purchase", 
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          // Hashed phone number
          ph: [hashData(cleanPhone)],
          // Using external_id to map your Supabase database ID to the original website lead
          external_id: [hashData(leadId.toString())]
        }
      }
    ]
  };

  // 4. Fire the payload to Meta Conversions API
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await metaRes.json();
    return res.status(200).json({ success: true, meta: result });
    
  } catch (err) {
    return res.status(500).json({ error: 'Meta API failed', details: String(err) });
  }
}
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure body is parsed correctly
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    // 1. Handle CRM Dashboard Updates (Status, Notes, Scheduling)
    if (body.action === 'update' && body.id) {
      console.log(`[CRM Update] Attempting to update lead ID: ${body.id}`);
      const { data, error } = await supabase
        .from('leads')
        .update(body.payload)
        .eq('id', body.id);
        
      if (error) throw error;
      return res.status(200).json({ status: 'updated', data });
    }
    
    // 2. Handle CRM Dashboard Manual Lead Creation
    if (body.action === 'create' && body.payload) {
      console.log(`[CRM Manual Create] Attempting to insert lead:`, body.payload);
      const { data, error } = await supabase
        .from('leads')
        .insert([body.payload]);
        
      if (error) throw error;
      return res.status(201).json({ status: 'created', data });
    }

    // 3. Handle Website Form Submissions (Public landing page)
    console.log(`[Web Form Submit] Attempting to capture new lead:`, body);
    const newLead = {
      name: body.name || 'Unknown',
      phone: body.phone,
      device: body.device || 'Not specified',
      issue: body.issue || 'Diagnostic Requested',
      source: 'Website Form',
      status: 'New',
      team: 'Team 1 (Prajwal)',
      notes: [{
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'System',
        text: 'Lead captured from Website Booking Form.'
      }]
    };

    const { error } = await supabase.from('leads').insert([newLead]);
    if (error) throw error;
    
    return res.status(201).json({ status: 'success' });
    
  } catch (err: any) {
    // Log the exact Supabase rejection to Vercel Logs
    console.error("[Supabase Error]:", err);
    return res.status(500).json({ error: err.message || 'Database error occurred' });
  }
}
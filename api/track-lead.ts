import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  try {
    // 1. Handle CRM Dashboard Updates (Updating Status, Adding Notes, Scheduling)
    if (body.action === 'update' && body.id) {
      const { data, error } = await supabase
        .from('leads')
        .update(body.payload)
        .eq('id', body.id);
        
      if (error) throw error;
      return res.status(200).json({ status: 'updated', data });
    }
    
    // 2. Handle CRM Dashboard Manual Lead Creation
    if (body.action === 'create' && body.payload) {
      const { data, error } = await supabase
        .from('leads')
        .insert([body.payload]);
        
      if (error) throw error;
      return res.status(201).json({ status: 'created', data });
    }

    // 3. Handle Website Form Submissions (New leads from public landing page)
    const newLead = {
      name: body.name || 'Unknown',
      phone: body.phone,
      device: body.device || 'Not specified',
      issue: body.issue || 'Diagnostic Requested',
      source: body.source || 'Website Form',
      status: 'New',
      team: 'Team 1 (Prajwal)', // Forces all new website leads to Prajwal's dashboard
      notes: [{
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'System',
        text: 'Lead captured from Website Booking Form.'
      }],
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('leads').insert([newLead]);
    if (error) throw error;
    
    return res.status(201).json({ status: 'success' });
    
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
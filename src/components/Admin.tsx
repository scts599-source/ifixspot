import { useState, useEffect } from 'react';

type Lead = {
  id: number;
  created_at: string;
  phone: string;
  device_model: string;
  issue: string;
  status: string;
};

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async (pwd: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setIsAuthenticated(true);
      } else {
        alert("Incorrect password");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const markAsPaid = async (leadId: number) => {
    if (!confirm("Are you sure? This will send a Purchase event to Meta.")) return;
    
    // Optimistic UI update
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'Paid' } : l));

    try {
      const res = await fetch('/api/track-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, password })
      });
      if (!res.ok) alert("Failed to sync with Meta.");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-ink">Admin Login</h2>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full mb-4 p-3 border rounded-xl"
          />
          <button 
            onClick={() => fetchLeads(password)}
            disabled={loading}
            className="w-full bg-ink text-white py-3 rounded-xl font-bold"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-ink">Lead Management CRM</h1>
          <button onClick={() => fetchLeads(password)} className="text-blue-600 font-semibold hover:underline">Refresh Data</button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-100 border-b border-zinc-200">
              <tr>
                <th className="p-4 font-semibold text-zinc-600">Date</th>
                <th className="p-4 font-semibold text-zinc-600">Phone</th>
                <th className="p-4 font-semibold text-zinc-600">Device & Issue</th>
                <th className="p-4 font-semibold text-zinc-600">Status</th>
                <th className="p-4 font-semibold text-zinc-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="p-4 text-sm">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{lead.phone}</td>
                  <td className="p-4">
                    <span className="block font-bold">{lead.device_model}</span>
                    <span className="text-xs text-zinc-500">{lead.issue}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {lead.status !== 'Paid' && (
                      <button 
                        onClick={() => markAsPaid(lead.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
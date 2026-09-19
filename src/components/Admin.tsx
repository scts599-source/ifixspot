import { useState } from 'react';

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-5">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-zinc-200 w-full max-w-sm">
          <div className="w-12 h-12 bg-ink rounded-xl mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-xl">iF</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-2 text-ink">Admin Login</h2>
          <p className="text-sm text-zinc-500 mb-6">Enter your credentials to access the CRM.</p>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLeads(password)}
            placeholder="Enter password"
            className="w-full mb-4 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-ink focus:ring-2 focus:ring-ink/20 transition-all"
          />
          <button 
            onClick={() => fetchLeads(password)}
            disabled={loading}
            className="w-full bg-ink hover:bg-zinc-800 transition-colors text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 mt-2 sm:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Lead Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage inquiries and sync conversions to Meta.</p>
          </div>
          <button 
            onClick={() => fetchLeads(password)} 
            className="text-sm bg-white border border-zinc-200 px-4 py-2 rounded-lg font-semibold hover:bg-zinc-50 shadow-sm transition-all"
          >
            ↻ Refresh Data
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          
          {/* 📱 MOBILE VIEW: Stacked Cards */}
          <div className="block md:hidden divide-y divide-zinc-100">
            {leads.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">No leads found.</div>
            )}
            {leads.map(lead => (
              <div key={lead.id} className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="block font-bold text-ink leading-tight">{lead.device_model}</span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">{lead.issue}</span>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {lead.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-sm">
                  <span className="font-semibold text-zinc-700 tracking-wide">📞 {lead.phone}</span>
                  <span className="text-xs text-zinc-400 font-medium">{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                
                {lead.status !== 'Paid' && (
                  <button 
                    onClick={() => markAsPaid(lead.id)}
                    className="w-full bg-green-600 active:bg-green-700 transition-colors text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-green-600/20 flex justify-center items-center gap-2"
                  >
                    <span>✓</span> Mark as Paid
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 💻 DESKTOP VIEW: Data Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="p-4 text-xs uppercase tracking-wider font-bold text-zinc-500">Date</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-bold text-zinc-500">Phone</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-bold text-zinc-500">Device & Issue</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-bold text-zinc-500">Status</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-bold text-zinc-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">No leads found.</td>
                  </tr>
                )}
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 text-sm text-zinc-500 font-medium whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold text-zinc-700 whitespace-nowrap">
                      {lead.phone}
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-ink">{lead.device_model}</span>
                      <span className="text-xs text-zinc-500">{lead.issue}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lead.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {lead.status !== 'Paid' ? (
                        <button 
                          onClick={() => markAsPaid(lead.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-green-600/20 transition-all active:scale-95"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-zinc-400 italic pr-4">Synced to Meta</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, MessageSquare, Plus, Search, Calendar, 
  Clock, AlertCircle, ChevronRight, X, 
  LogOut, Send, ArrowLeftRight
} from 'lucide-react';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  device: string;
  issue: string;
  source: 'Website Form' | 'WhatsApp' | 'Meta Ad' | 'Walk-in';
  status: 'New' | 'Contacted' | 'Visit Scheduled' | 'In Progress' | 'Converted' | 'Lost';
  team: 'Team 1 (Prajwal)' | 'Team 2 (Rayyan)';
  visitDate?: string;
  followUpReminder?: string;
  notes: Array<{ timestamp: string; author: string; text: string }>;
  estimatedCost?: number;
  createdAt: string;
}

interface CRMViewProps {
  onLogout: () => void;
}

export default function CRMView({ onLogout }: CRMViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTeam, setActiveTeam] = useState<'Team 1 (Prajwal)' | 'Team 2 (Rayyan)'>('Team 1 (Prajwal)');
  const [activeTab, setActiveTab] = useState<'All' | 'FollowUpDue' | 'VisitScheduled' | 'Converted'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  const [newLeadForm, setNewLeadForm] = useState({
    name: '', phone: '', device: '', issue: '', source: 'WhatsApp' as Lead['source'], estimatedCost: ''
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/get-leads');
      if (res.ok) {
        const data = await res.json();
        const sortedLeads = (data.leads || []).sort((a: Lead, b: Lead) => b.id - a.id);
        setLeads(sortedLeads);
      }
    } catch (err) {
      console.error("Failed to fetch leads");
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateLeadInDb = async (leadId: number, payload: Partial<Lead>) => {
    try {
      await fetch('/api/track-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, action: 'update', payload })
      });
      fetchLeads();
    } catch (err) {
      console.error("Failed to update lead");
    }
  };

  const dueReminders = useMemo(() => {
    const now = new Date().getTime();
    return leads.filter(l => {
      if (l.team !== activeTeam) return false;
      if (!l.followUpReminder || l.status === 'Converted' || l.status === 'Lost') return false;
      return new Date(l.followUpReminder).getTime() <= now;
    });
  }, [leads, activeTeam]);

  // Safe Filter with Fallbacks to prevent undefined crashes
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (lead.team !== activeTeam) return false;

      const nameStr = (lead.name || '').toLowerCase();
      const phoneStr = (lead.phone || '').toLowerCase();
      const deviceStr = (lead.device || '').toLowerCase();
      const idStr = (lead.id || '').toString();
      const query = searchQuery.toLowerCase();

      const matchesSearch = 
        nameStr.includes(query) ||
        phoneStr.includes(query) ||
        deviceStr.includes(query) ||
        idStr.includes(query);

      if (!matchesSearch) return false;

      if (activeTab === 'FollowUpDue') {
        const now = new Date().getTime();
        return lead.followUpReminder && 
               new Date(lead.followUpReminder).getTime() <= now && 
               lead.status !== 'Converted' && 
               lead.status !== 'Lost';
      }
      if (activeTab === 'VisitScheduled') return lead.status === 'Visit Scheduled';
      if (activeTab === 'Converted') return lead.status === 'Converted';
      return true;
    });
  }, [leads, searchQuery, activeTab, activeTeam]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const newEntry = {
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      device: newLeadForm.device || 'Unspecified',
      issue: newLeadForm.issue || 'Diagnostic Required',
      source: newLeadForm.source,
      status: 'New',
      team: activeTeam,
      estimatedCost: newLeadForm.estimatedCost ? Number(newLeadForm.estimatedCost) : null,
      notes: [{
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: activeTeam.split(' ')[1].replace(/[()]/g, ''),
        text: 'Lead created manually.'
      }]
    };

    try {
      await fetch('/api/track-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', payload: newEntry })
      });
      fetchLeads();
      setIsAddModalOpen(false);
      setNewLeadForm({ name: '', phone: '', device: '', issue: '', source: 'WhatsApp', estimatedCost: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = (id: number, newStatus: Lead['status']) => {
    const targetLead = leads.find(l => l.id === id);
    if (!targetLead) return;

    const updatedNotes = [...(targetLead.notes || []), {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: activeTeam.split(' ')[1].replace(/[()]/g, ''),
      text: `Status updated to [${newStatus}]`
    }];

    updateLeadInDb(id, { status: newStatus, notes: updatedNotes });
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus, notes: updatedNotes });
    }
  };

  const handleAddNote = (id: number) => {
    if (!newNoteText.trim() || !selectedLead) return;
    
    const newNote = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: activeTeam.split(' ')[1].replace(/[()]/g, ''),
      text: newNoteText.trim()
    };

    const updatedNotes = [...(selectedLead.notes || []), newNote];
    updateLeadInDb(id, { notes: updatedNotes });
    setSelectedLead({ ...selectedLead, notes: updatedNotes });
    setNewNoteText('');
  };

  const handleSaveVisitDetails = (id: number, visitDate: string, reminderDate: string) => {
    const targetLead = leads.find(l => l.id === id);
    if (!targetLead) return;

    const newStatus = visitDate ? 'Visit Scheduled' : targetLead.status;
    const updatedNotes = [...(targetLead.notes || []), {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: activeTeam.split(' ')[1].replace(/[()]/g, ''),
      text: `Scheduled visit: ${visitDate || 'N/A'}. Reminder: ${reminderDate || 'N/A'}.`
    }];

    updateLeadInDb(id, {
      visitDate: visitDate || targetLead.visitDate,
      followUpReminder: reminderDate || targetLead.followUpReminder,
      status: newStatus,
      notes: updatedNotes
    });
    setSelectedLead(null);
  };

  const handleTransferLead = (id: number, currentTeam: string) => {
    const targetTeam = currentTeam === 'Team 1 (Prajwal)' ? 'Team 2 (Rayyan)' : 'Team 1 (Prajwal)';
    const targetLead = leads.find(l => l.id === id);
    if (!targetLead) return;

    const updatedNotes = [...(targetLead.notes || []), {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: activeTeam.split(' ')[1].replace(/[()]/g, ''),
      text: `Lead transferred to ${targetTeam}.`
    }];

    updateLeadInDb(id, { team: targetTeam, notes: updatedNotes });
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <select 
            value={activeTeam}
            onChange={(e) => setActiveTeam(e.target.value as any)}
            className="bg-transparent text-base font-bold tracking-tight text-white focus:outline-none appearance-none"
          >
            <option value="Team 1 (Prajwal)" className="bg-zinc-900">Dashboard: Prajwal</option>
            <option value="Team 2 (Rayyan)" className="bg-zinc-900">Dashboard: Rayyan</option>
          </select>
        </div>

        <button onClick={onLogout} title="Log Out" className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 border border-zinc-700/60">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {dueReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce" />
            <span><strong>{dueReminders.length} follow-up(s)</strong> due for {activeTeam.split(' ')[1].replace(/[()]/g, '')}.</span>
          </div>
          <button onClick={() => setActiveTab('FollowUpDue')} className="underline font-semibold text-amber-300">View</button>
        </div>
      )}

      <section className="p-4 space-y-3 bg-zinc-900/30 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, or ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'All', label: `All (${leads.filter(l => l.team === activeTeam).length})` },
            { id: 'FollowUpDue', label: `Due (${dueReminders.length})`, highlight: dueReminders.length > 0 },
            { id: 'VisitScheduled', label: 'Visits' },
            { id: 'Converted', label: 'Converted' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === tab.id ? 'bg-cyan-500 text-black font-semibold' : 
                tab.highlight ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 
                'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex-1 p-4 space-y-3 pb-24 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">No leads in this view.</div>
        ) : (
          filteredLeads.map(lead => {
            const isDue = lead.followUpReminder && new Date(lead.followUpReminder).getTime() <= Date.now() && lead.status !== 'Converted' && lead.status !== 'Lost';
            return (
              <div 
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-2xl bg-zinc-900 border transition-all cursor-pointer ${
                  isDue ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">ID: {lead.id} • {lead.source || 'Website'}</span>
                    <h3 className="text-base font-bold text-zinc-100">{lead.name || 'Unnamed Lead'}</h3>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                    lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    lead.status === 'Lost' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    lead.status === 'Visit Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    lead.status === 'New' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {lead.status || 'New'}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 font-medium mb-1">
                  {lead.device || 'Device N/A'} — <span className="text-zinc-400 font-normal">{lead.issue || 'No notes'}</span>
                </div>

                {lead.visitDate && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 bg-blue-500/10 px-2.5 py-1 rounded-lg w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Visit: {new Date(lead.visitDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-zinc-950/95 to-transparent z-30">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> Create New Lead
        </button>
      </div>

      {/* Selected Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end p-0 sm:p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-500">Lead ID: {selectedLead.id}</span>
                <h2 className="text-xl font-bold text-white">{selectedLead.name || 'Unnamed Lead'}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedLead.phone || 'No phone'} • {selectedLead.device || 'No device'}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${selectedLead.phone}`} className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-zinc-200">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call
              </a>
              <a href={`https://wa.me/91${selectedLead.phone}`} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 text-emerald-300">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
              </a>
              <button onClick={() => handleTransferLead(selectedLead.id, selectedLead.team)} className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white" title="Transfer Lead">
                <ArrowLeftRight className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Update Stage</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['New', 'Contacted', 'Visit Scheduled', 'In Progress', 'Converted', 'Lost'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedLead.id, status)}
                    className={`py-2 rounded-xl font-medium border ${
                      selectedLead.status === status ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> Schedule Timestamps
              </h4>
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400">Visit Date & Time</label>
                <input type="datetime-local" defaultValue={selectedLead.visitDate || ''} id="modalVisitDateInput" className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400">Follow-Up Alert Trigger</label>
                <input type="datetime-local" defaultValue={selectedLead.followUpReminder || ''} id="modalReminderDateInput" className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white" />
              </div>
              <button
                onClick={() => {
                  const visitVal = (document.getElementById('modalVisitDateInput') as HTMLInputElement).value;
                  const reminderVal = (document.getElementById('modalReminderDateInput') as HTMLInputElement).value;
                  handleSaveVisitDetails(selectedLead.id, visitVal, reminderVal);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-cyan-400 border border-cyan-500/30"
              >
                Save Schedule Timestamps
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Conversation Log</label>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3 pr-1">
                {(selectedLead.notes || []).map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span className="font-semibold text-zinc-400">{n.author || 'System'}</span>
                      <span>{n.timestamp || ''}</span>
                    </div>
                    <p className="text-zinc-300">{n.text || ''}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record customer response..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button onClick={() => handleAddNote(selectedLead.id)} className="p-2.5 rounded-xl bg-cyan-500 text-black">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end p-0 sm:p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full bg-zinc-800 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Customer Name *</label>
                <input type="text" required value={newLeadForm.name} onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Phone Number *</label>
                <input type="tel" required value={newLeadForm.phone} onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Device Model</label>
                  <input type="text" value={newLeadForm.device} onChange={e => setNewLeadForm({ ...newLeadForm, device: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Source</label>
                  <select value={newLeadForm.source} onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white">
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Meta Ad">Meta Ad</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Issue</label>
                <textarea rows={2} value={newLeadForm.issue} onChange={e => setNewLeadForm({ ...newLeadForm, issue: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white" />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg active:scale-[0.98]">
                Save to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
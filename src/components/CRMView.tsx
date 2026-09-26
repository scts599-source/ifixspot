import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, MessageSquare, Plus, Search, Filter, Calendar, 
  Clock, AlertCircle, CheckCircle2, ChevronRight, X, 
  LogOut, User, RefreshCw, Send, DollarSign
} from 'lucide-react';
import { Lead } from '../App';

interface CRMViewProps {
  onLogout: () => void;
}

const STORAGE_KEY = 'ifix_crm_leads';

const SEED_LEADS: Lead[] = [
  {
    id: 'LEAD-9021',
    name: 'Rahul Sharma',
    phone: '9845012345',
    device: 'iPhone 15 Pro',
    issue: 'Display blinking green lines after minor drop',
    source: 'Website Form',
    status: 'Visit Scheduled',
    visitDate: new Date(Date.now() + 3600000 * 3).toISOString().slice(0, 16),
    followUpReminder: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    notes: [
      { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), repName: 'Rep 1', text: 'Customer asked for original OEM display pricing. Confirmed visit today.' }
    ],
    estimatedCost: 28500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'LEAD-9022',
    name: 'Vikram Mehta',
    phone: '9880198765',
    device: 'MacBook Air M2',
    issue: 'Spilled coffee on keyboard, unit dead',
    source: 'WhatsApp',
    status: 'New',
    followUpReminder: new Date(Date.now() - 3600000).toISOString().slice(0, 16), // Overdue reminder
    notes: [
      { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), repName: 'Rep 2', text: 'Instructed customer not to charge the device.' }
    ],
    createdAt: new Date().toISOString()
  }
];

export default function CRMView({ onLogout }: CRMViewProps) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : SEED_LEADS;
  });

  const [activeTab, setActiveTab] = useState<'All' | 'FollowUpDue' | 'VisitScheduled' | 'Converted'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeRepName, setActiveRepName] = useState('Rep 1');
  const [newNoteText, setNewNoteText] = useState('');

  // Form State for Adding Leads
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    device: '',
    issue: '',
    source: 'WhatsApp' as Lead['source'],
    estimatedCost: ''
  });

  // Persist to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  // Periodic Reminder Scanner: Evaluates follow-ups due
  const dueReminders = useMemo(() => {
    const now = new Date().getTime();
    return leads.filter(l => {
      if (!l.followUpReminder || l.status === 'Converted' || l.status === 'Lost') return false;
      const reminderTime = new Date(l.followUpReminder).getTime();
      return reminderTime <= now;
    });
  }, [leads]);

  // Filtering Engine
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'FollowUpDue') {
        const now = new Date().getTime();
        return lead.followUpReminder && new Date(lead.followUpReminder).getTime() <= now;
      }
      if (activeTab === 'VisitScheduled') return lead.status === 'Visit Scheduled';
      if (activeTab === 'Converted') return lead.status === 'Converted';
      return true;
    });
  }, [leads, searchQuery, activeTab]);

  // Handlers
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const newEntry: Lead = {
      id: 'LEAD-' + Math.floor(1000 + Math.random() * 9000),
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      device: newLeadForm.device || 'Unspecified Device',
      issue: newLeadForm.issue || 'Diagnostic Required',
      source: newLeadForm.source,
      status: 'New',
      estimatedCost: newLeadForm.estimatedCost ? Number(newLeadForm.estimatedCost) : undefined,
      notes: [{
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        repName: activeRepName,
        text: 'Lead created manually via CRM.'
      }],
      createdAt: new Date().toISOString()
    };

    setLeads([newEntry, ...leads]);
    setIsAddModalOpen(false);
    setNewLeadForm({ name: '', phone: '', device: '', issue: '', source: 'WhatsApp', estimatedCost: '' });
  };

  const handleUpdateStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        // Fire Meta Purchase conversion trigger if converted
        if (newStatus === 'Converted') {
          fetch('/api/track-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: l.phone, value: l.estimatedCost || 5000, device: l.device })
          }).catch(() => {});
        }
        return {
          ...l,
          status: newStatus,
          notes: [...l.notes, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            repName: activeRepName,
            text: `Status updated to [${newStatus}]`
          }]
        };
      }
      return l;
    }));

    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddNote = (leadId: string) => {
    if (!newNoteText.trim()) return;
    const noteObj = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      repName: activeRepName,
      text: newNoteText.trim()
    };

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, noteObj] } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, notes: [...prev.notes, noteObj] } : null);
    }
    setNewNoteText('');
  };

  const handleSaveVisitDetails = (leadId: string, visitDate: string, reminderDate: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          visitDate: visitDate || l.visitDate,
          followUpReminder: reminderDate || l.followUpReminder,
          status: visitDate ? 'Visit Scheduled' : l.status,
          notes: [...l.notes, {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            repName: activeRepName,
            text: `Scheduled visit for ${visitDate || 'N/A'}. Reminder set for ${reminderDate || 'N/A'}.`
          }]
        };
      }
      return l;
    }));
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h1 className="text-base font-bold tracking-tight text-white">iFixSpot CRM</h1>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={activeRepName}
            onChange={(e) => setActiveRepName(e.target.value)}
            className="bg-zinc-800 text-xs text-zinc-300 py-1.5 px-2.5 rounded-lg border border-zinc-700 focus:outline-none"
          >
            <option value="Rep 1">Rep 1 (Kalyan Nagar)</option>
            <option value="Rep 2">Rep 2 (Remote)</option>
          </select>

          <button 
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60 border border-zinc-700/60"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Follow-Up Due Notification Banner */}
      {dueReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce" />
            <span><strong>{dueReminders.length} follow-up(s)</strong> require immediate client contact.</span>
          </div>
          <button 
            onClick={() => setActiveTab('FollowUpDue')}
            className="underline font-semibold text-amber-300"
          >
            View List
          </button>
        </div>
      )}

      {/* Controls: Search, Quick Metrics & Tabs */}
      <section className="p-4 space-y-3 bg-zinc-900/30 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, device, issue..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Scroll Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'All', label: `All (${leads.length})` },
            { id: 'FollowUpDue', label: `Due (${dueReminders.length})`, highlight: dueReminders.length > 0 },
            { id: 'VisitScheduled', label: 'Visits' },
            { id: 'Converted', label: 'Converted' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20'
                  : tab.highlight
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Lead Stream List */}
      <div className="flex-1 p-4 space-y-3 pb-24 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            No leads found matching your criteria.
          </div>
        ) : (
          filteredLeads.map(lead => {
            const isDue = lead.followUpReminder && new Date(lead.followUpReminder).getTime() <= Date.now();
            return (
              <div 
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-2xl bg-zinc-900 border transition-all active:scale-[0.99] cursor-pointer ${
                  isDue && lead.status !== 'Converted'
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">{lead.id} • {lead.source}</span>
                    <h3 className="text-base font-bold text-zinc-100">{lead.name}</h3>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                    lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    lead.status === 'Visit Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    lead.status === 'New' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 font-medium mb-1">
                  {lead.device} — <span className="text-zinc-400 font-normal">{lead.issue}</span>
                </div>

                {lead.visitDate && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 bg-blue-500/10 px-2.5 py-1 rounded-lg w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Visit: {new Date(lead.visitDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                )}

                {/* Quick Touch CTA Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                  <a 
                    href={`tel:${lead.phone}`}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 text-zinc-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Call
                  </a>

                  <a 
                    href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, this is iFixSpot Kalyan Nagar. We received your diagnostic request for your ${lead.device}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 text-emerald-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp
                  </a>

                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Persistent Bottom Bar with 1-Tap 'Add Lead' */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-zinc-950/95 to-transparent z-30">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Lead
        </button>
      </div>

      {/* Modal 1: Lead Detail, Visit Scheduler & Rep Notes Bottom Sheet */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-500">{selectedLead.id}</span>
                <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedLead.phone} • {selectedLead.device}</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Buttons */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Update Stage</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['New', 'Contacted', 'Visit Scheduled', 'In Progress', 'Converted', 'Lost'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedLead.id, status)}
                    className={`py-2 rounded-xl font-medium border ${
                      selectedLead.status === status
                        ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit & Follow-Up Timestamps */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Schedule Visit & Follow-Up Alert
              </h4>
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400">Scheduled Visit Date & Time</label>
                <input 
                  type="datetime-local"
                  defaultValue={selectedLead.visitDate || ''}
                  id="modalVisitDateInput"
                  className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400">Follow-Up Alert Trigger</label>
                <input 
                  type="datetime-local"
                  defaultValue={selectedLead.followUpReminder || ''}
                  id="modalReminderDateInput"
                  className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                onClick={() => {
                  const visitVal = (document.getElementById('modalVisitDateInput') as HTMLInputElement).value;
                  const reminderVal = (document.getElementById('modalReminderDateInput') as HTMLInputElement).value;
                  handleSaveVisitDetails(selectedLead.id, visitVal, reminderVal);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-cyan-400 border border-cyan-500/30"
              >
                Save Schedule Timestamps
              </button>
            </div>

            {/* Note Logging History */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2">Customer Conversation Log</label>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3 pr-1">
                {selectedLead.notes.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span className="font-semibold text-zinc-400">{n.repName}</span>
                      <span>{n.timestamp}</span>
                    </div>
                    <p className="text-zinc-300">{n.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record customer response (e.g. will arrive 4 PM)..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => handleAddNote(selectedLead.id)}
                  className="p-2.5 rounded-xl bg-cyan-500 text-black font-semibold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Manual Lead Entry Bottom Sheet */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Lead</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Customer Full Name *</label>
                <input 
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Ramesh"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Phone Number *</label>
                <input 
                  type="tel"
                  required
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="e.g. 9845012345"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Device Model</label>
                  <input 
                    type="text"
                    value={newLeadForm.device}
                    onChange={e => setNewLeadForm({ ...newLeadForm, device: e.target.value })}
                    placeholder="e.g. iPhone 14 Pro"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Source</label>
                  <select 
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Meta Ad">Meta Ad</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Issue / Service Required</label>
                <textarea 
                  rows={2}
                  value={newLeadForm.issue}
                  onChange={e => setNewLeadForm({ ...newLeadForm, issue: e.target.value })}
                  placeholder="e.g. Screen replacement, audio jack issue..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
              >
                Save & Open Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
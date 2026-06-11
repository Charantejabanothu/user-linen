import React, { useState } from 'react';
import { LinenAsset, Employee, LinenRequestTicket, LinenCategory, UrgencyLevel } from '../types';
import { WorkflowProgress } from './WorkflowProgress';
import { 
  Plus, Calendar, Layers, ShieldCheck, Clipboard, AlertTriangle, 
  RotateCcw, Info, Send, User, ChevronRight, Activity, Trash, Sparkles
} from 'lucide-react';

interface UserDashboardProps {
  assets: LinenAsset[];
  tickets: LinenRequestTicket[];
  employees: Employee[];
  activeUser: Employee;
  onSwitchUser: (empId: string) => void;
  onCreateTicket: (category: LinenCategory, quantity: number, urgency: UrgencyLevel, notes: string) => void;
  onReportIssue: (assetId: string, issue: string) => void;
  onReturnAsset: (assetId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  assets,
  tickets,
  employees,
  activeUser,
  onSwitchUser,
  onCreateTicket,
  onReportIssue,
  onReturnAsset,
}) => {
  // Navigation & Local State
  const [activeTab, setActiveTab] = useState<'overview' | 'new-request' | 'my-tickets' | 'my-inventory'>('overview');
  
  // Ticket Creation Form states
  const [newCategory, setNewCategory] = useState<LinenCategory>('Bed Sheet');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('Medium');
  const [newNotes, setNewNotes] = useState<string>('');
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Return and Issue Reporting Modals
  const [reportingAsset, setReportingAsset] = useState<LinenAsset | null>(null);
  const [issueText, setIssueText] = useState<string>('');
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);

  const [selectedTicketForFlow, setSelectedTicketForFlow] = useState<LinenRequestTicket | null>(
    tickets.find(t => t.requesterId === activeUser.id) || null
  );

  // Filter lists by current active user's department & identity
  const departmentAssets = assets.filter(asset => asset.department === activeUser.department && asset.status === 'Assigned');
  const userTickets = tickets.filter(t => t.requesterId === activeUser.id);
  const pendingUserTickets = userTickets.filter(t => t.status !== 'Completed' && t.status !== 'Closed');

  // Submit new ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity <= 0) return;
    
    onCreateTicket(newCategory, newQuantity, newUrgency, newNotes);
    
    // Clear & show success state
    setNewQuantity(1);
    setNewNotes('');
    setTicketSuccess('Linen request ticket generated successfully! Sent to admin review.');
    setTimeout(() => setTicketSuccess(null), 5000);
    setActiveTab('my-tickets');
  };

  // Trigger return
  const handleReturnAction = (assetId: string) => {
    onReturnAsset(assetId);
    setIssueSuccess(`Asset ${assetId} flagged for laundry return. Expected turnover triggered.`);
    setTimeout(() => setIssueSuccess(null), 4000);
  };

  // Trigger issue modal
  const handleOpenIssueModal = (asset: LinenAsset) => {
    setReportingAsset(asset);
    setIssueText('');
  };

  const handleSubmitIssue = () => {
    if (!reportingAsset || !issueText.trim()) return;
    onReportIssue(reportingAsset.id, issueText);
    setIssueSuccess(`Condition issue for ${reportingAsset.id} reported. Admin will evaluate replacement.`);
    setReportingAsset(null);
    setTimeout(() => setIssueSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Rail */}
      <div id="user-persona-selector-card" className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full border-2 border-teal-600 overflow-hidden bg-teal-100 flex items-center justify-center shrink-0">
            {activeUser.avatarUrl ? (
              <img src={activeUser.avatarUrl} alt={activeUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-teal-700 w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-slate-800 text-lg leading-tight">{activeUser.name}</h2>
              <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                {activeUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Assigned Ward: <span className="text-teal-700 font-medium">{activeUser.department}</span> | {activeUser.email}
            </p>
          </div>
        </div>

        {/* Dynamic Staff Swapper */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Switch Staff Role:</label>
          <select 
            id="staff-picker"
            className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
            value={activeUser.id}
            onChange={(e) => {
              onSwitchUser(e.target.value);
              // Also update default selected ticket reference to avoid mismatch
              const newTickets = tickets.filter(t => t.requesterId === e.target.value);
              setSelectedTicketForFlow(newTickets[0] || null);
            }}
          >
            {employees.filter(emp => emp.role === 'Staff').map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Banner */}
      {issueSuccess && (
        <div id="issue-toast-notification" className="bg-teal-50 border border-teal-200 text-teal-800 py-3.5 px-4 rounded-xl text-sm flex items-center gap-3 shadow-xs animate-fadeIn">
          <span className="p-1 rounded-full bg-teal-100 text-teal-700">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <span className="font-semibold">Action Registered:</span> {issueSuccess}
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div id="user-navbar-tabs" className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button 
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview' 
              ? 'bg-teal-700 text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Ward Overview
        </button>
        <button 
          id="tab-new-request"
          onClick={() => setActiveTab('new-request')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'new-request' 
              ? 'bg-teal-700 text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Request New Linen
        </button>
        <button 
          id="tab-my-tickets"
          onClick={() => setActiveTab('my-tickets')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'my-tickets' 
              ? 'bg-teal-700 text-white shadow-xs font-semibold' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          Linen Ticket Tracker 
          {pendingUserTickets.length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
              {pendingUserTickets.length}
            </span>
          )}
        </button>
        <button 
          id="tab-my-inventory"
          onClick={() => setActiveTab('my-inventory')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'my-inventory' 
              ? 'bg-teal-700 text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Ward Linen Assets ({departmentAssets.length})
        </button>
      </div>

      {/* Main Views Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        
        {/* VIEW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div id="stat-assigned" className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Active Ward Linens</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{departmentAssets.length} <span className="text-xs font-normal text-slate-500">items</span></div>
                </div>
              </div>

              <div id="stat-pending" className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-500">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Requested / Pending</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{pendingUserTickets.length} <span className="text-xs font-normal text-slate-500">tickets</span></div>
                </div>
              </div>

              <div id="stat-health" className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Linen Health Score</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">
                    {departmentAssets.length > 0 
                      ? Math.round((departmentAssets.filter(a => a.condition === 'New' || a.condition === 'Good').length / departmentAssets.length) * 100)
                      : 100}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Create Request Prompt Card */}
              <div className="p-5 rounded-2xl border border-teal-50 bg-teal-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-display">Need Immediate Linen Supplies?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Create clean, autoclaved replacements for bedsheets, surgical gowns, pillowcases, or heavy fleece therapeutic blankets. Standard turnaround for ICU and Emergency is priority dispatched automatically.
                  </p>
                </div>
                <button 
                  id="user-quick-create-btn"
                  onClick={() => setActiveTab('new-request')}
                  className="mt-6 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 self-start transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Compose Linen Request Form
                </button>
              </div>

              {/* Right Column: Mini usage level guideline */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm mb-2">Replenishment Guidelines</h3>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Bed Sheet Turnover</span>
                      <span className="font-mono font-semibold text-slate-700">Every 12-24 Hours</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Surgical Towel Priority</span>
                      <span className="font-mono font-bold text-rose-600">Autoclave Pre-assigned</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Washed Cycle Threshold</span>
                      <span className="font-mono font-semibold text-slate-700">Max 50 Uses (Then Retired)</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-4">
                  <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  Your department uses digital tokens. All activity and issue logs are cryptographically assigned.
                </div>
              </div>
            </div>

            {/* Currently Active Flow visualizer */}
            <div className="p-5 border border-slate-100 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Interactive Live Ticket Workflow</h3>
                  <p className="text-xs text-slate-400">Select any ticket to view active logistics steps and fulfillment</p>
                </div>
                {userTickets.length > 0 && (
                  <select 
                    id="ticket-workflow-selector"
                    className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
                    value={selectedTicketForFlow?.id || ''}
                    onChange={(e) => {
                      const found = tickets.find(t => t.id === e.target.value);
                      if (found) setSelectedTicketForFlow(found);
                    }}
                  >
                    {userTickets.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} - {t.linenType} ({t.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedTicketForFlow ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500">Ticket Ref:</span> <span className="font-mono font-bold text-slate-800">{selectedTicketForFlow.id}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-slate-500">Linen:</span> <span className="font-semibold text-teal-800">{selectedTicketForFlow.linenType} (x{selectedTicketForFlow.quantity})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 mr-1.5 font-mono">{selectedTicketForFlow.dateCreated}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedTicketForFlow.urgency === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        selectedTicketForFlow.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}>
                        {selectedTicketForFlow.urgency} Urgency
                      </span>
                    </div>
                  </div>
                  
                  <WorkflowProgress status={selectedTicketForFlow.status} />

                  {selectedTicketForFlow.status === 'Completed' && (
                    <div className="text-xs text-center text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg font-medium">
                      ✓ This supply has arrived at {selectedTicketForFlow.department}. Assets have been added to your local inventory list.
                    </div>
                  )}
                  {selectedTicketForFlow.status === 'Rejected' && (
                    <div className="text-xs text-center text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-medium">
                      ✕ This request has been rejected. Reason: Admin noted ample existing supply or improper classification. Please consult Logistics.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl">
                  No active tickets raised on record. Click 'Request New Linen' above to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: NEW REQUEST FORM */}
        {activeTab === 'new-request' && (
          <div>
            <div className="pb-4 mb-6 border-b border-slate-100">
              <h3 className="font-display font-semibold text-slate-800 text-lg">Raise Linen Request Ticket</h3>
              <p className="text-xs text-slate-400">Generate structured digital tickets automatically dispatched for Logistics administrative review.</p>
            </div>

            {ticketSuccess && (
              <div id="new-ticket-success-message" className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
                ✓ {ticketSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} id="linen-request-form" className="space-y-5 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Linen Type Required</label>
                  <select 
                    id="form-linen-type"
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as LinenCategory)}
                  >
                    <option value="Bed Sheet">Bed Sheet</option>
                    <option value="Pillow Cover">Pillow Cover</option>
                    <option value="Patient Gown">Patient Gown</option>
                    <option value="Surgical Towel">Surgical Towel</option>
                    <option value="Blanket">Blanket</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Requested Quantity</label>
                  <input 
                    id="form-quantity"
                    type="number" 
                    min="1" 
                    max="15"
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono font-semibold"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Urgency Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Medium', 'High'] as UrgencyLevel[]).map(level => {
                    const isSelected = newUrgency === level;
                    return (
                      <button 
                        key={level}
                        id={`urgency-${level.toLowerCase()}-btn`}
                        type="button"
                        onClick={() => setNewUrgency(level)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected 
                            ? level === 'High' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' :
                              level === 'Medium' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' :
                              'bg-slate-700 text-white border-slate-705 shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {level} Priority
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Clinical Notes & Justification (Optional)</label>
                <textarea 
                  id="form-notes"
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed"
                  placeholder="Provide any additional ward notes like 'Autoclave specifications', 'Isolation precautions required', etc."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-500 leading-normal">
                  By clicking Submit, a digital ticket is generated and tracked under your department record (<span className="font-semibold">{activeUser.department}</span>). The Logistics Admin will immediately match available assets to dispatch this delivery.
                </div>
              </div>

              <button 
                id="submit-request-ticket-btn"
                type="submit"
                className="w-full md:w-auto inline-flex items-center justify-center gap-1 px-6 py-3 bg-teal-700 text-white font-semibold rounded-xl text-xs hover:bg-teal-800 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Generate Digital Ticket
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: TICKET TRACKER */}
        {activeTab === 'my-tickets' && (
          <div>
            <div className="pb-4 mb-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-sm">Raise / Track Department Tickets</h3>
                <p className="text-xs text-slate-400">View and track real-time fulfillment progress on the hospital supply chain.</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                Logged Tickets: {userTickets.length}
              </span>
            </div>

            {userTickets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-slate-50/50 rounded-xl">
                No tickets placed from your ward. Try raising one in the 'Request New Linen' tab.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTickets.map(ticket => {
                    const isSelected = selectedTicketForFlow?.id === ticket.id;
                    return (
                      <div 
                        key={ticket.id}
                        id={`ticket-card-${ticket.id}`}
                        onClick={() => setSelectedTicketForFlow(ticket)}
                        className={`p-4 rounded-xl border transition-all text-left cursor-pointer hover:shadow-xs group ${
                          isSelected 
                            ? 'bg-teal-50/30 border-teal-300 ring-1 ring-teal-200' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                              {ticket.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 block mt-1.5">
                              {ticket.linenType} (Qty: {ticket.quantity})
                            </span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            ticket.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            ticket.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            ticket.status === 'Processing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic">
                          "{ticket.notes || 'No custom notes provided'}"
                        </p>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                          <span className="font-mono">{ticket.dateCreated}</span>
                          <span className="text-teal-700 font-medium group-hover:underline flex items-center gap-0.5">
                            Show Stepper Tracker <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Workflow stepper panel */}
                {selectedTicketForFlow && (
                  <div className="mt-6 p-5 border border-slate-100 rounded-2xl bg-slate-50/20">
                    <h4 className="text-xs font-semibold text-slate-700 mb-4 font-display">
                      Workflow Lifecycle Path for Ticket <span className="font-mono font-bold text-teal-800">{selectedTicketForFlow.id}</span>
                    </h4>
                    <WorkflowProgress status={selectedTicketForFlow.status} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: WARD INVENTORY */}
        {activeTab === 'my-inventory' && (
          <div>
            <div className="pb-4 mb-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-sm">Assigned Ward Assets</h3>
                <p className="text-xs text-slate-400">Linens currently assigned for clinical use inside {activeUser.department}</p>
              </div>
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-1 rounded">
                Active Count: {departmentAssets.length}
              </span>
            </div>

            {departmentAssets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-slate-50/50 rounded-xl">
                No active linens on record for your ward. Admin must approve and dispatch your raised tickets for items to arrive here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/70">
                      <th className="py-2.5 px-3">Asset ID</th>
                      <th className="py-2.5 px-3">Linen Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Usage Count</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentAssets.map(asset => (
                      <tr key={asset.id} id={`user-asset-${asset.id}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600">{asset.id}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{asset.name}</td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                            {asset.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            asset.condition === 'New' ? 'bg-emerald-50 text-emerald-700 font-semibold' :
                            asset.condition === 'Good' ? 'bg-teal-50 text-teal-700' :
                            asset.condition === 'Worn' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700 font-semibold'
                          }`}>
                            {asset.condition}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{asset.usageCount} cycles</td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex gap-2">
                            <button 
                              id={`return-btn-${asset.id}`}
                              onClick={() => handleReturnAction(asset.id)}
                              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 text-teal-700 font-semibold border border-teal-200 hover:bg-teal-50 rounded transition-all"
                              title="Request asset laundry delivery return"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Return Asset
                            </button>
                            <button 
                              id={`issue-btn-${asset.id}`}
                              onClick={() => handleOpenIssueModal(asset)}
                              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 text-slate-600 font-medium border border-slate-200 hover:bg-slate-100 rounded transition-all"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Report Issue
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* REPORT ISSUE COMPANION MODAL */}
      {reportingAsset && (
        <div id="quick-issue-modal" className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-semibold text-slate-800 text-lg">Report Asset Defect / Damage</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trigger damage notifications for asset: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded">{reportingAsset.id}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold block">Select / Detail Issue Description</label>
              <textarea 
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-250 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="E.g., Stained with autoclave fluid, torn corner hem, frayed snaps, replace required."
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button 
                id="cancel-issue-btn"
                onClick={() => setReportingAsset(null)}
                className="px-3.5 py-2 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                id="confirm-submit-issue-btn"
                onClick={handleSubmitIssue}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                Submit Inspection Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

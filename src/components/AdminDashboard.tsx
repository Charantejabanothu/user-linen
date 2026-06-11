import React, { useState } from 'react';
import { LinenAsset, Employee, LinenRequestTicket, LaundryBatch, LinenCategory, AssetStatus, AssetCondition, UrgencyLevel, TicketStatus } from '../types';
import { 
  Layers, UserCheck, AlertCircle, Plus, Edit, Trash2, CheckCircle2, 
  XCircle, Play, Users, Check, RefreshCw, BarChart3, Search, Filter, 
  Settings, Award, HeartHandshake, Info, ShieldAlert, ArrowRight, UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  assets: LinenAsset[];
  tickets: LinenRequestTicket[];
  employees: Employee[];
  laundryBatches: LaundryBatch[];
  onAddAsset: (name: string, category: LinenCategory, condition: AssetCondition) => void;
  onUpdateAsset: (assetId: string, updates: Partial<LinenAsset>) => void;
  onDeleteAsset: (assetId: string) => void;
  onAssignAsset: (assetId: string, employeeId: string) => void;
  onReviewTicket: (ticketId: string, decision: 'Approved' | 'Rejected', assetIds?: string[]) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAddEmployee: (name: string, department: string, email: string, phone: string, role: 'Admin' | 'Staff') => void;
  onTriggerAutomatedLaundry: (category: LinenCategory) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  assets,
  tickets,
  employees,
  laundryBatches,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAssignAsset,
  onReviewTicket,
  onUpdateTicketStatus,
  onAddEmployee,
  onTriggerAutomatedLaundry,
}) => {
  // Navigation
  const [adminTab, setAdminTab] = useState<'overview' | 'assets' | 'tickets' | 'staff' | 'replenish'>('overview');

  // Search and Filters
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCatFilter, setAssetCatFilter] = useState<string>('All');
  const [assetStatusFilter, setAssetStatusFilter] = useState<string>('All');

  // Add Asset Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCat, setNewAssetCat] = useState<LinenCategory>('Bed Sheet');
  const [newAssetCond, setNewAssetCond] = useState<AssetCondition>('New');

  // Assign Asset Form state
  const [assigningAsset, setAssigningAsset] = useState<LinenAsset | null>(null);
  const [assigneeId, setAssigneeId] = useState('');

  // Update Asset inline helper
  const [editingAsset, setEditingAsset] = useState<LinenAsset | null>(null);
  const [editStatus, setEditStatus] = useState<AssetStatus>('Available');
  const [editCondition, setEditCondition] = useState<AssetCondition>('New');

  // Ticket fulfillment selection helper
  const [reviewingTicket, setReviewingTicket] = useState<LinenRequestTicket | null>(null);
  const [ticketReviewType, setTicketReviewType] = useState<'Approved' | 'Rejected'>('Approved');
  const [selectedAssetIdsToBind, setSelectedAssetIdsToBind] = useState<string[]>([]);

  // Add Employee Form state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('ICU');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<'Admin' | 'Staff'>('Staff');

  // Notifications
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const displayToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 4000);
  };

  // Automated inventory checks
  // Critically low categories (under 3 available in stock)
  const categories: LinenCategory[] = ['Bed Sheet', 'Pillow Cover', 'Patient Gown', 'Surgical Towel', 'Blanket'];
  const inventoryLevelSummary = categories.map(cat => {
    const total = assets.filter(a => a.category === cat).length;
    const available = assets.filter(a => a.category === cat && a.status === 'Available').length;
    const inLaundry = assets.filter(a => a.category === cat && a.status === 'In Laundry').length;
    return { category: cat, total, available, inLaundry, isCritical: available < 2 };
  });

  const criticalIssuesCount = inventoryLevelSummary.filter(item => item.isCritical).length;

  // Real-time chart calculations
  const totalAssetsCount = assets.length;
  const assignedAssetsCount = assets.filter(a => a.status === 'Assigned').length;
  const inLaundryCount = assets.filter(a => a.status === 'In Laundry').length;
  const repairingCount = assets.filter(a => a.status === 'Repairing').length;
  const availableCount = assets.filter(a => a.status === 'Available').length;

  const conditionNew = assets.filter(a => a.condition === 'New').length;
  const conditionGood = assets.filter(a => a.condition === 'Good').length;
  const conditionWorn = assets.filter(a => a.condition === 'Worn').length;
  const conditionDamaged = assets.filter(a => a.condition === 'Damaged').length;

  const icuAllocCount = assets.filter(a => a.department === 'ICU').length;
  const erAllocCount = assets.filter(a => a.department === 'Emergency Ward').length;
  const pedsAllocCount = assets.filter(a => a.department === 'Pediatrics').length;
  const surgAllocCount = assets.filter(a => a.department === 'Surgery').length;

  // Filter Assets for display
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(assetSearch.toLowerCase()) || asset.id.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesCategory = assetCatFilter === 'All' || asset.category === assetCatFilter;
    const matchesStatus = assetStatusFilter === 'All' || asset.status === assetStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Add Asset Submission
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    onAddAsset(newAssetName, newAssetCat, newAssetCond);
    setNewAssetName('');
    setShowAddModal(false);
    displayToast(`Added new asset "${newAssetName}" to systems.`);
  };

  // Handle Employee Creation
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpEmail.trim()) return;
    onAddEmployee(newEmpName, newEmpDept, newEmpEmail, newEmpPhone, newEmpRole);
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpPhone('');
    setShowAddEmpModal(false);
    displayToast(`Registered staff profile for "${newEmpName}".`);
  };

  // Trigger laundry dispatch
  const handleLaundryDispatch = (category: LinenCategory) => {
    onTriggerAutomatedLaundry(category);
    displayToast(`Dispatched automated bulk laundry replenishment for Category: "${category}".`);
  };

  // Open ticket review bindings
  const handleOpenTicketReview = (t: LinenRequestTicket, type: 'Approved' | 'Rejected') => {
    setReviewingTicket(t);
    setTicketReviewType(type);
    setSelectedAssetIdsToBind([]);
  };

  // Bind/Toggle asset match to ticket
  const toggleAssetToTicket = (id: string, requestedLimit: number) => {
    if (selectedAssetIdsToBind.includes(id)) {
      setSelectedAssetIdsToBind(selectedAssetIdsToBind.filter(aId => aId !== id));
    } else {
      if (selectedAssetIdsToBind.length < requestedLimit) {
        setSelectedAssetIdsToBind([...selectedAssetIdsToBind, id]);
      } else {
        displayToast(`Cannot bind more than ${requestedLimit} required asset items.`);
      }
    }
  };

  // Perform review decision
  const handleSubmitTicketReview = () => {
    if (!reviewingTicket) return;
    
    if (ticketReviewType === 'Approved') {
      if (selectedAssetIdsToBind.length === 0 && reviewingTicket.quantity > 0) {
        displayToast('Please bind at least one available asset item to fulfill order.');
        return;
      }
      onReviewTicket(reviewingTicket.id, 'Approved', selectedAssetIdsToBind);
      displayToast(`Approved Ticket ${reviewingTicket.id}. Assigned ${selectedAssetIdsToBind.length} physical assets.`);
    } else {
      onReviewTicket(reviewingTicket.id, 'Rejected');
      displayToast(`Rejected Ticket ${reviewingTicket.id}. Request archived.`);
    }
    
    setReviewingTicket(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {adminToast && (
        <div id="admin-action-toast" className="bg-slate-900 border border-slate-705 text-teal-400 py-3.5 px-4 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>[LOG_CONFIRMED]: {adminToast}</span>
          </div>
          <button onClick={() => setAdminToast(null)} className="text-slate-400 hover:text-white px-2">Close</button>
        </div>
      )}

      {/* Admin Panel Welcome banner */}
      <div id="admin-welcome-hero" className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-0" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase tracking-widest font-semibold">
              <Settings className="w-4 h-4" />
              Administrative Command Center
            </div>
            <h2 className="font-display font-semibold text-2xl mt-1.5">Linen Operations Dashboard</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Track multi-department stock distribution, evaluate autoclaved rotation telemetry, regulate staff, and manage replenishment ticket queues.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              id="admin-add-asset-btn"
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Linen Asset
            </button>
            <button 
              id="admin-add-staff-btn"
              onClick={() => setShowAddEmpModal(true)}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium py-2 px-3.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Register Staff
            </button>
          </div>
        </div>
      </div>

      {/* Admin Sub navbar */}
      <div id="admin-tabs" className="flex border-b border-slate-200 overflow-x-auto gap-1 pb-px">
        <button 
          id="admin-tab-overview"
          onClick={() => setAdminTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'overview' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Telemetry & Supply Chain Reports
        </button>
        <button 
          id="admin-tab-assets"
          onClick={() => setAdminTab('assets')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'assets' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Linen Assets Register ({assets.length})
        </button>
        <button 
          id="admin-tab-tickets"
          onClick={() => setAdminTab('tickets')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'tickets' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Workflow Tickets Queue ({tickets.filter(t => t.status !== 'Closed').length})
        </button>
        <button 
          id="admin-tab-staff"
          onClick={() => setAdminTab('staff')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'staff' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Management ({employees.length})
        </button>
        <button 
          id="admin-tab-replenish"
          onClick={() => setAdminTab('replenish')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'replenish' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Automated Replenishment Ratios
          {criticalIssuesCount > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full ml-1">
              {criticalIssuesCount} ALERT
            </span>
          )}
        </button>
      </div>

      {/* ADMIN PANELS VIEWS CONTAINER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6">

        {/* ADMIN TAB 1: OPERATIONS TELEMETRY & REPORTS */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div id="metric-total" className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Total Inventory</div>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalAssetsCount} items</div>
              </div>
              <div id="metric-available" className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Available Stock</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">{availableCount} items</div>
              </div>
              <div id="metric-assigned" className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">In Active Wards</div>
                <div className="text-xl font-bold text-teal-700 mt-1">{assignedAssetsCount} items</div>
              </div>
              <div id="metric-laundry" className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Laundering Cycle</div>
                <div className="text-xl font-bold text-indigo-600 mt-1">{inLaundryCount} items</div>
              </div>
              <div id="metric-damaged" className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Repairing/Discarded</div>
                <div className="text-xl font-bold text-rose-600 mt-1">{repairingCount + assets.filter(a=>a.status==='Discarded').length} items</div>
              </div>
            </div>

            {/* High Fidelity Visual Reports using pure-SVG Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Report Chart A: Condition Integrity */}
              <div className="p-5 border border-slate-100 rounded-2xl space-y-4 shadow-3xs">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Asset Condition Integrity Report</h3>
                  <p className="text-[11px] text-slate-400">Proportional representation of physical health ratings across 100% of stock.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Grey Base */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                      
                      {/* Active slices */}
                      {/* S1: New - Teal */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0d9488" strokeWidth="12" 
                        strokeDasharray={`${(conditionNew / totalAssetsCount) * 251.2} 251.2`} 
                        strokeDashoffset={0} />
                      
                      {/* S2: Good - Emerald */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" 
                        strokeDasharray={`${(conditionGood / totalAssetsCount) * 251.2} 251.2`} 
                        strokeDashoffset={`-${(conditionNew / totalAssetsCount) * 251.2}`} />

                      {/* S3: Worn - Amber */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" 
                        strokeDasharray={`${(conditionWorn / totalAssetsCount) * 251.2} 251.2`} 
                        strokeDashoffset={`-${((conditionNew + conditionGood) / totalAssetsCount) * 251.2}`} />

                      {/* S4: Damaged - Rose */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" 
                        strokeDasharray={`${(conditionDamaged / totalAssetsCount) * 251.2} 251.2`} 
                        strokeDashoffset={`-${((conditionNew + conditionGood + conditionWorn) / totalAssetsCount) * 251.2}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-slate-800">{totalAssetsCount}</span>
                      <span className="text-[9px] text-slate-400 font-medium">TOTAL LINENS</span>
                    </div>
                  </div>

                  {/* Legends & Percs */}
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block" />
                        <span className="text-slate-600">New (Unblemished)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{conditionNew} ({Math.round((conditionNew/totalAssetsCount)*100)}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                        <span className="text-slate-600">Good Status</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{conditionGood} ({Math.round((conditionGood/totalAssetsCount)*100)}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                        <span className="text-slate-600">Worn (Near Laundry Cycle)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{conditionWorn} ({Math.round((conditionWorn/totalAssetsCount)*100)}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                        <span className="text-slate-600">Damaged (Quarantined)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{conditionDamaged} ({Math.round((conditionDamaged/totalAssetsCount)*100)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Chart B: Department Stock Allocations */}
              <div className="p-5 border border-slate-100 rounded-2xl space-y-4 shadow-3xs">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Department Logistics Allocation</h3>
                  <p className="text-[11px] text-slate-400">Total assigned pieces matched and located within active medical wards.</p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {[
                    { dept: 'ICU', count: icuAllocCount, max: 8, color: 'bg-teal-600' },
                    { dept: 'Emergency Ward', count: erAllocCount, max: 8, color: 'bg-indigo-600' },
                    { dept: 'Pediatrics', count: pedsAllocCount, max: 8, color: 'bg-emerald-600' },
                    { dept: 'Surgery', count: surgAllocCount, max: 8, color: 'bg-amber-500' },
                  ].map(spec => {
                    const percent = (spec.count / spec.max) * 100;
                    return (
                      <div key={spec.dept} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-medium">
                          <span className="text-slate-700">{spec.dept}</span>
                          <span className="font-mono text-slate-500 font-bold">{spec.count} units / {spec.max} max capacity</span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${spec.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Turnaround Supply Chain Efficiency Telemetry info */}
            <div className="p-5 bg-teal-50/10 border border-teal-50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider font-mono">SUPPLY CHAIN REPLENISHMENT STATISTIC</div>
                <h4 className="text-sm font-semibold text-slate-800">Hospital Sanitization Loop Turnaround: <span className="text-teal-700 font-mono">16.4 Hours</span></h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  Average time elapsed from physical ward return request, laundry transit, sterilization autoclave disinfection, and ultimate logistics restock.
                </p>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs shrink-0 flex items-center gap-2">
                <span className="p-1 px-2 rounded bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">98.2%</span>
                <span className="text-[10px] text-slate-500 font-medium">Sterile Compliance Rating</span>
              </div>
            </div>

          </div>
        )}

        {/* ADMIN TAB 2: LINEN ASSET DIRECTORY */}
        {adminTab === 'assets' && (
          <div className="space-y-6">
            
            {/* Search + Filter toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="asset-search-input"
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 placeholder:text-slate-400"
                  placeholder="Search assets by barcode serial, name..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                />
              </div>

              <div id="assets-filter-controls" className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  id="filter-category"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                  value={assetCatFilter}
                  onChange={(e) => setAssetCatFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Bed Sheet">Bed Sheets</option>
                  <option value="Pillow Cover">Pillow Covers</option>
                  <option value="Patient Gown">Patient Gowns</option>
                  <option value="Surgical Towel">Surgical Towels</option>
                  <option value="Blanket">Blankets</option>
                </select>

                <select 
                  id="filter-status"
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2-px py-2 focus:outline-none"
                  value={assetStatusFilter}
                  onChange={(e) => setAssetStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Laundry">In Laundry</option>
                  <option value="Repairing">Repairing</option>
                  <option value="Discarded">Discarded</option>
                </select>
              </div>
            </div>

            {/* Asset Table Listing */}
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-xl">
                No linen assets match the select filters or query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/70">
                      <th className="py-2.5 px-3">Serial Barcode</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Usage Count</th>
                      <th className="py-2.5 px-3">Assigned Location</th>
                      <th className="py-2.5 px-3 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(asset => {
                      const isEditing = editingAsset?.id === asset.id;
                      const isAssigning = assigningAsset?.id === asset.id;
                      
                      return (
                        <tr key={asset.id} id={`admin-asset-${asset.id}`} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-800 select-all">{asset.id}</td>
                          <td className="py-3.5 px-3 font-medium text-slate-700">{asset.name}</td>
                          <td className="py-3.5 px-3">
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px]">
                              {asset.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {isEditing ? (
                              <select 
                                className="bg-white border rounded text-[11px] p-1 focus:outline-none"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as AssetStatus)}
                              >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Laundry">In Laundry</option>
                                <option value="Repairing">Repairing</option>
                                <option value="Discarded">Discarded</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                asset.status === 'Assigned' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                asset.status === 'In Laundry' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                asset.status === 'Repairing' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-slate-150 text-slate-600 border border-slate-200'
                              }`}>
                                {asset.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            {isEditing ? (
                              <select 
                                className="bg-white border rounded text-[11px] p-1 focus:outline-none"
                                value={editCondition}
                                onChange={(e) => setEditCondition(e.target.value as AssetCondition)}
                              >
                                <option value="New">New</option>
                                <option value="Good">Good</option>
                                <option value="Worn">Worn</option>
                                <option value="Damaged">Damaged</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                asset.condition === 'New' ? 'bg-emerald-50 text-emerald-700' :
                                asset.condition === 'Good' ? 'bg-teal-50 text-teal-600' :
                                asset.condition === 'Worn' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {asset.condition}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-500">{asset.usageCount} washes</td>
                          <td className="py-3.5 px-3">
                            <span className="text-slate-600 font-medium">
                              {asset.department || 'Ready Warehouse'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {isEditing ? (
                              <div className="inline-flex gap-1.5">
                                <button 
                                  id={`save-asset-${asset.id}`}
                                  onClick={() => {
                                    onUpdateAsset(asset.id, { status: editStatus, condition: editCondition });
                                    setEditingAsset(null);
                                    displayToast(`Updated metadata for asset: ${asset.id}`);
                                  }}
                                  className="text-[10px] font-bold text-white bg-teal-600 px-2 py-1 rounded"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingAsset(null)}
                                  className="text-[10px] font-semibold text-slate-500 px-2 py-1 hover:bg-slate-100 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : isAssigning ? (
                              <div className="inline-flex gap-1.5 items-center">
                                <select 
                                  id={`assignee-select-${asset.id}`}
                                  className="bg-white border text-[11px] p-1 rounded max-w-[110px]"
                                  value={assigneeId}
                                  onChange={(e) => setAssigneeId(e.target.value)}
                                >
                                  <option value="">Choose Employee</option>
                                  {employees.filter(emp => emp.role === 'Staff').map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.name} ({emp.department})
                                    </option>
                                  ))}
                                </select>
                                <button 
                                  id={`confirm-assign-${asset.id}`}
                                  onClick={() => {
                                    if (!assigneeId) return;
                                    onAssignAsset(asset.id, assigneeId);
                                    setAssigningAsset(null);
                                    setAssigneeId('');
                                    displayToast(`Assigned ${asset.id} directly to clinical employee.`);
                                  }}
                                  className="bg-slate-900 text-white rounded text-[10px] px-2 py-1 font-semibold"
                                >
                                  OK
                                </button>
                                <button 
                                  onClick={() => setAssigningAsset(null)}
                                  className="text-slate-400"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex gap-2">
                                <button 
                                  id={`edit-asset-btn-${asset.id}`}
                                  onClick={() => {
                                    setEditingAsset(asset);
                                    setEditStatus(asset.status);
                                    setEditCondition(asset.condition);
                                  }}
                                  className="text-slate-500 hover:text-slate-800"
                                  title="Edit asset properties"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {asset.status === 'Available' && (
                                  <button 
                                    id={`assign-asset-btn-${asset.id}`}
                                    onClick={() => {
                                      setAssigningAsset(asset);
                                      setAssigneeId('');
                                    }}
                                    className="text-teal-650 hover:text-teal-800 font-semibold text-[10px] bg-teal-50 px-2 py-0.5 rounded"
                                    title="Assign available item to employee"
                                  >
                                    Assign
                                  </button>
                                )}
                                <button 
                                  id={`delete-asset-btn-${asset.id}`}
                                  onClick={() => {
                                    if (confirm(`Confirm physical disposal and deletion of asset: ${asset.id}?`)) {
                                      onDeleteAsset(asset.id);
                                      displayToast(`Permanently deleted asset: ${asset.id}`);
                                    }
                                  }}
                                  className="text-rose-500 hover:text-rose-700"
                                  title="Permanently remove asset from grid"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB 3: WORKFLOW TICKETS QUEUE */}
        {adminTab === 'tickets' && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Review Ward Workflow Tickets</h3>
            <p className="text-xs text-slate-400 -mt-4">
              Move requests through the lifecycle: <span className="font-semibold text-teal-800">Review ➔ Decision (Approval/Rejection) ➔ Dispatched Processing ➔ Complete Delivery</span>.
            </p>

            {tickets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-xl">
                No tickets placed in history.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    id={`admin-ticket-row-${ticket.id}`}
                    className={`p-5 rounded-2xl border ${
                      ticket.status === 'Admin Review' ? 'border-amber-250 bg-amber-50/10' :
                      ticket.status === 'Ticket Generated' ? 'border-indigo-200 bg-indigo-50/10' :
                      'border-slate-100 bg-white'
                    } space-y-4`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            ticket.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            ticket.status === 'Processing' ? 'bg-blue-105 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            ticket.urgency === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {ticket.urgency} Urgency
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 pt-1">
                          Ward Department: <span className="text-teal-700 font-bold">{ticket.department}</span> | Requested By: <span className="text-slate-600 font-normal">{ticket.requesterName}</span>
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        Raised: {ticket.dateCreated}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-440 font-medium">Linen Needed:</span> <span className="font-bold text-slate-800">{ticket.linenType} (Qty: {ticket.quantity})</span>
                        {ticket.assignedAssetIds.length > 0 && (
                          <div className="mt-1.5">
                            <span className="text-slate-400 font-medium text-[11px]">Bound Asset Serials:</span>
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {ticket.assignedAssetIds.map(aId => (
                                <span key={aId} className="bg-teal-50 text-teal-800 font-mono text-[9px] px-1.5 py-0.5 rounded border border-teal-100">
                                  {aId}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Staff Justification Notes:</span>
                        <p className="italic text-slate-700 mt-1">"{ticket.notes || 'No notes left by requester'}"</p>
                      </div>
                    </div>

                    {/* Operational Commands depending on state */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        Move the request along the lifecycle milestones.
                      </div>

                      <div className="flex gap-2">
                        {/* 1. Review stage triggers */}
                        {ticket.status === 'Ticket Generated' && (
                          <button 
                            id={`move-review-${ticket.id}`}
                            onClick={() => {
                              onUpdateTicketStatus(ticket.id, 'Admin Review');
                              displayToast(`Ticket ${ticket.id} placed into Admin Active Audit.`);
                            }}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all"
                          >
                            Mark: Under Review
                          </button>
                        )}

                        {/* 2. Approve/Reject review options */}
                        {ticket.status === 'Admin Review' && (
                          <>
                            <button 
                              id={`approve-prompt-${ticket.id}`}
                              onClick={() => handleOpenTicketReview(ticket, 'Approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Approve & Match Inventory
                            </button>
                            <button 
                              id={`reject-prompt-${ticket.id}`}
                              onClick={() => handleOpenTicketReview(ticket, 'Rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Reject Request
                            </button>
                          </>
                        )}

                        {/* 3. Deliveries & Completion states */}
                        {ticket.status === 'Approved' && (
                          <button 
                            id={`mark-processing-${ticket.id}`}
                            onClick={() => {
                              onUpdateTicketStatus(ticket.id, 'Processing');
                              displayToast(`Linen order ${ticket.id} transitioned into transit/delivery cycles.`);
                            }}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Dispatch: Under Processing
                          </button>
                        )}

                        {ticket.status === 'Processing' && (
                          <button 
                            id={`complete-delivery-${ticket.id}`}
                            onClick={() => {
                              onUpdateTicketStatus(ticket.id, 'Completed');
                              displayToast(`Linen delivery successfully completed for ticket ${ticket.id}.`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Deliver & Close Ward Receipt
                          </button>
                        )}

                        {ticket.status === 'Completed' && (
                          <button 
                            id={`archive-ticket-${ticket.id}`}
                            onClick={() => {
                              onUpdateTicketStatus(ticket.id, 'Closed');
                              displayToast(`Ticket ${ticket.id} archived.`);
                            }}
                            className="bg-slate-700 hover:bg-slate-800 text-slate-100 font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Archive Log Row
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB 4: EMPLOYEE USERS PANEL */}
        {adminTab === 'staff' && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Staff Registries</h3>
            <p className="text-xs text-slate-400 -mt-4">
              Review certified staff access logs, contact channels, and ward clearance levels.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/70">
                    <th className="py-2.5 px-3">Staff Barcode</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role Status</th>
                    <th className="py-2.5 px-3">Primary Dept Clearance</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Contact Direct</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} id={`admin-staff-${emp.id}`} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{emp.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{emp.name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.role === 'Admin' ? 'bg-slate-900 text-white' : 'bg-teal-50 text-teal-800'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{emp.department}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{emp.email}</td>
                      <td className="py-2.5 px-3 text-slate-600">{emp.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN TAB 5: AUTOMATED REPLENISHMENT RATIOMETRICS */}
        {adminTab === 'replenish' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Automated Laundry & Stock replenishment ratios</h3>
              <p className="text-xs text-slate-400">
                Trigger replenishment protocols immediately if available linens in any division fall below threshold margins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left panel: Category levels check */}
              <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Current Live Levels</h4>
                <div className="space-y-3.5">
                  {inventoryLevelSummary.map(item => (
                    <div 
                      key={item.category} 
                      className={`p-3.5 rounded-xl border ${
                        item.isCritical 
                          ? 'bg-rose-50 border-rose-220 ring-1 ring-rose-100' 
                          : 'bg-white border-slate-100'
                      } flex justify-between items-center`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-850 flex items-center gap-2">
                          {item.category}
                          {item.isCritical && (
                            <span className="bg-rose-600 text-white font-bold text-[8px] px-1 py-0.5 rounded">
                              CRITICALLY LOW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Available: <span className="font-semibold text-slate-800">{item.available}</span> | Total: {item.total} | Laundry: {item.inLaundry}
                        </div>
                      </div>

                      {/* Manual Quick Laundering Dispatch Button */}
                      <button 
                        id={`dispatch-bulk-laundry-${item.category.replace(/\s+/g, '-')}`}
                        onClick={() => handleLaundryDispatch(item.category)}
                        className={`text-[10px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer ${
                          item.isCritical 
                            ? 'bg-rose-650 hover:bg-rose-700 text-white font-bold' 
                            : 'bg-teal-700 hover:bg-teal-800 text-white'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                        Trigger Laundry Replenish
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel: Active Laundry autoclaved batch transit queue */}
              <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Active Autoclave Sanitizer Batches ({laundryBatches.length})</h4>
                {laundryBatches.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 bg-white border rounded-xl">
                    No active bulk autoclave sanitization batches running.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {laundryBatches.map(batch => (
                      <div key={batch.id} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-slate-700">{batch.id}</span>
                          <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {batch.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <p className="text-slate-650">Laundering: <span className="font-bold text-slate-800">{batch.category} (x{batch.assetsCount} items)</span></p>
                            <p className="text-[10px] text-slate-400 mt-1">Ready Expected: {batch.expectedDelivery}</p>
                          </div>
                          
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* FULL MATCH MATCHING AND BINDING DIALOG MODAL (COMPLEX MATCHING RULE) */}
      {reviewingTicket && (
        <div id="full-matching-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-lg">
                  {ticketReviewType === 'Approved' ? 'Fulfill Linen Request with Stock Match' : 'Reject Linen Request'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ticket Ref: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded">{reviewingTicket.id}</span>
                </p>
              </div>
              <button onClick={() => setReviewingTicket(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕ Close</button>
            </div>

            {ticketReviewType === 'Approved' ? (
              <div className="space-y-4">
                
                <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-150 text-xs text-teal-900 space-y-1">
                  <div>Required: <span className="font-bold">{reviewingTicket.linenType} (Qty required: {reviewingTicket.quantity})</span></div>
                  <div>Department: <span className="font-semibold">{reviewingTicket.department}</span></div>
                  <div>Justification: <span className="italic">"{reviewingTicket.notes || 'None'}"</span></div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-550 block font-semibold">
                    Match Available Physical Inventory items ({selectedAssetIdsToBind.length} / {reviewingTicket.quantity} matched):
                  </label>

                  <div className="max-h-[190px] overflow-y-auto border border-slate-200 rounded-xl divide-y">
                    {assets.filter(a => a.category === reviewingTicket.linenType && a.status === 'Available').length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        ⚠ Out of stock. No available {reviewingTicket.linenType} in ready warehouse inventory. Please trigger Laundry Replenishment first inside the automated replenish workspace!
                      </div>
                    ) : (
                      assets.filter(a => a.category === reviewingTicket.linenType && a.status === 'Available').map(asset => {
                        const isBound = selectedAssetIdsToBind.includes(asset.id);
                        return (
                          <div 
                            key={asset.id} 
                            onClick={() => toggleAssetToTicket(asset.id, reviewingTicket.quantity)}
                            className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-all ${
                              isBound ? 'bg-teal-50/40 hover:bg-teal-50' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                readOnly
                                checked={isBound}
                                className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                              <div>
                                <span className="font-mono font-bold text-slate-800">{asset.id}</span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="text-slate-600">{asset.name}</span>
                              </div>
                            </div>
                            
                            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                              Condition: {asset.condition}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-xs text-rose-800">
                  Are you sure you want to reject the linen request ticket <span className="font-mono font-bold">{reviewingTicket.id}</span>? The ward requester will be notified immediately and the ticket is archived.
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button 
                onClick={() => setReviewingTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                id="admin-submit-review-decision-btn"
                onClick={handleSubmitTicketReview}
                className={`px-5 py-2 inline-flex items-center gap-1 text-xs font-semibold text-white rounded-xl cursor-pointer ${
                  ticketReviewType === 'Approved' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-rose-650 hover:bg-rose-700'
                }`}
              >
                {ticketReviewType === 'Approved' ? 'Fulfill Approved Order' : 'Confirm Rejection'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD ASSET DIALOG MODAL */}
      {showAddModal && (
        <div id="add-asset-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-semibold text-slate-850 text-base">Add New Linen Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Asset Description / Name</label>
                <input 
                  id="add-asset-name-input"
                  type="text" 
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                  placeholder="E.g., Twin Bed Sheet XL Premium Blue"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Linen Category</label>
                  <select 
                    id="add-asset-category-select"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    value={newAssetCat}
                    onChange={(e) => setNewAssetCat(e.target.value as LinenCategory)}
                  >
                    <option value="Bed Sheet">Bed Sheet</option>
                    <option value="Pillow Cover">Pillow Cover</option>
                    <option value="Patient Gown">Patient Gown</option>
                    <option value="Surgical Towel">Surgical Towel</option>
                    <option value="Blanket">Blanket</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Initial Condition</label>
                  <select 
                    id="add-asset-condition-select"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none' focus:ring-1 focus:ring-teal-600"
                    value={newAssetCond}
                    onChange={(e) => setNewAssetCond(e.target.value as AssetCondition)}
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Worn">Worn</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  id="confirm-add-asset-btn"
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
                >
                  Save to Inventory
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* REGISTER STAFF DIALOG MODAL */}
      {showAddEmpModal && (
        <div id="register-staff-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-semibold text-slate-850 text-base">Register Employee Account</h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Full Legal Name</label>
                <input 
                  id="add-staff-name-input"
                  type="text" 
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  placeholder="E.g., Specialist Nurse Sarah Connor"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Ward Department Clearance</label>
                  <select 
                    id="add-staff-department-select"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                  >
                    <option value="ICU">ICU</option>
                    <option value="Emergency Ward">Emergency Ward</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                    <option value="General Ward">General Ward</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Organizational Role</label>
                  <select 
                    id="add-staff-role-select"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value as 'Admin' | 'Staff')}
                  >
                    <option value="Staff">Clinical Staff (User)</option>
                    <option value="Admin">Logistics Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Hospital Email</label>
                  <input 
                    id="add-staff-email-input"
                    type="email" 
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    placeholder="user@stjudehospital.org"
                    required
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Contact Phone</label>
                  <input 
                    id="add-staff-phone-input"
                    type="text" 
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    placeholder="+1 (555) 012-3456"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  id="confirm-add-staff-btn"
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-950 rounded-xl"
                >
                  Register Profile
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

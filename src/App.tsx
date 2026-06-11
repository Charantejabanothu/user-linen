import { useState, useEffect } from 'react';
import { 
  LinenAsset, Employee, LinenRequestTicket, LaundryBatch, 
  LinenCategory, AssetStatus, AssetCondition, TicketStatus, UrgencyLevel 
} from './types';
import { 
  INITIAL_ASSETS, INITIAL_EMPLOYEES, INITIAL_TICKETS, INITIAL_LAUNDRY_BATCHES 
} from './data';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Layers, Settings, User, Activity, ShieldPlus, Heart, 
  RefreshCw, ClipboardCheck, Info, Sparkles 
} from 'lucide-react';

export default function App() {
  // --- Persistent State Hydration ---
  const [assets, setAssets] = useState<LinenAsset[]>(() => {
    const saved = localStorage.getItem('hms_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [tickets, setTickets] = useState<LinenRequestTicket[]>(() => {
    const saved = localStorage.getItem('hms_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hms_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [laundryBatches, setLaundryBatches] = useState<LaundryBatch[]>(() => {
    const saved = localStorage.getItem('hms_laundry_batches');
    return saved ? JSON.parse(saved) : INITIAL_LAUNDRY_BATCHES;
  });

  // Active persona & view mode
  const [activeUser, setActiveUser] = useState<Employee>(() => {
    const staff = employees.find(e => e.role === 'Staff');
    return staff || employees[1];
  });

  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('hms_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('hms_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('hms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hms_laundry_batches', JSON.stringify(laundryBatches));
  }, [laundryBatches]);


  // --- USER OPERATIONS ---

  // Create Linen Request Ticket
  const handleCreateTicket = (category: LinenCategory, quantity: number, urgency: UrgencyLevel, notes: string) => {
    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: LinenRequestTicket = {
      id: newId,
      linenType: category,
      quantity,
      urgency,
      requesterId: activeUser.id,
      requesterName: activeUser.name,
      department: activeUser.department,
      status: 'Ticket Generated', // Workflow State: Starts from Created/Generated
      dateCreated: new Date().toISOString().split('T')[0],
      notes,
      assignedAssetIds: [],
      issueReported: null,
      issueAssetId: null,
      returnRequestedAssetId: null,
      returnStatus: 'None'
    };

    setTickets(prev => [newTicket, ...prev]);
  };

  // Report Asset Issue
  const handleReportIssue = (assetId: string, issue: string) => {
    // 1. Mark asset condition as Damaged and status as available for inspection
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          condition: 'Damaged',
          status: 'Repairing',
          department: null,
          assignedTo: null
        };
      }
      return asset;
    }));

    // 2. Log issue ticket for visibility
    const newId = `TKT-FAIL-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueTicket: LinenRequestTicket = {
      id: newId,
      linenType: assets.find(a => a.id === assetId)?.category || 'Bed Sheet',
      quantity: 1,
      urgency: 'High',
      requesterId: activeUser.id,
      requesterName: activeUser.name,
      department: activeUser.department,
      status: 'Admin Review',
      dateCreated: new Date().toISOString().split('T')[0],
      notes: `Defect reported for Serial ${assetId}: "${issue}"`,
      assignedAssetIds: [assetId],
      issueReported: issue,
      issueAssetId: assetId,
      returnRequestedAssetId: null,
      returnStatus: 'None'
    };

    setTickets(prev => [issueTicket, ...prev]);
  };

  // Request Asset Return
  const handleReturnAsset = (assetId: string) => {
    // Update asset state from Assigned ➔ In Laundry
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          status: 'In Laundry',
          department: null,
          assignedTo: null,
          usageCount: asset.usageCount + 1
        };
      }
      return asset;
    }));
  };

  // --- ADMINISTRATIVE OPERATIONS ---

  // Add Asset
  const handleAddAsset = (name: string, category: LinenCategory, condition: AssetCondition) => {
    const prefixes = {
      'Bed Sheet': 'LIN-BS',
      'Pillow Cover': 'LIN-PC',
      'Patient Gown': 'LIN-PG',
      'Surgical Towel': 'LIN-ST',
      'Blanket': 'LIN-BK'
    };

    const count = assets.filter(a => a.category === category).length + 100;
    const newId = `${prefixes[category]}-${count}`;

    const newAsset: LinenAsset = {
      id: newId,
      name,
      category,
      status: 'Available',
      condition,
      lastReplenishedDate: new Date().toISOString().split('T')[0],
      usageCount: 0,
      assignedTo: null,
      department: null
    };

    setAssets(prev => [...prev, newAsset]);
  };

  // Update Asset
  const handleUpdateAsset = (assetId: string, updates: Partial<LinenAsset>) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, ...updates };
      }
      return asset;
    }));
  };

  // Delete Asset
  const handleDeleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  // Assign Asset to employee manually
  const handleAssignAsset = (assetId: string, employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          status: 'Assigned',
          assignedTo: employeeId,
          department: emp.department
        };
      }
      return asset;
    }));
  };

  // Review raised clinical ticket (Approve or Reject)
  const handleReviewTicket = (ticketId: string, decision: 'Approved' | 'Rejected', assetIds?: string[]) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: decision === 'Approved' ? 'Approved' : 'Rejected',
          assignedAssetIds: assetIds || []
        };
      }
      return ticket;
    }));

    // If approved and assets bound, transition these physical assets to reserved
    if (decision === 'Approved' && assetIds && assetIds.length > 0) {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      setAssets(prev => prev.map(asset => {
        if (assetIds.includes(asset.id)) {
          return {
            ...asset,
            status: 'Assigned',
            department: ticket.department,
            assignedTo: ticket.requesterId
          };
        }
        return asset;
      }));
    }
  };

  // Handle general progression workflow steps
  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, status };
      }
      return ticket;
    }));

    // If marked "Processing", we change bound asset statuses to show they are washing/drying/sorting
    // If marked "Completed", we ensure bound assets are set to "Assigned" at the correct department
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.assignedAssetIds.length) return;

    if (status === 'Completed') {
      setAssets(prev => prev.map(asset => {
        if (ticket.assignedAssetIds.includes(asset.id)) {
          return {
            ...asset,
            status: 'Assigned',
            department: ticket.department,
            assignedTo: ticket.requesterId
          };
        }
        return asset;
      }));
    }
  };

  // Add new employee
  const handleAddEmployee = (name: string, department: string, email: string, phone: string, role: 'Admin' | 'Staff') => {
    const id = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    const newEmp: Employee = {
      id,
      name,
      department,
      email,
      phone,
      role
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  // Automated laundry & replenishment loop simulator
  const handleTriggerAutomatedLaundry = (category: LinenCategory) => {
    // 1. Find all assets of this category currently marked "In Laundry" or "Repairing"
    const processingAssets = assets.filter(a => a.category === category && (a.status === 'In Laundry' || a.status === 'Repairing'));
    const assetIds = processingAssets.map(a => a.id);

    if (assetIds.length === 0) return;

    // 2. Create a new digital laundry batch running in background
    const batchId = `LND-${Math.floor(500 + Math.random() * 500)}`;
    const newBatch: LaundryBatch = {
      id: batchId,
      assetsCount: assetIds.length,
      category,
      status: 'Washing',
      dateCreated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      expectedDelivery: new Date(Date.now() + 60000).toISOString().replace('T', ' ').substring(0, 16), // 1 min simulation
      referencedAssetIds: assetIds
    };

    setLaundryBatches(prev => [newBatch, ...prev]);

    // 3. Mark assets as "In Laundry"
    setAssets(prev => prev.map(asset => {
      if (assetIds.includes(asset.id)) {
        return {
          ...asset,
          status: 'In Laundry'
        };
      }
      return asset;
    }));

    // 4. Simulate complete laundry turnaround cycle trigger
    setTimeout(() => {
      // Transition batch to ironed / ready
      setLaundryBatches(prev => prev.map(b => b.id === batchId ? { ...b, status: 'Ready for Pickup' } : b));
      
      // Return these assets to 'Available' ready warehouse and refresh condition to Good/New
      setAssets(prev => prev.map(asset => {
        if (assetIds.includes(asset.id)) {
          return {
            ...asset,
            status: 'Available',
            condition: asset.condition === 'Damaged' ? 'Good' : 'New',
            lastReplenishedDate: new Date().toISOString().split('T')[0]
          };
        }
        return asset;
      }));
    }, 15000); // 15s instant simulator for immediate playability!
  };

  // Persona swapper helper
  const handleSwitchUser = (empId: string) => {
    const found = employees.find(e => e.id === empId);
    if (found) setActiveUser(found);
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-root-container">
      
      {/* Top Sterile Navigation Bar */}
      <header id="app-header-navbar" className="bg-white border-b border-slate-205 py-3 px-6 sticky top-0 z-40 shadow-3xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand layout */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-1.5 uppercase">
                St. Jude Linen Systems
                <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-100">
                  v2.8
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5">HOSPITAL ASSETS ROTATION Telemetry</p>
            </div>
          </div>

          {/* Interactive Portal Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              id="switch-staff-portal-btn"
              onClick={() => {
                setViewMode('user');
                // Ensure active user is first staff member
                const staff = employees.find(e => e.role === 'Staff');
                if (staff) setActiveUser(staff);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'user' 
                  ? 'bg-teal-700 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Clinical Staff Portal
            </button>
            <button 
              id="switch-admin-portal-btn"
              onClick={() => {
                setViewMode('admin');
                const admin = employees.find(e => e.role === 'Admin');
                if (admin) setActiveUser(admin);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'admin' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Logistics Control Center
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-12">
        {viewMode === 'user' ? (
          <UserDashboard 
            assets={assets}
            tickets={tickets}
            employees={employees}
            activeUser={activeUser}
            onSwitchUser={handleSwitchUser}
            onCreateTicket={handleCreateTicket}
            onReportIssue={handleReportIssue}
            onReturnAsset={handleReturnAsset}
          />
        ) : (
          <AdminDashboard 
            assets={assets}
            tickets={tickets}
            employees={employees}
            laundryBatches={laundryBatches}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onAssignAsset={handleAssignAsset}
            onReviewTicket={handleReviewTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onAddEmployee={handleAddEmployee}
            onTriggerAutomatedLaundry={handleTriggerAutomatedLaundry}
          />
        )}
      </main>

      {/* Sterile hospital-themed outer footer */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-6 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-700">Digital Linen Autoclave Replenishment Ledger</span>
            <p className="text-[11px] text-slate-400 font-mono">Status: Connected to sterile telemetry network | Real-time SVG monitoring active</p>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded border border-slate-200 font-medium">
              St. Jude Hospital Logistics © 2026
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

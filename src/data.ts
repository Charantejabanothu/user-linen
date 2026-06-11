import { LinenAsset, Employee, LinenRequestTicket, LaundryBatch } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Dr. Catherine Vance",
    role: "Admin",
    department: "Logistics & Administration",
    email: "c.vance@stjudehospital.org",
    phone: "+1 (555) 019-2834",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "EMP-002",
    name: "Nurse Anna Kovalenko",
    role: "Staff",
    department: "ICU",
    email: "a.kovalenko@stjudehospital.org",
    phone: "+1 (555) 012-5812",
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "EMP-003",
    name: "Nurse Marcus Brody",
    role: "Staff",
    department: "Emergency Ward",
    email: "m.brody@stjudehospital.org",
    phone: "+1 (555) 014-9988",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "EMP-004",
    name: "Dr. Sarah Jenkins",
    role: "Staff",
    department: "Surgery",
    email: "s.jenkins@stjudehospital.org",
    phone: "+1 (555) 018-7241",
    avatarUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "EMP-005",
    name: "Nurse Liam Peterson",
    role: "Staff",
    department: "Pediatrics",
    email: "l.peterson@stjudehospital.org",
    phone: "+1 (555) 017-3311",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120"
  }
];

export const INITIAL_ASSETS: LinenAsset[] = [
  // Bed Sheets
  {
    id: "LIN-BS-001",
    name: "X-Large Fitted Threat Bed Sheet",
    category: "Bed Sheet",
    status: "Assigned",
    condition: "New",
    lastReplenishedDate: "2026-06-01",
    usageCount: 4,
    assignedTo: "EMP-002",
    department: "ICU"
  },
  {
    id: "LIN-BS-002",
    name: "Standard Flat Bed Sheet White",
    category: "Bed Sheet",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-05-20",
    usageCount: 15,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-BS-003",
    name: "Thermal Heat Bed Sheet Green",
    category: "Bed Sheet",
    status: "Assigned",
    condition: "Good",
    lastReplenishedDate: "2026-05-18",
    usageCount: 18,
    assignedTo: "EMP-003",
    department: "Emergency Ward"
  },
  {
    id: "LIN-BS-004",
    name: "Standard Flat Bed Sheet White",
    category: "Bed Sheet",
    status: "In Laundry",
    condition: "Worn",
    lastReplenishedDate: "2026-04-10",
    usageCount: 45,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-BS-005",
    name: "Standard Flat Bed Sheet White",
    category: "Bed Sheet",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-06-03",
    usageCount: 1,
    assignedTo: null,
    department: null
  },

  // Pillow Covers
  {
    id: "LIN-PC-101",
    name: "Anatomical Cotton Pillow Cover",
    category: "Pillow Cover",
    status: "Assigned",
    condition: "New",
    lastReplenishedDate: "2026-06-02",
    usageCount: 2,
    assignedTo: "EMP-002",
    department: "ICU"
  },
  {
    id: "LIN-PC-102",
    name: "Premium Thread Pillow Cover White",
    category: "Pillow Cover",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-05-15",
    usageCount: 12,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-PC-103",
    name: "Premium Thread Pillow Cover Blue",
    category: "Pillow Cover",
    status: "Assigned",
    condition: "Worn",
    lastReplenishedDate: "2026-03-24",
    usageCount: 38,
    assignedTo: "EMP-005",
    department: "Pediatrics"
  },
  {
    id: "LIN-PC-104",
    name: "Premium Thread Pillow Cover White",
    category: "Pillow Cover",
    status: "In Laundry",
    condition: "Good",
    lastReplenishedDate: "2026-05-28",
    usageCount: 8,
    assignedTo: null,
    department: null
  },

  // Patient Gowns
  {
    id: "LIN-PG-201",
    name: "Unisex Easy-Snap Patient Gown Blue",
    category: "Patient Gown",
    status: "Assigned",
    condition: "Good",
    lastReplenishedDate: "2026-05-11",
    usageCount: 24,
    assignedTo: "EMP-003",
    department: "Emergency Ward"
  },
  {
    id: "LIN-PG-202",
    name: "Child Cartoon Printed Gown Starry",
    category: "Patient Gown",
    status: "Assigned",
    condition: "New",
    lastReplenishedDate: "2026-06-05",
    usageCount: 1,
    assignedTo: "EMP-005",
    department: "Pediatrics"
  },
  {
    id: "LIN-PG-203",
    name: "Unisex Easy-Snap Patient Gown Blue",
    category: "Patient Gown",
    status: "In Laundry",
    condition: "Damaged",
    lastReplenishedDate: "2026-03-12",
    usageCount: 42,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-PG-204",
    name: "Unisex Easy-Snap Patient Gown Green",
    category: "Patient Gown",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-05-29",
    usageCount: 6,
    assignedTo: null,
    department: null
  },

  // Surgical Towels
  {
    id: "LIN-ST-301",
    name: "Sterile Absorbent Surgical Towel",
    category: "Surgical Towel",
    status: "Assigned",
    condition: "New",
    lastReplenishedDate: "2026-06-07",
    usageCount: 1,
    assignedTo: "EMP-004",
    department: "Surgery"
  },
  {
    id: "LIN-ST-302",
    name: "Sterile Absorbent Surgical Towel",
    category: "Surgical Towel",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-05-25",
    usageCount: 9,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-ST-303",
    name: "Sterile Absorbent Surgical Towel",
    category: "Surgical Towel",
    status: "In Laundry",
    condition: "Good",
    lastReplenishedDate: "2026-06-08",
    usageCount: 2,
    assignedTo: null,
    department: null
  },

  // Blankets
  {
    id: "LIN-BK-401",
    name: "Heavy Therapeutic Warm Blanket",
    category: "Blanket",
    status: "Assigned",
    condition: "Good",
    lastReplenishedDate: "2026-04-20",
    usageCount: 20,
    assignedTo: "EMP-002",
    department: "ICU"
  },
  {
    id: "LIN-BK-402",
    name: "Fleece Hypoallergenic Blanket Yellow",
    category: "Blanket",
    status: "Assigned",
    condition: "New",
    lastReplenishedDate: "2026-06-04",
    usageCount: 3,
    assignedTo: "EMP-005",
    department: "Pediatrics"
  },
  {
    id: "LIN-BK-403",
    name: "Heavy Therapeutic Warm Blanket",
    category: "Blanket",
    status: "Available",
    condition: "Good",
    lastReplenishedDate: "2026-05-30",
    usageCount: 5,
    assignedTo: null,
    department: null
  },
  {
    id: "LIN-BK-404",
    name: "Thermal Soft Blanket Blue",
    category: "Blanket",
    status: "Repairing",
    condition: "Damaged",
    lastReplenishedDate: "2026-02-15",
    usageCount: 55,
    assignedTo: null,
    department: null
  }
];

export const INITIAL_TICKETS: LinenRequestTicket[] = [
  {
    id: "TKT-3129",
    linenType: "Bed Sheet",
    quantity: 2,
    urgency: "High",
    requesterId: "EMP-002",
    requesterName: "Nurse Anna Kovalenko",
    department: "ICU",
    status: "Completed",
    dateCreated: "2026-06-09",
    notes: "Requires sanitized thermals for room 4B patients.",
    assignedAssetIds: ["LIN-BS-001"],
    issueReported: null,
    issueAssetId: null,
    returnRequestedAssetId: null,
    returnStatus: "None"
  },
  {
    id: "TKT-3130",
    linenType: "Patient Gown",
    quantity: 1,
    urgency: "Medium",
    requesterId: "EMP-005",
    requesterName: "Nurse Liam Peterson",
    department: "Pediatrics",
    status: "Processing",
    dateCreated: "2026-06-10",
    notes: "Need 1 paediatric gown for urgent admission.",
    assignedAssetIds: ["LIN-PG-202"],
    issueReported: null,
    issueAssetId: null,
    returnRequestedAssetId: null,
    returnStatus: "None"
  },
  {
    id: "TKT-3131",
    linenType: "Surgical Towel",
    quantity: 1,
    urgency: "High",
    requesterId: "EMP-004",
    requesterName: "Dr. Sarah Jenkins",
    department: "Surgery",
    status: "Admin Review",
    dateCreated: "2026-06-11",
    notes: "Surgery Room A stock is low on micro-absorbents.",
    assignedAssetIds: [],
    issueReported: null,
    issueAssetId: null,
    returnRequestedAssetId: null,
    returnStatus: "None"
  },
  {
    id: "TKT-3132",
    linenType: "Blanket",
    quantity: 1,
    urgency: "Low",
    requesterId: "EMP-003",
    requesterName: "Nurse Marcus Brody",
    department: "Emergency Ward",
    status: "Ticket Generated",
    dateCreated: "2026-06-11",
    notes: "Standard restock for night shift.",
    assignedAssetIds: [],
    issueReported: null,
    issueAssetId: null,
    returnRequestedAssetId: null,
    returnStatus: "None"
  }
];

export const INITIAL_LAUNDRY_BATCHES: LaundryBatch[] = [
  {
    id: "LND-401",
    assetsCount: 3,
    category: "Bed Sheet",
    status: "Washing",
    dateCreated: "2026-06-10",
    expectedDelivery: "2026-06-11 14:00",
    referencedAssetIds: ["LIN-BS-004"]
  },
  {
    id: "LND-402",
    assetsCount: 2,
    category: "Patient Gown",
    status: "Ironing",
    dateCreated: "2026-06-10",
    expectedDelivery: "2026-06-11 11:30",
    referencedAssetIds: ["LIN-PG-203"]
  }
];

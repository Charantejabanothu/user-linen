export type LinenCategory = 'Bed Sheet' | 'Pillow Cover' | 'Patient Gown' | 'Surgical Towel' | 'Blanket';

export type AssetStatus = 'Available' | 'Assigned' | 'In Laundry' | 'Repairing' | 'Discarded';

export type AssetCondition = 'New' | 'Good' | 'Worn' | 'Damaged';

export interface LinenAsset {
  id: string;
  name: string;
  category: LinenCategory;
  status: AssetStatus;
  condition: AssetCondition;
  lastReplenishedDate: string;
  usageCount: number;
  assignedTo: string | null; // Employee ID or Department
  department: string | null;  // Emergency, ICU, General Ward, Pediatrics, Surgery
}

export type UserRole = 'Admin' | 'Staff';

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export type TicketStatus = 
  | 'Created' 
  | 'Ticket Generated' 
  | 'Admin Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'Processing' 
  | 'Completed' 
  | 'Closed';

export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export interface LinenRequestTicket {
  id: string;
  linenType: LinenCategory;
  quantity: number;
  urgency: UrgencyLevel;
  requesterId: string;
  requesterName: string;
  department: string;
  status: TicketStatus;
  dateCreated: string;
  notes: string;
  assignedAssetIds: string[]; // actual linen asset IDs fulfilling the request
  issueReported: string | null; // if 'Damaged' or issue reported
  issueAssetId: string | null;  // which asset has an issue
  returnRequestedAssetId: string | null; // which asset is requested to return
  returnStatus: 'None' | 'Requested' | 'Completed';
}

export interface LaundryBatch {
  id: string;
  assetsCount: number;
  category: LinenCategory;
  status: 'In Transit' | 'Washing' | 'Drying' | 'Ironing' | 'Ready for Pickup';
  dateCreated: string;
  expectedDelivery: string;
  referencedAssetIds: string[];
}

export interface SupplyChainMetric {
  id: string;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  unit?: string;
}

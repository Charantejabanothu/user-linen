import React from 'react';
import { TicketStatus } from '../types';
import { Check, ClipboardList, RefreshCw, Send, CheckCircle, Eye, Archive, XCircle } from 'lucide-react';

interface WorkflowProgressProps {
  status: TicketStatus;
}

const STEPS: { status: TicketStatus; label: string; desc: string; icon: any }[] = [
  { status: 'Created', label: 'Created', desc: 'Request initiated by department', icon: Send },
  { status: 'Ticket Generated', label: 'Ticket Ready', desc: 'Digital routing token issues', icon: ClipboardList },
  { status: 'Admin Review', label: 'Admin Review', desc: 'Logistics matches items', icon: Eye },
  { status: 'Approved', label: 'Approved', desc: 'Assets assigned & approved', icon: CheckCircle }, // Special handler if rejected
  { status: 'Processing', label: 'Processing', desc: 'Sterilization & local delivery', icon: RefreshCw },
  { status: 'Completed', label: 'Completed', desc: 'Received & verified by staff', icon: Check },
  { status: 'Closed', label: 'Closed', desc: 'Archived into inventory logs', icon: Archive },
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ status }) => {
  const isRejected = status === 'Rejected';
  
  // Calculate current active index
  const getActiveIndex = (currStatus: TicketStatus): number => {
    if (currStatus === 'Rejected') return 3; // Align with Approved stage
    const statuses: TicketStatus[] = [
      'Created',
      'Ticket Generated',
      'Admin Review',
      'Approved',
      'Processing',
      'Completed',
      'Closed'
    ];
    return statuses.indexOf(currStatus);
  };

  const activeIndex = getActiveIndex(status);

  return (
    <div className="w-full py-6">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
        {/* Connection Line (Desktop) */}
        <div className="absolute hidden md:block left-10 right-10 top-2/5 h-0.5 bg-slate-100 -z-10 dark:bg-slate-800" />
        
        {/* Dynamic active line progress */}
        <div 
          className="absolute hidden md:block left-10 top-2/5 h-0.5 bg-teal-600 transition-all duration-500 -z-10"
          style={{ 
            width: `${activeIndex === -1 ? 0 : (activeIndex / (STEPS.length - 1)) * 90}%` 
          }}
        />

        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < activeIndex || (idx === 3 && status !== 'Rejected' && activeIndex >= 3) || (status === 'Closed');
          const isActive = idx === activeIndex;
          const isUpcoming = idx > activeIndex && !(status === 'Rejected' && idx === 3);

          let circleBg = "bg-slate-100 text-slate-400 border-slate-200";
          let textColor = "text-slate-500";
          let iconColor = "text-slate-400";

          if (isActive) {
            if (isRejected && idx === 3) {
              circleBg = "bg-rose-50 text-rose-600 border-rose-300 ring-4 ring-rose-100 animate-pulse";
              textColor = "text-rose-700 font-semibold";
              iconColor = "text-rose-600";
            } else {
              circleBg = "bg-teal-50 text-teal-700 border-teal-300 ring-4 ring-teal-100 animate-pulse";
              textColor = "text-teal-800 font-semibold";
              iconColor = "text-teal-700";
            }
          } else if (isCompleted) {
            circleBg = "bg-teal-600 text-white border-teal-600";
            textColor = "text-slate-800 font-medium";
            iconColor = "text-white";
          }

          // Special visualization for Approved vs Rejected
          let stepLabel = step.label;
          let stepDesc = step.desc;
          if (idx === 3) {
            if (status === 'Rejected') {
              stepLabel = 'Rejected';
              stepDesc = 'Request denied in review';
              circleBg = "bg-rose-600 text-white border-rose-600";
              textColor = "text-rose-800 font-semibold";
              iconColor = "text-white";
            }
          }

          return (
            <div 
              key={step.status} 
              id={`step-${step.status.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 w-full text-left md:text-center"
            >
              {/* Node Outer Ring */}
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 shrink-0 ${circleBg}`}
              >
                {idx === 3 && status === 'Rejected' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>

              {/* Step Descriptions */}
              <div className="flex flex-col md:items-center">
                <span className={`text-xs uppercase tracking-wider font-semibold ${textColor}`}>
                  {stepLabel}
                </span>
                <span className="text-[11px] text-slate-400 max-w-[140px] leading-tight hidden md:block mt-1">
                  {stepDesc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

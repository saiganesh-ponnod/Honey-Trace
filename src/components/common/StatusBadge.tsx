import React from 'react';
import { VerificationStatus, BatchStatus, AlertSeverity } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, ShieldCheck, Truck, Store, Clock, Flame, Ban } from 'lucide-react';

export const VerificationBadge: React.FC<{ status: VerificationStatus; size?: 'sm' | 'md' | 'lg' }> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-5 py-2 gap-2 font-bold tracking-wide'
  }[size];

  switch (status) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm ${sizeClasses}`}>
          <CheckCircle2 className={size === 'lg' ? 'w-5 h-5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
          VERIFIED AUTHENTIC
        </span>
      );
    case 'INFORMATION_INCOMPLETE':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-sm ${sizeClasses}`}>
          <AlertCircle className={size === 'lg' ? 'w-5 h-5 text-amber-600 animate-pulse' : 'w-4 h-4 text-amber-600'} />
          INFORMATION INCOMPLETE
        </span>
      );
    case 'FLAGGED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 shadow-sm ${sizeClasses}`}>
          <AlertTriangle className={size === 'lg' ? 'w-5 h-5 text-rose-600 animate-bounce' : 'w-4 h-4 text-rose-600'} />
          FLAGGED / SUSPICIOUS
        </span>
      );
    case 'NOT_FOUND':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-sm ${sizeClasses}`}>
          <HelpCircle className={size === 'lg' ? 'w-5 h-5 text-slate-500' : 'w-4 h-4 text-slate-500'} />
          NOT FOUND / UNREGISTERED
        </span>
      );
  }
};

export const BatchStatusBadge: React.FC<{ status: BatchStatus }> = ({ status }) => {
  switch (status) {
    case 'REGISTERED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-700" /> Registered
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Flame className="w-3 h-3 text-blue-600 animate-spin" /> In Processing
        </span>
      );
    case 'PROCESSED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Processed
        </span>
      );
    case 'QUALITY_APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Quality Approved
        </span>
      );
    case 'QUALITY_REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <Ban className="w-3 h-3 text-rose-600" /> Quality Rejected
        </span>
      );
    case 'IN_TRANSIT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
          <Truck className="w-3 h-3 text-sky-600 animate-pulse" /> In Transit
        </span>
      );
    case 'AT_RETAILER':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
          <Store className="w-3 h-3 text-teal-600" /> At Retail Store
        </span>
      );
    case 'RECALLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
          <Ban className="w-3 h-3 text-red-600" /> Recalled
        </span>
      );
    default:
      return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{status}</span>;
  }
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
    case 'HIGH':
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">HIGH</span>;
    case 'MEDIUM':
      return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
    case 'LOW':
    default:
      return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">LOW</span>;
  }
};

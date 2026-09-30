import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Batch } from '../../types';
import { BatchStatusBadge, VerificationBadge } from '../../components/common/StatusBadge';

export const DistributorDashboard: React.FC<{
  onVerifyCode: (code: string) => void;
}> = ({ onVerifyCode }) => {
  const {
    currentUser,
    batches,
    users,
    pickupBatch,
    addLocationUpdate,
    dispatchBatch
  } = useStore();

  const [selectedBatchForLoc, setSelectedBatchForLoc] = useState<Batch | null>(null);
  const [selectedBatchForDispatch, setSelectedBatchForDispatch] = useState<Batch | null>(null);

  // Forms
  const [locName, setLocName] = useState('Expressway Transit Depot, Navi Mumbai');
  const [locNotes, setLocNotes] = useState('Reefer temperature verified at 21.8°C. Transit on schedule.');
  const [dispatchRetailerId, setDispatchRetailerId] = useState(users.find(u => u.role === 'RETAILER')?.id || '');
  const [dispatchLoc, setDispatchLoc] = useState('Bandra Delivery Terminal, Mumbai');
  const [dispatchNotes, setDispatchNotes] = useState('Arrived at retail delivery dock for handover.');

  // Available for pickup: batches with status QUALITY_APPROVED
  const availableBatches = batches.filter(b => b.status === 'QUALITY_APPROVED');
  // In custody: batches with status IN_TRANSIT
  const inCustodyBatches = batches.filter(b => b.status === 'IN_TRANSIT');
  const retailers = users.filter(u => u.role === 'RETAILER' && u.status === 'APPROVED');

  const handlePickup = (b: Batch) => {
    pickupBatch(b.id, currentUser?.location || 'Pune Cold Storage Logistics Hub', 'Loaded into insulated reefer van with live IoT telemetry.');
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForLoc) return;
    addLocationUpdate(selectedBatchForLoc.id, locName, 19.033, 73.029, locNotes);
    setSelectedBatchForLoc(null);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForDispatch || !dispatchRetailerId) return;
    dispatchBatch(selectedBatchForDispatch.id, dispatchRetailerId, dispatchLoc, dispatchNotes);
    setSelectedBatchForDispatch(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Cold-Chain Logistics & Distribution
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
              DISTRIBUTOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentUser?.organizationName} • {currentUser?.location}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Available for Pickup</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">{availableBatches.length}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Quality Approved Batches</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Shipments In Custody</span>
          <p className="text-2xl sm:text-3xl font-black text-sky-700 font-display mt-1">{inCustodyBatches.length}</p>
          <p className="text-[11px] text-sky-700 mt-0.5">In Transit with IoT Telemetry</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Destination Retailers</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{retailers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Approved Supermarket Partners</p>
        </div>
      </div>

      {/* 1. In Custody Active Shipments */}
      <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Active Shipments Under Custody</h3>
            <p className="text-xs text-slate-500">Log intermediate GPS checkpoint updates or dispatch to retailer</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
            {inCustodyBatches.length} In Transit
          </span>
        </div>

        {inCustodyBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Batch Code</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Weight</th>
                  <th className="py-3 px-4 font-bold">Pending Retailer</th>
                  <th className="py-3 px-4 font-bold text-right">Logistics Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {inCustodyBatches.map(b => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.batchCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.productName}</td>
                    <td className="py-3 px-4 text-slate-700">{b.quantityKg} kg</td>
                    <td className="py-3 px-4">
                      {b.pendingRetailerId ? (
                        <span className="font-semibold text-emerald-800">
                          {users.find(u => u.id === b.pendingRetailerId)?.organizationName || 'Pending Handover'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBatchForLoc(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition"
                        >
                          + GPS Check-in
                        </button>
                        <button
                          onClick={() => setSelectedBatchForDispatch(b)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Dispatch to Retailer
                        </button>
                        <button
                          onClick={() => onVerifyCode(b.batchCode)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px]"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">No shipments currently in transit.</p>
        )}
      </div>

      {/* 2. Available Pool for Pickup */}
      <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Quality-Approved Batches Ready for Pickup</h3>

        {availableBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Batch Code</th>
                  <th className="py-3 px-4 font-bold">Product & Variety</th>
                  <th className="py-3 px-4 font-bold">Quantity</th>
                  <th className="py-3 px-4 font-bold">Quality Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {availableBatches.map(b => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.batchCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.productName}</td>
                    <td className="py-3 px-4 text-slate-800">{b.quantityKg} kg</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        QUALITY APPROVED (NABL)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handlePickup(b)}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1.5 ml-auto"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Pickup Batch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">No batches waiting for pickup in the processing bay.</p>
        )}
      </div>

      {/* Modal: Location Checkpoint */}
      {selectedBatchForLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-sky-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">
                Log Checkpoint for {selectedBatchForLoc.batchCode}
              </h3>
            </div>

            <form onSubmit={handleLocationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transit Checkpoint Location</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Telemetry Notes</label>
                <textarea
                  rows={2}
                  value={locNotes}
                  onChange={e => setLocNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedBatchForLoc(null)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow">Append Event Hash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dispatch to Retailer */}
      {selectedBatchForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-purple-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">
                Dispatch {selectedBatchForDispatch.batchCode} to Retailer
              </h3>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Approved Retailer</label>
                <select
                  value={dispatchRetailerId}
                  onChange={e => setDispatchRetailerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-sm font-semibold"
                >
                  {retailers.map(r => (
                    <option key={r.id} value={r.id}>{r.organizationName} ({r.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Dock Location</label>
                <input
                  type="text"
                  required
                  value={dispatchLoc}
                  onChange={e => setDispatchLoc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={e => setDispatchNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedBatchForDispatch(null)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow">Record Handover Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  QrCode,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Batch, RetailerInventory } from '../../types';
import { BatchStatusBadge, VerificationBadge } from '../../components/common/StatusBadge';
import { QrModal } from '../../components/qr/QrModal';

export const RetailerDashboard: React.FC<{
  onVerifyCode: (code: string) => void;
}> = ({ onVerifyCode }) => {
  const {
    currentUser,
    batches,
    inventory,
    confirmReceipt,
    updateInventory
  } = useStore();

  const [selectedBatchForReceive, setSelectedBatchForReceive] = useState<Batch | null>(null);
  const [selectedBatchForQr, setSelectedBatchForQr] = useState<Batch | null>(null);
  const [selectedInvForEdit, setSelectedInvForEdit] = useState<RetailerInventory | null>(null);

  // Receipt Form
  const [receiveQuantity, setReceiveQuantity] = useState(246.5);
  const [condition, setCondition] = useState<'OK' | 'DAMAGED'>('OK');
  const [shelfLoc, setShelfLoc] = useState('Aisle 3 - Artisanal Honey & Organic Sweeteners (Shelf B2)');
  const [receiveNotes, setReceiveNotes] = useState('Jars inspected in pristine condition. QR labels printed.');

  // Edit Inv Form
  const [editQty, setEditQty] = useState(200);
  const [editShelf, setEditShelf] = useState('');

  // Incoming shipments: batches dispatched to me or pendingRetailerId
  const incomingShipments = batches.filter(
    b => (b.pendingRetailerId === currentUser?.id || currentUser?.role === 'ADMIN') && b.status === 'IN_TRANSIT'
  );

  // Received Inventory
  const myInventory = inventory.filter(
    i => i.retailerId === currentUser?.id || currentUser?.role === 'ADMIN'
  );

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForReceive) return;
    confirmReceipt(selectedBatchForReceive.id, receiveQuantity, condition, shelfLoc, receiveNotes);
    setSelectedBatchForReceive(null);
  };

  const handleEditInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvForEdit) return;
    updateInventory(selectedInvForEdit.id, editQty, editShelf);
    setSelectedInvForEdit(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Retail Store & Shelf Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              RETAILER
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
          <span className="text-xs font-bold text-slate-500 uppercase">Incoming Deliveries</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">{incomingShipments.length}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Pending Store Receipt Confirmation</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Stocked Batches</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">{myInventory.length}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">On Shelf with Verifiable QR</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Stock Weight</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            {myInventory.reduce((acc, i) => acc + i.quantityOnHand, 0).toFixed(1)} kg
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">100% Genuine Pure Honey</p>
        </div>
      </div>

      {/* 1. Incoming Deliveries Pending Confirmation */}
      <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Incoming Shipments (Dispatched to this Store)</h3>
            <p className="text-xs text-slate-500">Confirm physical handover and seal condition</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
            {incomingShipments.length} Arrived / In Transit
          </span>
        </div>

        {incomingShipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Batch Code</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Quantity Dispatched</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {incomingShipments.map(b => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.batchCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.productName}</td>
                    <td className="py-3 px-4 text-slate-800">{b.quantityKg} kg</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        DISPATCHED (AWAITING RECEIPT)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setReceiveQuantity(b.quantityKg);
                          setSelectedBatchForReceive(b);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1.5 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">No incoming shipments awaiting confirmation.</p>
        )}
      </div>

      {/* 2. Stocked Shelf Inventory */}
      <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Current Shelf Inventory & QR Tags</h3>

        {myInventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Batch Code</th>
                  <th className="py-3 px-4 font-bold">Shelf Aisle Location</th>
                  <th className="py-3 px-4 font-bold">Stock Remaining</th>
                  <th className="py-3 px-4 font-bold">Condition Checked</th>
                  <th className="py-3 px-4 font-bold text-right">Shelf Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {myInventory.map(inv => {
                  const b = batches.find(x => x.id === inv.batchId);
                  return (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {b?.batchCode}
                        <p className="text-[10px] font-sans font-normal text-slate-500">{b?.productName}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {inv.shelfLocation}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {inv.quantityOnHand} kg <span className="text-[10px] font-normal text-slate-500">/ {inv.quantityReceivedKg} kg</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {inv.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b && (
                            <button
                              onClick={() => setSelectedBatchForQr(b)}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-[11px] transition flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Shelf QR</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvForEdit(inv);
                              setEditQty(inv.quantityOnHand);
                              setEditShelf(inv.shelfLocation);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                          >
                            Edit Stock
                          </button>
                          {b && (
                            <button
                              onClick={() => onVerifyCode(b.batchCode)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-[11px] shadow-sm"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">No inventory currently stocked on shelves.</p>
        )}
      </div>

      {/* Modal: Confirm Receipt */}
      {selectedBatchForReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">
                Confirm Handover for {selectedBatchForReceive.batchCode}
              </h3>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Quantity Received (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={receiveQuantity}
                  onChange={e => setReceiveQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Packaging Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as 'OK' | 'DAMAGED')}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 text-sm font-semibold"
                >
                  <option value="OK">OK — Intact Tamper Seals & Safe Temperature</option>
                  <option value="DAMAGED">DAMAGED — Broken Seal / Leakage</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Retail Shelf Location</label>
                <input
                  type="text"
                  required
                  value={shelfLoc}
                  onChange={e => setShelfLoc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Notes</label>
                <textarea
                  rows={2}
                  value={receiveNotes}
                  onChange={e => setReceiveNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedBatchForReceive(null)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow">
                  Confirm Handover & Move to Shelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Inventory */}
      {selectedInvForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Update Shelf Inventory</h3>
            <form onSubmit={handleEditInvSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity On Hand (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editQty}
                  onChange={e => setEditQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shelf Aisle Location</label>
                <input
                  type="text"
                  value={editShelf}
                  onChange={e => setEditShelf(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedInvForEdit(null)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedBatchForQr && (
        <QrModal
          batch={selectedBatchForQr}
          onClose={() => setSelectedBatchForQr(null)}
          onVerifyNow={code => onVerifyCode(code)}
        />
      )}
    </div>
  );
};

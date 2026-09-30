import React, { useState } from 'react';
import {
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Batch, ProcessType, QualityTestType } from '../../types';
import { BatchStatusBadge, VerificationBadge } from '../../components/common/StatusBadge';
import { QUALITY_REFERENCE_LIMITS } from '../../config/qualityLimits';

export const ProcessorDashboard: React.FC<{
  onVerifyCode: (code: string) => void;
}> = ({ onVerifyCode }) => {
  const {
    currentUser,
    batches,
    processingRecords,
    qualityTests,
    addProcessingRecord,
    addQualityTest
  } = useStore();

  const [selectedBatchForProc, setSelectedBatchForProc] = useState<Batch | null>(null);
  const [selectedBatchForQual, setSelectedBatchForQual] = useState<Batch | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
  const [formError, setFormError] = useState<string | null>(null);

  // Processing Form
  const [procForm, setProcForm] = useState({
    processType: 'FILTRATION' as ProcessType,
    facilityName: currentUser?.organizationName || 'Sahyadri Honey Processing Facility',
    facilityLocation: currentUser?.location || 'Pune, Maharashtra',
    startedAt: new Date(Date.now() - 3600000 * 4).toISOString().slice(0, 16),
    completedAt: new Date().toISOString().slice(0, 16),
    maxTemperatureC: 28.0,
    inputQuantityKg: 250,
    outputQuantityKg: 246.5,
    markComplete: true,
    additivesDeclared: false,
    additivesNotes: '',
    notes: 'Micro-cloth gravity filtration to remove wax residues. No thermal degrading applied.'
  });

  // Quality Test Form
  const [qualForm, setQualForm] = useState({
    testType: 'THIRD_PARTY_LAB' as QualityTestType,
    labName: 'QualiCheck Analytical Labs (NABL Accredited)',
    reportReference: `QC-LAB-2026-M${Math.floor(1000 + Math.random() * 9000)}`,
    testedAt: new Date().toISOString().slice(0, 16),
    moisturePct: 17.8,
    hmfMgKg: 18.5,
    electricalConductivityMsCm: 0.42,
    ph: 3.85,
    diastaseNumber: 14.6,
    overallResult: 'PASS' as 'PASS' | 'FAIL',
    notes: 'All parameters comply with Codex & FSSAI standards.'
  });

  // Batches assigned to this processor or all if admin
  const assignedBatches = batches.filter(
    b => b.assignedProcessorId === currentUser?.id || currentUser?.role === 'ADMIN' || currentUser?.role === 'PROCESSOR'
  );

  const handleProcessingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForProc) return;
    setFormError(null);

    const res = addProcessingRecord({
      batchId: selectedBatchForProc.id,
      processType: procForm.processType,
      facilityName: procForm.facilityName,
      facilityLocation: procForm.facilityLocation,
      startedAt: new Date(procForm.startedAt).toISOString(),
      completedAt: new Date(procForm.completedAt).toISOString(),
      maxTemperatureC: Number(procForm.maxTemperatureC),
      inputQuantityKg: Number(procForm.inputQuantityKg),
      outputQuantityKg: Number(procForm.outputQuantityKg),
      markComplete: procForm.markComplete,
      additivesDeclared: procForm.additivesDeclared,
      additivesNotes: procForm.additivesNotes,
      notes: procForm.notes
    });

    if (res.success) {
      setSelectedBatchForProc(null);
    } else {
      setFormError(res.error || 'Failed to submit processing record.');
    }
  };

  const handleQualitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForQual) return;
    setFormError(null);

    const res = addQualityTest({
      batchId: selectedBatchForQual.id,
      testType: qualForm.testType,
      labName: qualForm.labName,
      reportReference: qualForm.reportReference,
      testedAt: new Date(qualForm.testedAt).toISOString(),
      moisturePct: Number(qualForm.moisturePct),
      hmfMgKg: Number(qualForm.hmfMgKg),
      electricalConductivityMsCm: Number(qualForm.electricalConductivityMsCm),
      ph: Number(qualForm.ph),
      diastaseNumber: Number(qualForm.diastaseNumber),
      overallResult: qualForm.overallResult,
      notes: qualForm.notes
    });

    if (res.success) {
      setSelectedBatchForQual(null);
    } else {
      setFormError(res.error || 'Failed to submit quality test.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Processing & Quality Inspection Unit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
              PROCESSOR / LAB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentUser?.organizationName} • {currentUser?.location}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Assigned Batches</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{assignedBatches.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting Action</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Processing</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">
            {assignedBatches.filter(b => b.status === 'REGISTERED').length}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Raw Comb Stock</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Quality Lab</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 font-display mt-1">
            {assignedBatches.filter(b => b.status === 'PROCESSED').length}
          </p>
          <p className="text-[11px] text-blue-700 mt-0.5">Ready for Testing</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Quality Approved</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">
            {assignedBatches.filter(b => b.status === 'QUALITY_APPROVED' || b.status === 'IN_TRANSIT' || b.status === 'AT_RETAILER').length}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Passed Codex / FSSAI</p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="honey-card rounded-3xl overflow-hidden p-6">
        <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Assigned Processing & Testing Queue</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                <th className="py-3 px-4 font-bold">Batch Code & Lot</th>
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">Quantity</th>
                <th className="py-3 px-4 font-bold">Current State</th>
                <th className="py-3 px-4 font-bold text-right">Required Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {assignedBatches.map(b => (
                <tr key={b.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {b.batchCode}
                    <p className="text-[10px] font-sans font-normal text-slate-500">Lot: {b.producerLotNumber}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{b.productName}</td>
                  <td className="py-3 px-4 text-slate-800">{b.quantityKg} kg</td>
                  <td className="py-3 px-4">
                    <BatchStatusBadge status={b.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'REGISTERED' && (
                        <button
                          onClick={() => {
                            setProcForm({ ...procForm, inputQuantityKg: b.quantityKg, outputQuantityKg: Number((b.quantityKg * 0.98).toFixed(1)) });
                            setSelectedBatchForProc(b);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Add Processing</span>
                        </button>
                      )}

                      {b.status === 'PROCESSED' && (
                        <button
                          onClick={() => setSelectedBatchForQual(b)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Enter Lab Test</span>
                        </button>
                      )}

                      <button
                        onClick={() => onVerifyCode(b.batchCode)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold"
                      >
                        Inspect Ledger
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Processing */}
      {selectedBatchForProc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-blue-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">
                Log Processing for {selectedBatchForProc.batchCode}
              </h3>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">{formError}</div>
            )}

            <form onSubmit={handleProcessingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Process Method</label>
                  <select
                    value={procForm.processType}
                    onChange={e => setProcForm({ ...procForm, processType: e.target.value as ProcessType })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm font-semibold"
                  >
                    <option value="FILTRATION">FILTRATION (Cloth / Mesh)</option>
                    <option value="SETTLING">SETTLING (Tank Decanting)</option>
                    <option value="MOISTURE_ADJUSTMENT">MOISTURE ADJUSTMENT</option>
                    <option value="PASTEURIZATION">PASTEURIZATION (Heat Treatment)</option>
                    <option value="PACKAGING">PACKAGING (Bottling)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Processing Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={procForm.maxTemperatureC}
                    onChange={e => setProcForm({ ...procForm, maxTemperatureC: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Input Raw Honey (kg)</label>
                  <input
                    type="number"
                    value={procForm.inputQuantityKg}
                    onChange={e => setProcForm({ ...procForm, inputQuantityKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Output Packaged (kg)</label>
                  <input
                    type="number"
                    value={procForm.outputQuantityKg}
                    onChange={e => setProcForm({ ...procForm, outputQuantityKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={procForm.additivesDeclared}
                    onChange={e => setProcForm({ ...procForm, additivesDeclared: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Declare Additives / Syrup Blends (Shown on Consumer Page)</span>
                </label>
                {procForm.additivesDeclared && (
                  <input
                    type="text"
                    placeholder="Details of declared additives..."
                    value={procForm.additivesNotes}
                    onChange={e => setProcForm({ ...procForm, additivesNotes: e.target.value })}
                    className="w-full p-2 rounded-xl border border-amber-300 text-xs bg-white"
                  />
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={procForm.markComplete}
                  onChange={e => setProcForm({ ...procForm, markComplete: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Mark Processing as Complete &rarr; Ready for Lab Inspection</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedBatchForProc(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow">
                  Commit Event to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enter Quality Lab Test */}
      {selectedBatchForQual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-emerald-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">
                Laboratory Quality Analysis for {selectedBatchForQual.batchCode}
              </h3>
            </div>

            <form onSubmit={handleQualitySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laboratory Name</label>
                  <input
                    type="text"
                    required
                    value={qualForm.labName}
                    onChange={e => setQualForm({ ...qualForm, labName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Report Reference ID</label>
                  <input
                    type="text"
                    required
                    value={qualForm.reportReference}
                    onChange={e => setQualForm({ ...qualForm, reportReference: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Physicochemical Parameters with limit indicators */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <span className="font-bold text-emerald-950 block">Physicochemical Test Readings:</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={qualForm.moisturePct}
                      onChange={e => setQualForm({ ...qualForm, moisturePct: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Max 20.0%</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">HMF (mg/kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={qualForm.hmfMgKg}
                      onChange={e => setQualForm({ ...qualForm, hmfMgKg: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Max 40.0 mg/kg</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Diastase (Schade)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={qualForm.diastaseNumber}
                      onChange={e => setQualForm({ ...qualForm, diastaseNumber: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Min 8.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Conductivity (mS/cm)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualForm.electricalConductivityMsCm}
                      onChange={e => setQualForm({ ...qualForm, electricalConductivityMsCm: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500">Max 0.8 mS/cm</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">pH Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={qualForm.ph}
                      onChange={e => setQualForm({ ...qualForm, ph: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-500">3.2 – 4.5</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Overall Inspection Decision</label>
                <select
                  value={qualForm.overallResult}
                  onChange={e => setQualForm({ ...qualForm, overallResult: e.target.value as 'PASS' | 'FAIL' })}
                  className={`w-full p-2.5 rounded-xl border text-sm font-bold ${
                    qualForm.overallResult === 'PASS' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'
                  }`}
                >
                  <option value="PASS">PASS — Approve for Distribution</option>
                  <option value="FAIL">FAIL — Reject & Trigger Safety Alert</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedBatchForQual(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow">
                  Certify & Append Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

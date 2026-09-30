import React, { useState } from 'react';
import {
  Plus,
  QrCode,
  Sparkles,
  Search,
  Filter,
  Layers,
  MapPin,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Play,
  Download,
  Flame,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Ban,
  Calendar,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Batch, HoneySource, HoneyType, HarvestMethod } from '../../types';
import { BatchStatusBadge, VerificationBadge } from '../../components/common/StatusBadge';
import { QrModal } from '../../components/qr/QrModal';

export const ProducerDashboard: React.FC<{
  onVerifyCode: (code: string) => void;
}> = ({ onVerifyCode }) => {
  const {
    currentUser,
    batches,
    sources,
    devices,
    users,
    createBatch,
    createSource,
    registerDevice,
    simulateSensors,
    recallBatch
  } = useStore();

  const [activeTab, setActiveTab] = useState<'batches' | 'sources' | 'iot'>('batches');
  const [selectedBatchForQr, setSelectedBatchForQr] = useState<Batch | null>(null);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState<Batch | null>(null);
  const [recallReason, setRecallReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // New Batch Form State
  const [batchForm, setBatchForm] = useState({
    productName: 'Mahabaleshwar Wild Forest Raw Honey',
    honeyType: 'WILDFLOWER' as HoneyType,
    producerLotNumber: `RAVI-2026-${Math.floor(100 + Math.random() * 900)}`,
    sourceId: sources[0]?.id || '',
    harvestDate: new Date().toISOString().split('T')[0],
    harvestMethod: 'MANUAL_EXTRACTION' as HarvestMethod,
    quantityKg: 250,
    packagingType: '500g Glass Jars',
    expiryDate: new Date(Date.now() + 730 * 24 * 3600 * 1000).toISOString().split('T')[0],
    assignedProcessorId: users.find(u => u.role === 'PROCESSOR')?.id || '',
    notes: 'Pure unprocessed raw wild honey harvested from pristine mountain hives.'
  });

  // New Source Form State
  const [sourceForm, setSourceForm] = useState({
    name: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    country: 'India',
    latitude: 17.92,
    longitude: 73.66,
    floralSource: 'Wild Forest Flora'
  });

  // New Device Form State
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    batchId: ''
  });
  const [newDeviceKey, setNewDeviceKey] = useState<string | null>(null);

  // Filter batches for current producer
  const myBatches = batches.filter(b => b.producerId === currentUser?.id || currentUser?.role === 'ADMIN');
  const filteredBatches = myBatches.filter(b =>
    b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.producerLotNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = createBatch(batchForm);
    if (res.success && res.batch) {
      setShowNewBatchModal(false);
      setSelectedBatchForQr(res.batch);
    } else {
      setFormError(res.error || 'Failed to create batch.');
    }
  };

  const handleCreateSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSource(sourceForm);
    setShowNewSourceModal(false);
    setSourceForm({
      name: '',
      village: '',
      district: '',
      state: 'Maharashtra',
      country: 'India',
      latitude: 17.92,
      longitude: 73.66,
      floralSource: ''
    });
  };

  const handleCreateDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerDevice(deviceForm.name, deviceForm.batchId || undefined);
    setNewDeviceKey(res.apiKey);
  };

  const handleRecallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRecallModal && recallReason.trim()) {
      recallBatch(showRecallModal.id, recallReason.trim());
      setShowRecallModal(null);
      setRecallReason('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Producer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Producer & Apiary Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              PRODUCER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentUser?.organizationName} • {currentUser?.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">My Total Batches</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{myBatches.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{sources.length} Registered Apiaries</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Verified Authentic</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">
            {myBatches.filter(b => b.verificationStatus === 'VERIFIED').length}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Consumer-Ready</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">In Supply Chain</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">
            {myBatches.filter(b => b.verificationStatus === 'INFORMATION_INCOMPLETE').length}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Processing / In Transit</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">IoT Sensors Active</span>
          <p className="text-2xl sm:text-3xl font-black text-sky-700 font-display mt-1">
            {devices.filter(d => d.isActive).length}
          </p>
          <p className="text-[11px] text-sky-700 mt-0.5">ESP32 Temperature Nodes</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-amber-200 gap-2">
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === 'batches' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Honey Batches ({myBatches.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === 'sources' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Apiaries & Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab('iot')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === 'iot' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          IoT Devices & Telemetry Simulator ({devices.length})
        </button>
      </div>

      {/* TAB 1: Batches List */}
      {activeTab === 'batches' && (
        <div className="honey-card rounded-3xl overflow-hidden p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by code, product, lot..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20"
              />
            </div>
            <p className="text-xs text-slate-500">Showing {filteredBatches.length} batches</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Batch Code & Lot</th>
                  <th className="py-3 px-4 font-bold">Product & Floral Type</th>
                  <th className="py-3 px-4 font-bold">Quantity</th>
                  <th className="py-3 px-4 font-bold">Lifecycle State</th>
                  <th className="py-3 px-4 font-bold">Public Verification</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredBatches.map(b => (
                  <tr key={b.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                        {b.batchCode}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">Lot: {b.producerLotNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{b.productName}</p>
                      <span className="text-[10px] text-amber-800 font-semibold">{b.honeyType}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {b.quantityKg} kg
                      <p className="text-[10px] text-slate-500 font-normal">{b.packagingType}</p>
                    </td>
                    <td className="py-3 px-4">
                      <BatchStatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4">
                      <VerificationBadge status={b.verificationStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBatchForQr(b)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
                          title="Generate / Download QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onVerifyCode(b.batchCode)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-sm transition"
                        >
                          Verify Page
                        </button>
                        {b.status !== 'RECALLED' && (
                          <button
                            onClick={() => setShowRecallModal(b)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 transition"
                            title="Issue Product Recall"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-slate-900">Registered Apiaries & Geo-Locations</h3>
            <button
              onClick={() => setShowNewSourceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Apiary</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sources.map(s => (
              <div key={s.id} className="honey-card p-6 rounded-3xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">{s.name}</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Village:</strong> {s.village}, {s.district}</p>
                  <p><strong>State:</strong> {s.state}, {s.country}</p>
                  <p><strong>Flora:</strong> {s.floralSource || 'Natural Wildflora'}</p>
                  <p className="font-mono text-slate-500 text-[11px]">
                    GPS: {s.latitude?.toFixed(4)}°N, {s.longitude?.toFixed(4)}°E
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IoT Devices */}
      {activeTab === 'iot' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">ESP32 IoT Telemetry Fleet</h3>
              <p className="text-xs text-slate-500">Manage hardware devices or simulate environmental stream</p>
            </div>
            <button
              onClick={() => setShowNewDeviceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Hardware Node</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {devices.map(d => (
              <div key={d.id} className="honey-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {d.isActive ? 'ONLINE' : 'REVOKED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">
                    Key Hash: {d.apiKeyHash.substring(0, 16)}...
                  </p>
                </div>

                {/* Simulator controls */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                  <span className="font-bold text-amber-950 block">Simulator Actions:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => simulateSensors(d.batchId || 'batch-demo-01', 5, 'normal')}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-sm"
                    >
                      +5 Normal
                    </button>
                    <button
                      onClick={() => simulateSensors(d.batchId || 'batch-demo-01', 5, 'abnormal')}
                      className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition shadow-sm"
                    >
                      +5 Heat Spike (44°C)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Batch */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="honey-gradient-bg px-6 py-4 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-800" />
                <h3 className="font-display font-bold text-lg text-slate-900">Register Raw Honey Harvest Batch</h3>
              </div>
              <button onClick={() => setShowNewBatchModal(false)} className="text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={batchForm.productName}
                    onChange={e => setBatchForm({ ...batchForm, productName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Honey Floral Type</label>
                  <select
                    value={batchForm.honeyType}
                    onChange={e => setBatchForm({ ...batchForm, honeyType: e.target.value as HoneyType })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-sm font-semibold"
                  >
                    <option value="WILDFLOWER">WILDFLOWER (Wild Forest)</option>
                    <option value="MULTIFLORA">MULTIFLORA (Valley Blossom)</option>
                    <option value="ACACIA">ACACIA</option>
                    <option value="JAMUN">JAMUN (Single Origin)</option>
                    <option value="EUCALYPTUS">EUCALYPTUS</option>
                    <option value="FOREST">FOREST RESERVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Producer Lot Identifier (Unique)</label>
                  <input
                    type="text"
                    required
                    value={batchForm.producerLotNumber}
                    onChange={e => setBatchForm({ ...batchForm, producerLotNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apiary Origin Source</label>
                  <select
                    value={batchForm.sourceId}
                    onChange={e => setBatchForm({ ...batchForm, sourceId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-sm"
                  >
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.village})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.harvestDate}
                    onChange={e => setBatchForm({ ...batchForm, harvestDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={batchForm.quantityKg}
                    onChange={e => setBatchForm({ ...batchForm, quantityKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Packaging Target</label>
                  <input
                    type="text"
                    required
                    value={batchForm.packagingType}
                    onChange={e => setBatchForm({ ...batchForm, packagingType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Processor / Lab Unit</label>
                  <select
                    value={batchForm.assignedProcessorId}
                    onChange={e => setBatchForm({ ...batchForm, assignedProcessorId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                  >
                    {users.filter(u => u.role === 'PROCESSOR').map(p => (
                      <option key={p.id} value={p.id}>{p.organizationName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiryDate}
                    onChange={e => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Harvest Notes</label>
                <textarea
                  rows={2}
                  value={batchForm.notes}
                  onChange={e => setBatchForm({ ...batchForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
                >
                  Generate Batch & Genesis Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Source */}
      {showNewSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-200 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Register Apiary Station</h3>
            <form onSubmit={handleCreateSourceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Apiary Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahabaleshwar High Hive #5"
                  value={sourceForm.name}
                  onChange={e => setSourceForm({ ...sourceForm, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-amber-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    placeholder="Village"
                    value={sourceForm.village}
                    onChange={e => setSourceForm({ ...sourceForm, village: e.target.value })}
                    className="w-full p-2 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    placeholder="District"
                    value={sourceForm.district}
                    onChange={e => setSourceForm({ ...sourceForm, district: e.target.value })}
                    className="w-full p-2 rounded-xl border border-amber-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={sourceForm.latitude}
                    onChange={e => setSourceForm({ ...sourceForm, latitude: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-amber-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={sourceForm.longitude}
                    onChange={e => setSourceForm({ ...sourceForm, longitude: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-amber-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewSourceModal(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-1.5 rounded-xl bg-amber-600 text-white font-bold">Save Apiary</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Recall Reason */}
      {showRecallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-slate-900">Issue Batch Safety Recall</h3>
            </div>
            <p className="text-xs text-slate-600">
              Recalling batch <strong>{showRecallModal.batchCode}</strong> will immediately change public status to <strong>FLAGGED</strong> across all retail QR verification queries.
            </p>
            <form onSubmit={handleRecallSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Reason for safety recall (e.g. Broken jar seal reported, storage temperature non-compliance)..."
                value={recallReason}
                onChange={e => setRecallReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRecallModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md">Confirm Recall Notice</button>
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

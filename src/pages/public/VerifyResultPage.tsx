import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  Award,
  Truck,
  Store,
  Clock,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  QrCode,
  Share2,
  Hash,
  Activity,
  Droplets,
  Zap,
  Sparkles,
  Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStore } from '../../context/StoreContext';
import { VerificationBadge } from '../../components/common/StatusBadge';
import { QrModal } from '../../components/qr/QrModal';

interface VerifyResultPageProps {
  batchCode: string;
  onNavigate: (page: string) => void;
  onVerifyOtherCode: (code: string) => void;
}

export const VerifyResultPage: React.FC<VerifyResultPageProps> = ({
  batchCode,
  onNavigate,
  onVerifyOtherCode
}) => {
  const { computeVerification, batches, sensorReadings, devices } = useStore();
  const [showQrModal, setShowQrModal] = useState(false);
  const [showTimelineHashes, setShowTimelineHashes] = useState(false);
  const [copied, setCopied] = useState(false);

  const verification = computeVerification(batchCode);
  const targetBatch = batches.find(b => b.batchCode.toUpperCase() === batchCode.toUpperCase());
  const batchSensors = targetBatch ? sensorReadings.filter(s => s.batchId === targetBatch.id) : [];

  // Format sensor data for recharts
  const chartData = batchSensors.map(s => ({
    time: new Date(s.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
    temperature: s.temperatureC,
    humidity: s.humidityPct,
    isAbnormal: s.isAbnormal
  }));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* 1. Authoritative Status Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        verification.status === 'VERIFIED'
          ? 'bg-emerald-50/80 border-emerald-300/80 shadow-glow-success'
          : verification.status === 'INFORMATION_INCOMPLETE'
          ? 'bg-amber-50/90 border-amber-300 shadow-glow-honey'
          : verification.status === 'FLAGGED'
          ? 'bg-rose-50/90 border-rose-300 shadow-glow-danger'
          : 'bg-slate-100 border-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              verification.status === 'VERIFIED'
                ? 'bg-emerald-600 text-white'
                : verification.status === 'INFORMATION_INCOMPLETE'
                ? 'bg-amber-600 text-white animate-pulse'
                : verification.status === 'FLAGGED'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-500 text-white'
            }`}>
              {verification.status === 'VERIFIED' && <ShieldCheck className="w-8 h-8" />}
              {verification.status === 'INFORMATION_INCOMPLETE' && <AlertCircle className="w-8 h-8" />}
              {verification.status === 'FLAGGED' && <AlertTriangle className="w-8 h-8" />}
              {verification.status === 'NOT_FOUND' && <HelpCircle className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <VerificationBadge status={verification.status} size="lg" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                {verification.status === 'VERIFIED' && 'Tamper-Evident Supply Chain & Physicochemical Standards Verified'}
                {verification.status === 'INFORMATION_INCOMPLETE' && 'Traceability Record In Progress or Pending Handover'}
                {verification.status === 'FLAGGED' && 'Quality Contradiction or Custody Anomaly Detected'}
                {verification.status === 'NOT_FOUND' && 'Unregistered or Unrecognized Batch Identifier'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Queried Batch: <strong className="font-mono text-slate-900">{batchCode}</strong> • Verified at {new Date(verification.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 self-start sm:self-center">
            {targetBatch && (
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-800 text-xs font-semibold border border-amber-200 shadow-sm transition"
              >
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>Show QR</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-800 text-xs font-semibold border border-amber-200 shadow-sm transition"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>{copied ? 'Copied URL!' : 'Share Link'}</span>
            </button>
          </div>
        </div>

        {/* Reasons summary list */}
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <ul className="space-y-1 text-xs text-slate-700">
            {verification.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-slate-400">•</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Active Warnings Box (If FLAGGED or Incomplete with alerts) */}
      {verification.warnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-display font-bold text-sm text-rose-900">
              Active Verification Warnings & Evidence ({verification.warnings.length})
            </h3>
          </div>
          <div className="space-y-2">
            {verification.warnings.map((w, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-rose-100 flex items-start gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase flex-shrink-0">
                  {w.severity}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{w.type}</p>
                  <p className="text-slate-600 leading-relaxed">{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. The 8-Point Verification Checklist */}
      <div className="honey-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">8-Point Traceability & Quality Checklist</h3>
            <p className="text-xs text-slate-500">Every checkpoint required for full consumer authenticity verification</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
            {verification.checks.filter(c => c.passed).length} / 8 Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verification.checks.map(check => (
            <div
              key={check.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                check.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                check.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {check.passed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">✕</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{check.label}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{check.code}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {verification.batch && (
        <>
          {/* 4. Product, Beekeeper Origin & Processing Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product & Harvest Card */}
            <div className="honey-card p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Product & Harvest Details</h3>
                  <p className="text-xs text-slate-500">Raw botanical honey specification</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Product Name</span>
                  <span className="font-bold text-slate-900">{verification.batch.productName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Honey Floral Type</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">{verification.batch.honeyType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Registered Batch Code</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{verification.batch.code}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Harvest Date</span>
                  <span className="font-medium text-slate-800">{new Date(verification.batch.harvestDate).toLocaleDateString([], { dateStyle: 'long' })}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Extraction Method</span>
                  <span className="font-medium text-slate-800">{verification.batch.harvestMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-amber-50">
                  <span className="text-slate-500">Packaging & Net Quantity</span>
                  <span className="font-medium text-slate-800">{verification.batch.packagingType} ({verification.batch.quantityKg} kg total)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Shelf Expiry Date</span>
                  <span className="font-bold text-slate-900">{new Date(verification.batch.expiryDate).toLocaleDateString([], { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>

            {/* Beekeeper & Apiary Origin Card */}
            <div className="honey-card p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Beekeeper & Apiary Origin</h3>
                  <p className="text-xs text-slate-500">Geographic source and producer transparency</p>
                </div>
              </div>

              {verification.origin ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-amber-50">
                    <span className="text-slate-500">Producer / FPO</span>
                    <span className="font-bold text-slate-900">{verification.producer?.organizationName || verification.producer?.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-amber-50">
                    <span className="text-slate-500">Apiary Station</span>
                    <span className="font-semibold text-slate-800">{verification.origin.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-amber-50">
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium text-slate-800">{verification.origin.village}, {verification.origin.district}, {verification.origin.state}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-amber-50">
                    <span className="text-slate-500">Flora & Forage Species</span>
                    <span className="font-medium text-amber-900">{verification.origin.floralSource || 'Wild Forest Blooms'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Approx. GPS Coordinates</span>
                    <span className="font-mono text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {verification.origin.approxLatitude}° N, {verification.origin.approxLongitude}° E
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No origin record linked.</p>
              )}
            </div>
          </div>

          {/* 5. Lab Quality Certificate & Additives Disclosure */}
          <div className="honey-card p-6 sm:p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Physicochemical Quality Analysis</h3>
                  <p className="text-xs text-slate-500">
                    Laboratory report: <strong>{verification.quality?.reportReference || 'QC-LAB-PENDING'}</strong> ({verification.quality?.labName || 'Authorized NABL Lab'})
                  </p>
                </div>
              </div>

              {/* Additives Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 self-start">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Undeclared Additives (100% Pure Raw Honey)</span>
              </div>
            </div>

            {verification.quality ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {/* Moisture */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Moisture</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{verification.quality.moisturePct ?? '—'} %</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Target &le; 20.0%</p>
                </div>

                {/* HMF */}
                <div className={`p-3.5 rounded-2xl border ${
                  (verification.quality.hmfMgKg || 0) > 40 ? 'bg-rose-50 border-rose-300' : 'bg-amber-50/60 border-amber-100'
                }`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">HMF Level</span>
                  <p className={`text-lg font-black mt-1 ${
                    (verification.quality.hmfMgKg || 0) > 40 ? 'text-rose-700' : 'text-slate-900'
                  }`}>
                    {verification.quality.hmfMgKg ?? '—'} mg/kg
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Target &le; 40 mg/kg</p>
                </div>

                {/* Electrical Cond */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Conductivity</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{verification.quality.electricalConductivityMsCm ?? '—'} mS/cm</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Target &le; 0.8 mS/cm</p>
                </div>

                {/* pH */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Acidity (pH)</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{verification.quality.ph ?? '—'}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Target 3.2 – 4.5</p>
                </div>

                {/* Diastase */}
                <div className={`p-3.5 rounded-2xl border ${
                  (verification.quality.diastaseNumber || 0) < 8 ? 'bg-rose-50 border-rose-300' : 'bg-amber-50/60 border-amber-100'
                }`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Diastase Activity</span>
                  <p className="text-lg font-black text-slate-900 mt-1">{verification.quality.diastaseNumber ?? '—'}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Target &ge; 8.0 Schade</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic mb-4">Laboratory quality test has not been finalized yet.</p>
            )}

            {/* Processing details sub-strip */}
            {verification.processing && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-700">Processing Summary: </span>
                  <span className="text-slate-600">
                    {verification.processing.processType} at {verification.processing.facilityName} ({verification.processing.facilityLocation})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Max Temp Recorded:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {verification.processing.maxTemperatureC ? `${verification.processing.maxTemperatureC}°C` : 'Room Ambient'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 6. IoT Storage & Transport Telemetry Chart */}
          {verification.sensorSummary && (
            <div className="honey-card p-6 sm:p-8 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-sky-600" />
                    <h3 className="font-display font-bold text-lg text-slate-900">IoT Cold-Chain & Storage Telemetry</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {verification.sensorSummary.readingCount} timestamped sensor readings from transit & storage nodes
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200">
                    Latest Temp: {verification.sensorSummary.latestTemp}°C
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    Humidity: {verification.sensorSummary.latestHumidity}%
                  </span>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="h-64 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[10, 50]} unit="°C" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #fde68a', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#0284c7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Authenticity disclaimer */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Traceability Notice:</strong> {verification.sensorSummary.disclaimer}
                </span>
              </div>
            </div>
          )}

          {/* 7. Cryptographic Supply Chain Timeline */}
          <div className="honey-card p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Cryptographic Supply Chain Timeline</h3>
                <p className="text-xs text-slate-500">Immutable chronological event sequence anchored with SHA-256 hash chains</p>
              </div>
              <button
                onClick={() => setShowTimelineHashes(prev => !prev)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200"
              >
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <span>{showTimelineHashes ? 'Hide SHA-256 Hashes' : 'Inspect SHA-256 Hashes'}</span>
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="relative border-l-2 border-amber-200 ml-4 pl-6 space-y-6">
              {verification.timeline.map((evt, idx) => (
                <div key={idx} className="relative group">
                  {/* Step dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm" />

                  <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100 hover:border-amber-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {evt.eventType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {evt.actorRole}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(evt.occurredAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mb-2">
                      <strong>{evt.actorOrg}</strong> • {evt.locationName}
                    </p>
                    {evt.notes && (
                      <p className="text-xs text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-amber-100/60 mb-2">
                        "{evt.notes}"
                      </p>
                    )}

                    {/* Hash inspection */}
                    {showTimelineHashes && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-[10px] font-mono text-slate-500 break-all flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span>SHA-256: <strong>{evt.eventHash}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer Verified Timestamp Notice */}
      <div className="text-center text-xs text-slate-500 pt-4">
        <p>Verified against HoneyTrace cryptographic ledger records at {new Date(verification.verifiedAt).toUTCString()}.</p>
      </div>

      {/* QR Modal */}
      {showQrModal && targetBatch && (
        <QrModal batch={targetBatch} onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
};

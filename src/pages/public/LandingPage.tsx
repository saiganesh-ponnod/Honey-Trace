import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Thermometer,
  Award,
  ChevronRight,
  TrendingUp,
  Store,
  Truck,
  Flame,
  FileCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { VerificationBadge } from '../../components/common/StatusBadge';

interface LandingPageProps {
  onVerifyCode: (code: string) => void;
  onOpenScanner: () => void;
  onOpenDemoGuide: () => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onVerifyCode,
  onOpenScanner,
  onOpenDemoGuide,
  onNavigate
}) => {
  const { batches, sources, devices, alerts } = useStore();
  const [inputCode, setInputCode] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onVerifyCode(inputCode.trim().toUpperCase());
    }
  };

  const verifiedCount = batches.filter(b => b.verificationStatus === 'VERIFIED').length;
  const inProgressCount = batches.filter(b => b.verificationStatus === 'INFORMATION_INCOMPLETE').length;
  const flaggedCount = batches.filter(b => b.verificationStatus === 'FLAGGED').length;

  return (
    <div className="space-y-16 animate-fadeIn pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="honey-gradient-bg rounded-3xl p-8 sm:p-12 lg:p-16 border border-amber-200/80 shadow-premium relative">
          {/* Decorative background honeycomb elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>Cryptographic Traceability • FSSAI & Codex Standards</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1] mb-6">
              Know Every Drop. <br />
              <span className="honey-gradient-text">Pure Honey Verified</span> from Farm to Jar.
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-8">
              HoneyTrace is the tamper-evident transparency platform connecting beekeepers, lab inspectors, cold-chain couriers, and retailers with consumer-facing QR verification and real-time IoT temperature telemetry.
            </p>

            {/* Quick Verification Search Box */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-amber-300/80 max-w-xl mb-8">
              <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-amber-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Enter Batch Code (e.g. HT-2026-DEMO01)"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base rounded-xl bg-amber-50/30 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase text-slate-900 placeholder:text-slate-400 font-semibold"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                    title="Open Camera QR Scanner"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* 1-Click Demo Scenarios Pills */}
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Authoritative Seed Batches (1-Click Test):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO01')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-emerald-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold">DEMO01</span>
                  <span className="text-slate-500 text-[11px]">(Authentic)</span>
                </button>

                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO02')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-amber-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">!</span>
                  <span className="font-mono font-bold">DEMO02</span>
                  <span className="text-slate-500 text-[11px]">(In Transit)</span>
                </button>

                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO03')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-900 border border-rose-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-mono font-bold">DEMO03</span>
                  <span className="text-slate-500 text-[11px]">(Flagged Anomaly)</span>
                </button>

                <button
                  onClick={() => onVerifyCode('HT-2026-FAKE99')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span className="font-mono font-bold">FAKE99</span>
                  <span className="text-slate-500 text-[11px]">(Unregistered)</span>
                </button>

                <button
                  onClick={onOpenDemoGuide}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm text-xs font-bold flex items-center gap-1.5 transition ml-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>13-Step Live Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="honey-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Batches</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">{verifiedCount}</p>
            <p className="text-xs text-emerald-700 font-medium mt-1">100% SHA-256 Chained</p>
          </div>

          <div className="honey-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Apiaries</span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">{sources.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Mahabaleshwar & Nashik</p>
          </div>

          <div className="honey-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IoT Telemetry Nodes</span>
              <Cpu className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">{devices.length}</p>
            <p className="text-xs text-sky-700 font-medium mt-1">ESP32 Temperature Loggers</p>
          </div>

          <div className="honey-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Alerts</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">{flaggedCount}</p>
            <p className="text-xs text-rose-700 font-medium mt-1">Automated Anomaly Defense</p>
          </div>
        </div>
      </section>

      {/* The 4-Step Trust Chain */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight mb-3">
            How HoneyTrace Protects the Supply Chain
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From raw comb harvest to retail checkout, every stakeholder cryptographically signs events on an immutable ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="honey-card p-6 rounded-3xl relative">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-4 border border-amber-300">
              01
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Beekeeper Harvest</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Registered producers log apiary GPS coordinates, floral variety (Jamun, Wildflower), quantity, and generate unique batch codes.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" /> Genesis Event Hash
            </span>
          </div>

          {/* Step 2 */}
          <div className="honey-card p-6 rounded-3xl relative">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm mb-4 border border-blue-300">
              02
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Lab Quality Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Authorized labs test moisture, HMF, electrical conductivity, and diastase enzyme activity against strict reference thresholds.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              <FileCheck className="w-3 h-3 text-blue-600" /> FSSAI/Codex PASS
            </span>
          </div>

          {/* Step 3 */}
          <div className="honey-card p-6 rounded-3xl relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-sm mb-4 border border-purple-300">
              03
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Cold-Chain Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Distributors record custody handovers while ESP32 IoT nodes monitor live storage temperatures to prevent thermal degradation.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              <Thermometer className="w-3 h-3 text-purple-600" /> &lt;30°C Integrity
            </span>
          </div>

          {/* Step 4 */}
          <div className="honey-card p-6 rounded-3xl relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-300">
              04
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Consumer Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Consumers scan the on-jar QR code without installing any app. The engine validates all 8 checkpoints in under 2 seconds.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Instant Trust
            </span>
          </div>
        </div>
      </section>

      {/* Quality Standards Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900">
                Honey Quality & Physicochemical Standards
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Authoritative reference parameters configured in HoneyTrace vs common adulteration risks.
              </p>
            </div>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start"
            >
              <span>Read Full Architecture Spec</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Parameter</th>
                  <th className="py-3 px-4 font-bold">HoneyTrace Target</th>
                  <th className="py-3 px-4 font-bold">Standard Limit (FSSAI/Codex)</th>
                  <th className="py-3 px-4 font-bold">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Moisture Content</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">17.0% – 19.0%</td>
                  <td className="py-3 px-4 text-slate-600">Max 20.0%</td>
                  <td className="py-3 px-4 text-slate-500">High moisture leads to wild yeast fermentation and spoiling.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Hydroxymethylfurfural (HMF)</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">&lt; 25 mg/kg</td>
                  <td className="py-3 px-4 text-slate-600">Max 40.0 mg/kg</td>
                  <td className="py-3 px-4 text-slate-500">Formed by excessive heat pasteurization or invert sugar syrup adulteration.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Diastase Activity</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">&gt; 12 Schade Units</td>
                  <td className="py-3 px-4 text-slate-600">Min 8.0 Schade Units</td>
                  <td className="py-3 px-4 text-slate-500">Natural digestive enzyme from worker bees. Destroyed by heating.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Electrical Conductivity</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">0.3 – 0.6 mS/cm</td>
                  <td className="py-3 px-4 text-slate-600">Max 0.8 mS/cm</td>
                  <td className="py-3 px-4 text-slate-500">Validates authentic botanical blossom origin vs artificial solutions.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Storage Temperature</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">18°C – 26°C (IoT Monitored)</td>
                  <td className="py-3 px-4 text-slate-600">Alert at &gt; 35°C, Extreme &gt; 40°C</td>
                  <td className="py-3 px-4 text-slate-500">High ambient heat accelerates HMF synthesis and enzyme decay.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="honey-gradient-bg p-8 sm:p-12 rounded-3xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="font-display font-black text-2xl text-slate-900 mb-2">
              Ready to verify or manage honey batches?
            </h3>
            <p className="text-sm text-slate-700">
              Access the live workspace for Producers, Quality Labs, Logistics, Retailers, or Admins.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
            >
              Sign In to Workspace
            </button>
            <button
              onClick={onOpenDemoGuide}
              className="px-6 py-3 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-sm border border-amber-300 shadow-sm transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Launch 13-Step Tour</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

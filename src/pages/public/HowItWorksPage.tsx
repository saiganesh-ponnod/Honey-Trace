import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Hash,
  ArrowRight,
  Sparkles,
  Lock,
  Thermometer,
  AlertTriangle,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export const HowItWorksPage: React.FC<{
  onVerifyCode: (code: string) => void;
  onNavigate: (page: string) => void;
}> = ({ onVerifyCode, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>System Architecture & Verification Principles</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight mb-4">
          The Science of Trust in HoneyTrace
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          How cryptographic SHA-256 event chaining, calibrated laboratory parameters, and real-time IoT storage telemetry eliminate counterfeit claims and protect pure honey producers.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="honey-card p-6 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4">
            <Hash className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Cryptographic SHA-256 Chaining</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every harvest, processing step, lab test, and custody handover computes a mathematical cryptographic hash including the signature of the previous event. Any retro-active tampering instantly invalidates the ledger.
          </p>
        </div>

        <div className="honey-card p-6 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-4">
            <Award className="w-6 h-6 text-blue-700" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-2">FSSAI Physicochemical Rules</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated boundary evaluation flags test records exceeding maximum moisture (&gt;20%), elevated HMF (&gt;40 mg/kg), or depleted diastase (&lt;8 Schade units), catching invert sugar syrup adulteration.
          </p>
        </div>

        <div className="honey-card p-6 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold mb-4">
            <Cpu className="w-6 h-6 text-sky-700" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Continuous IoT Telemetry</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ESP32 microcontroller nodes equipped with calibrated temperature, humidity, and weight sensors stream timestamped cold-chain storage data directly to the batch timeline.
          </p>
        </div>
      </div>

      {/* Verification State Machine Diagram / Flow */}
      <div className="bg-white rounded-3xl border border-amber-200 p-8 shadow-sm">
        <h3 className="font-display font-bold text-xl text-slate-900 mb-2">The Authoritative Verification State Machine</h3>
        <p className="text-xs text-slate-500 mb-6">
          When a consumer scans a QR code, the verification engine evaluates records in strict priority order:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-4">
            <span className="w-8 h-8 rounded-xl bg-slate-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">1</span>
            <div>
              <p className="font-bold text-xs text-slate-900">NOT FOUND Check</p>
              <p className="text-xs text-slate-600">If code doesn't exist in registry &rarr; Return NOT_FOUND & log anonymous low-severity scan alert.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-4">
            <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">2</span>
            <div>
              <p className="font-bold text-xs text-rose-900">FLAGGED Check</p>
              <p className="text-xs text-rose-700">If batch is RECALLED, EXPIRED, latest lab test = FAIL, hash chain broken, or active HIGH/CRITICAL alert &rarr; Mark FLAGGED.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
            <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">3</span>
            <div>
              <p className="font-bold text-xs text-amber-900">INFORMATION INCOMPLETE Check</p>
              <p className="text-xs text-amber-700">If batch is still IN_TRANSIT, any of the 8 checklist items missing, or active MEDIUM alert &rarr; Mark INFORMATION_INCOMPLETE.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">4</span>
            <div>
              <p className="font-bold text-xs text-emerald-900">VERIFIED AUTHENTIC</p>
              <p className="text-xs text-emerald-700">All 8 criteria passed, unbroken chain of custody, validated lab certificate, active sensor telemetry &rarr; Mark VERIFIED.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="honey-gradient-bg p-8 rounded-3xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-900">Experience the Live Demo</h4>
          <p className="text-xs text-slate-700">Try verifying authentic and flagged sample cases immediately.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onVerifyCode('HT-2026-DEMO01')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
          >
            Verify DEMO01
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-800 font-semibold text-xs border border-amber-300 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

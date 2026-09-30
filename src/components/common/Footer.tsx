import React from 'react';
import { ShieldCheck, Lock, Sparkles, Heart, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC<{ onVerifyCode: (code: string) => void }> = ({ onVerifyCode }) => {
  return (
    <footer className="bg-white border-t border-amber-200/80 mt-16 pt-12 pb-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl honey-gradient-bg flex items-center justify-center text-amber-800 font-bold border border-amber-300">
                HT
              </div>
              <span className="font-display font-black text-lg text-slate-900 tracking-tight">Honey<span className="text-amber-600">Trace</span></span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Cryptographic farm-to-bottle traceability, real-time IoT storage telemetry, and authoritative verification for pure honey.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>SHA-256 Event Signatures • FSSAI Reference Standard</span>
            </div>
          </div>

          {/* Col 2: Quick Demo Verifications */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm font-display">Instant Demo Verifications</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO01')}
                  className="hover:text-amber-700 flex items-center gap-1.5 transition text-left"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>HT-2026-DEMO01</strong> (Verified Authentic)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO02')}
                  className="hover:text-amber-700 flex items-center gap-1.5 transition text-left"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center text-[10px] font-bold">!</span>
                  <span><strong>HT-2026-DEMO02</strong> (In Transit / Incomplete)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onVerifyCode('HT-2026-DEMO03')}
                  className="hover:text-amber-700 flex items-center gap-1.5 transition text-left"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-700 flex items-center justify-center text-[10px] font-bold">✕</span>
                  <span><strong>HT-2026-DEMO03</strong> (Flagged Quality Anomaly)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onVerifyCode('HT-2026-FAKE99')}
                  className="hover:text-amber-700 flex items-center gap-1.5 transition text-left"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">?</span>
                  <span><strong>HT-2026-FAKE99</strong> (Unregistered Code)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Reference Parameters */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm font-display">Reference Quality Standards</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li>• <strong>Moisture:</strong> Max 20.0% (Prevents fermentation)</li>
              <li>• <strong>HMF:</strong> Max 40.0 mg/kg (No excessive heat)</li>
              <li>• <strong>Electrical Cond.:</strong> Max 0.8 mS/cm (Floral nectar)</li>
              <li>• <strong>Diastase Activity:</strong> Min 8.0 Schade Units (Enzymes)</li>
              <li>• <strong>Zero Additives:</strong> No C3/C4 sugars or syrups</li>
            </ul>
          </div>

          {/* Col 4: Honesty & Transparency Disclaimer */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm font-display">Transparency Principles</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              HoneyTrace verifies complete, authorized, and tamper-evident supply chain trails. Sensor readings are supporting quality records and not standalone laboratory proof. Missing data is reported honestly as <em>"Information Incomplete"</em>.
            </p>
            <p className="text-[10px] text-slate-400">
              © 2026 HoneyTrace. Version 1.0 (MVP) • Built with React 18, Vite, TypeScript & Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

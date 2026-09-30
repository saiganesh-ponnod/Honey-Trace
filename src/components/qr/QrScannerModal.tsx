import React, { useState } from 'react';
import { X, QrCode, Camera, Upload, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface QrScannerModalProps {
  onClose: () => void;
  onScanCode: (code: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onScanCode }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanCode(manualCode.trim().toUpperCase());
      onClose();
    }
  };

  const sampleDemoCodes = [
    { code: 'HT-2026-DEMO01', status: 'VERIFIED', label: 'Authentic Sahyadri Forest Honey' },
    { code: 'HT-2026-DEMO02', status: 'INCOMPLETE', label: 'Nashik Multiflora (In Transit)' },
    { code: 'HT-2026-DEMO03', status: 'FLAGGED', label: 'Flagged Anomaly & Temp Abuse' },
    { code: 'HT-2026-FAKE99', status: 'NOT_FOUND', label: 'Counterfeit / Unregistered Code' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
        {/* Header */}
        <div className="honey-gradient-bg px-6 py-4 border-b border-amber-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Scan Product QR Code</h3>
              <p className="text-xs text-amber-900">Instant farm-to-bottle cryptographic verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-300/40 text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Simulated Camera Viewfinder */}
          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden mb-6 border-2 border-amber-400/40 shadow-inner">
            <div className="absolute inset-8 border-2 border-dashed border-amber-400/70 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-xs font-mono text-amber-300 bg-slate-900/80 px-3 py-1 rounded-full shadow">
                Align QR within frame
              </span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-bounce" />
            
            <Camera className="w-10 h-10 text-amber-400/40 mb-2" />
            <p className="text-xs text-slate-400 font-medium z-10">Web Camera Scanner Ready</p>
          </div>

          {/* Quick Demo Batch selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Quick Test Demo Scenarios (1-Click)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleDemoCodes.map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    onScanCode(item.code);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-100/60 hover:border-amber-300 transition text-left group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-amber-900">{item.code}</span>
                      {item.status === 'VERIFIED' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      {item.status === 'INCOMPLETE' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                      {item.status === 'FLAGGED' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      {item.status === 'NOT_FOUND' && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{item.label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Or Enter 10-Character Batch Code Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HT-2026-DEMO01"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase bg-amber-50/20"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm disabled:opacity-50 transition shadow-sm"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

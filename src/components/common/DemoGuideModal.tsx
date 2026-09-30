import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, Play, Sparkles, Shield, AlertTriangle, ArrowRight, RefreshCw, Cpu, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface DemoGuideModalProps {
  onClose: () => void;
  onNavigate: (page: string) => void;
  onVerifyCode: (code: string) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ onClose, onNavigate, onVerifyCode }) => {
  const { users, quickSwitchUser, simulateSensors, tamperEvent, resetToDemoSeed } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      step: 1,
      title: 'Producer Login & Hive Registry',
      role: 'PRODUCER',
      email: 'ravi@sahyadrihoney.demo',
      desc: 'Log in as Ravi Kale (Sahyadri Wild Honey FPO) to manage high-altitude apiary sources and batches.',
      actionText: 'Switch to Ravi (Producer)',
      action: () => {
        const u = users.find(x => x.email === 'ravi@sahyadrihoney.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('producer');
      }
    },
    {
      step: 2,
      title: 'Batch Creation & Lot Number',
      role: 'PRODUCER',
      email: 'ravi@sahyadrihoney.demo',
      desc: 'Create a raw honey harvest record (e.g. Lot RAVI-2026-045). System validates uniqueness and creates genesis hash event.',
      actionText: 'Open New Batch Form',
      action: () => {
        onNavigate('producer-new-batch');
      }
    },
    {
      step: 3,
      title: 'Cryptographic Batch Code Generation',
      role: 'PRODUCER',
      email: 'ravi@sahyadrihoney.demo',
      desc: 'Every batch receives an unambiguous unique code: HT-2026-DEMO01.',
      actionText: 'View Batch Registry',
      action: () => {
        onNavigate('producer');
      }
    },
    {
      step: 4,
      title: 'Generate & Download QR Code',
      role: 'PRODUCER',
      email: 'ravi@sahyadrihoney.demo',
      desc: 'QR contains only the public verification link (no private data). Ready for jar labels.',
      actionText: 'Preview QR on DEMO01',
      action: () => {
        onNavigate('producer');
      }
    },
    {
      step: 5,
      title: 'IoT Sensor Telemetry Stream',
      role: 'PRODUCER',
      email: 'ravi@sahyadrihoney.demo',
      desc: 'Ingest real ESP32 or simulated sensor readings (temperature, humidity, weight, TDS).',
      actionText: 'Simulate 5 Telemetry Readings',
      action: () => {
        simulateSensors('batch-demo-01', 5, 'normal');
        onNavigate('producer');
      }
    },
    {
      step: 6,
      title: 'Processor Records Processing Details',
      role: 'PROCESSOR',
      email: 'processing@sahyadriprocessors.demo',
      desc: 'Switch to Sahyadri Processing Unit. Record cloth filtration, temperature control, and zero-additives declaration.',
      actionText: 'Switch to Processor Dashboard',
      action: () => {
        const u = users.find(x => x.email === 'processing@sahyadriprocessors.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('processor');
      }
    },
    {
      step: 7,
      title: 'Quality Lab Test & Parameter Limits',
      role: 'PROCESSOR',
      email: 'quality@qualichecklabs.demo',
      desc: 'Dr. Anjali (QualiCheck NABL Labs) enters moisture (17.8%), HMF (18.4 mg/kg), and diastase (14.6) with PASS result.',
      actionText: 'Switch to Quality Lab Inspector',
      action: () => {
        const u = users.find(x => x.email === 'quality@qualichecklabs.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('processor');
      }
    },
    {
      step: 8,
      title: 'Distributor Pickup & Cold-Chain Dispatch',
      role: 'DISTRIBUTOR',
      email: 'ops@greenroute.demo',
      desc: 'Sameer Shaikh (GreenRoute Logistics) picks up the batch, logs Pune-Mumbai GPS check-ins, and dispatches to FreshBasket.',
      actionText: 'Switch to Distributor Dashboard',
      action: () => {
        const u = users.find(x => x.email === 'ops@greenroute.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('distributor');
      }
    },
    {
      step: 9,
      title: 'Retailer Confirms Receipt & Stocking',
      role: 'RETAILER',
      email: 'store@freshbasket.demo',
      desc: 'Neha Joshi (FreshBasket Organic) inspects jars (Condition: OK) and moves batch into store aisle shelf inventory.',
      actionText: 'Switch to Retailer Dashboard',
      action: () => {
        const u = users.find(x => x.email === 'store@freshbasket.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('retailer');
      }
    },
    {
      step: 10,
      title: 'Public Consumer Verification (VERIFIED)',
      role: 'PUBLIC CONSUMER',
      email: 'No login required',
      desc: 'Scan QR or open verification URL for HT-2026-DEMO01. See 8-point checklist pass and green VERIFIED AUTHENTIC status.',
      actionText: 'Open Public Verify: DEMO01',
      action: () => {
        onVerifyCode('HT-2026-DEMO01');
      }
    },
    {
      step: 11,
      title: 'Examine Cryptographic Hash Timeline',
      role: 'PUBLIC CONSUMER',
      email: 'No login required',
      desc: 'Inspect tamper-evident SHA-256 event hashes and environmental telemetry charts on the public verify page.',
      actionText: 'Verify DEMO02 (In Transit)',
      action: () => {
        onVerifyCode('HT-2026-DEMO02');
      }
    },
    {
      step: 12,
      title: 'Suspicious Case Detection (FLAGGED & NOT FOUND)',
      role: 'PUBLIC CONSUMER',
      email: 'No login required',
      desc: 'Test HT-2026-DEMO03 (Flagged for high HMF, heat abuse, and custody gap) and HT-2026-FAKE99 (Unregistered).',
      actionText: 'Test Flagged Case DEMO03',
      action: () => {
        onVerifyCode('HT-2026-DEMO03');
      }
    },
    {
      step: 13,
      title: 'Admin Audit Ledger & Alert Triage',
      role: 'ADMIN',
      email: 'admin@honeytrace.demo',
      desc: 'Vikram Rao reviews platform security alerts, investigates JSON evidence, and inspects immutable audit logs.',
      actionText: 'Switch to Admin & Safety Dashboard',
      action: () => {
        const u = users.find(x => x.email === 'admin@honeytrace.demo');
        if (u) quickSwitchUser(u.id);
        onNavigate('admin');
      }
    }
  ];

  const current = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="honey-gradient-bg px-6 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Interactive 13-Step Live Demo</h3>
              <p className="text-xs text-amber-900">Follow the PRD Section 20.2 evaluation path step by step</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-amber-300/40 text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900">Step {current.step} of 13</span>
          <div className="flex gap-1">
            {demoSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`w-4 h-2 rounded-full transition-all ${idx === currentStep ? 'w-8 bg-amber-600' : idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Role: {current.role}
            </span>
            <span className="text-xs text-slate-500 font-mono">({current.email})</span>
          </div>

          <h4 className="text-xl font-bold text-slate-900 mb-2 font-display">{current.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {current.desc}
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
              <Play className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Recommended Action</span>
            </div>
            <button
              onClick={() => {
                current.action();
                onClose();
              }}
              className="py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tamper simulation callout */}
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span><strong>Bonus Cryptographic Proof:</strong> Tamper with an event to test SHA-256 chain integrity.</span>
            </div>
            <button
              onClick={() => {
                tamperEvent('evt-02', 'TAMPERED: Illicit inverted syrup blend added during processing');
                onVerifyCode('HT-2026-DEMO01');
                onClose();
              }}
              className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition"
            >
              Tamper DEMO01
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
          >
            Previous Step
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetToDemoSeed();
                setCurrentStep(0);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 transition"
              title="Reset state to initial PRD seed data"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Demo Seed
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(demoSteps.length - 1, prev + 1))}
              disabled={currentStep === demoSteps.length - 1}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-30 shadow-sm"
            >
              Next Step ({currentStep + 2}/13)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

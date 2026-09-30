import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { Batch } from '../../types';

interface QrModalProps {
  batch: Batch;
  onClose: () => void;
  onVerifyNow?: (code: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({ batch, onClose, onVerifyNow }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const verifyUrl = `${window.location.origin}/#verify/${batch.batchCode}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, verifyUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#78350f', // deep amber honey
          light: '#ffffff'
        }
      });
    }
  }, [verifyUrl]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${batch.batchCode}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
        {/* Header decoration */}
        <div className="honey-gradient-bg px-6 py-5 border-b border-amber-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-900 font-bold">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Cryptographic Product QR</h3>
              <p className="text-xs text-amber-900/80">Resolves directly to public verification URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-300/40 text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="inline-block p-4 rounded-3xl bg-amber-50/50 border border-amber-200/80 shadow-inner mb-4">
            <canvas ref={canvasRef} className="rounded-xl shadow-sm" />
          </div>

          <div className="mb-4">
            <span className="inline-block font-mono text-sm font-bold tracking-wider px-3 py-1 rounded-lg bg-amber-100/70 text-amber-950 border border-amber-300/60 mb-1">
              {batch.batchCode}
            </span>
            <p className="font-medium text-slate-900 text-base">{batch.productName}</p>
            <p className="text-xs text-slate-500">Lot: {batch.producerLotNumber} • Net Wt: {batch.quantityKg} kg</p>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100 text-left mb-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Standard Verification URI</span>
            </div>
            <p className="text-xs font-mono text-slate-600 break-all">{verifyUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPng}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium text-sm border border-amber-200 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-700" />
              Download PNG
            </button>
            <button
              onClick={() => {
                if (onVerifyNow) onVerifyNow(batch.batchCode);
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md transition"
            >
              <ExternalLink className="w-4 h-4" />
              Test Verify Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

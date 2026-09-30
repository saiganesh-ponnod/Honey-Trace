import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

export const RequestAccessPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { requestAccess } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PRODUCER');
  const [organizationName, setOrganizationName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestAccess({
      name,
      email,
      role,
      organizationName,
      location,
      phone
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-xl">
        {!submitted ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl honey-gradient-bg flex items-center justify-center text-amber-800 font-bold border border-amber-300 mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-amber-700" />
              </div>
              <h1 className="font-display font-black text-2xl text-slate-900">Request Stakeholder Access</h1>
              <p className="text-xs text-slate-500 mt-1">
                Self-register your organization for administrator verification and onboarding.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Shinde"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization / FPO Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Western Ghats Forest Honey Initiative"
                  value={organizationName}
                  onChange={e => setOrganizationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@org.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requested Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm font-semibold"
                  >
                    <option value="PRODUCER">PRODUCER (Beekeeper/FPO)</option>
                    <option value="PROCESSOR">PROCESSOR / Lab Inspector</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR (Logistics)</option>
                    <option value="RETAILER">RETAILER (Store/Market)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 94220 11998"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolhapur, Maharashtra"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Submit Access Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900">Access Request Submitted!</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your registration as <strong>{role}</strong> for <strong>{organizationName}</strong> has been placed in the Administrator Approval Queue.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow"
              >
                Open Admin Approval Queue
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="px-4 py-2 rounded-xl bg-amber-100 text-amber-950 font-semibold text-xs border border-amber-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

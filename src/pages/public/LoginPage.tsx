import React, { useState } from 'react';
import { Sparkles, Lock, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { users, login, quickSwitchUser } = useStore();
  const [email, setEmail] = useState('ravi@sahyadrihoney.demo');
  const [password, setPassword] = useState('HoneyTrace@2026');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(email);
    if (result.success) {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        switch (user.role) {
          case 'PRODUCER': onNavigate('producer'); break;
          case 'PROCESSOR': onNavigate('processor'); break;
          case 'DISTRIBUTOR': onNavigate('distributor'); break;
          case 'RETAILER': onNavigate('retailer'); break;
          case 'ADMIN': onNavigate('admin'); break;
          default: onNavigate('landing'); break;
        }
      }
    } else {
      setError(result.message || 'Login failed.');
    }
  };

  const handleQuickLogin = (userId: string, role: UserRole) => {
    quickSwitchUser(userId);
    switch (role) {
      case 'PRODUCER': onNavigate('producer'); break;
      case 'PROCESSOR': onNavigate('processor'); break;
      case 'DISTRIBUTOR': onNavigate('distributor'); break;
      case 'RETAILER': onNavigate('retailer'); break;
      case 'ADMIN': onNavigate('admin'); break;
      default: onNavigate('landing'); break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Col: Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="w-12 h-12 rounded-2xl honey-gradient-bg flex items-center justify-center text-amber-800 font-bold border border-amber-300 shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight mb-2">
              Sign In to HoneyTrace
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Authorized portal for beekeepers, lab inspectors, logistics coordinators, and retailers.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Authoritative Demo Seed Accounts</span>
            </p>
            <p className="text-slate-600">All demo accounts use password <code>HoneyTrace@2026</code>. Or use the 1-click quick login shortcuts on the right.</p>
          </div>
        </div>

        {/* Right Col: Login Form + Quick Switcher */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-amber-200 shadow-xl">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-amber-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-amber-50/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Shortcuts */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              1-Click Instant Demo Login as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.filter(u => u.status === 'APPROVED').slice(0, 6).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.id, u.role)}
                  className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-100/70 transition text-left text-xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900 truncate">{u.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">{u.role}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{u.organizationName}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

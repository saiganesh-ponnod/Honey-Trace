import React, { useState } from 'react';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Search,
  User,
  LogOut,
  ChevronDown,
  Layers,
  RefreshCw,
  Home,
  Compass,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenScanner: () => void;
  onOpenDemoGuide: () => void;
  onVerifyCode: (code: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenScanner,
  onOpenDemoGuide,
  onVerifyCode
}) => {
  const { currentUser, users, quickSwitchUser, logout, resetToDemoSeed, alerts } = useStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAlertsCount = alerts.filter(a => a.status === 'OPEN' && a.affectsVerification).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onVerifyCode(searchQuery.trim().toUpperCase());
      setSearchQuery('');
    }
  };

  const getRoleDashboardPage = (role: UserRole) => {
    switch (role) {
      case 'PRODUCER': return 'producer';
      case 'PROCESSOR': return 'processor';
      case 'DISTRIBUTOR': return 'distributor';
      case 'RETAILER': return 'retailer';
      case 'ADMIN': return 'admin';
      default: return 'landing';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-sm">
      {/* Top Demo Banner / Role Switcher Quickbar */}
      <div className="bg-amber-100/70 border-b border-amber-200/60 px-4 py-1.5 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px]">
            <Sparkles className="w-3 h-3" /> MVP Live Demo
          </span>
          <span className="hidden sm:inline text-amber-900/90 font-medium">
            Active Identity: <strong>{currentUser ? `${currentUser.name} (${currentUser.organizationName})` : 'Public Consumer (No Login)'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>13-Step Guided Demo</span>
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Reset all batches, alerts, and IoT readings back to initial seed data?')) {
                resetToDemoSeed();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-medium text-xs transition"
            title="Reset to clean initial state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-10 h-10 rounded-2xl honey-gradient-bg border border-amber-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.8L18 8.5v7l-6 3.7-6-3.7v-7l6-3.7z" />
                <circle cx="12" cy="12" r="3" className="text-amber-500 fill-amber-500" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-slate-900">Honey<span className="text-amber-600">Trace</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  Trust Ledger
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Farm-to-Bottle Cryptographic Traceability</p>
            </div>
          </button>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-xl transition ${currentPage === 'landing' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'}`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className={`px-3 py-1.5 rounded-xl transition ${currentPage === 'how-it-works' ? 'bg-amber-100/70 text-amber-950 font-bold' : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'}`}
            >
              How It Works
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate(getRoleDashboardPage(currentUser.role))}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${currentPage.startsWith(getRoleDashboardPage(currentUser.role)) ? 'bg-amber-500 text-white font-bold shadow-sm' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'}`}
              >
                <Layers className="w-4 h-4" />
                <span>{currentUser.role} Workspace</span>
              </button>
            )}
          </nav>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Batch Lookup */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Verify code (e.g. DEMO01)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-56 lg:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-amber-50/40 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase text-slate-800"
            />
            <Search className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
          </form>

          {/* Scan QR Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-semibold text-xs transition shadow-sm"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Role Switcher / User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(prev => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 shadow-sm transition text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                {currentUser ? currentUser.name.charAt(0) : 'C'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Consumer'}
                </p>
                <p className="text-[10px] text-amber-800 font-medium">
                  {currentUser ? currentUser.role : 'Public View'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-amber-200 p-2 z-50 animate-fadeIn"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 border-b border-amber-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">Switch Persona (Instant Demo Access)</p>
                  <p className="text-[11px] text-slate-500">Test different role perspectives with 1-click</p>
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {/* Public Consumer */}
                  <button
                    onClick={() => {
                      logout();
                      onNavigate('landing');
                    }}
                    className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between text-xs ${!currentUser ? 'bg-amber-100 font-bold text-amber-950' : 'hover:bg-amber-50 text-slate-700'}`}
                  >
                    <div>
                      <p className="font-semibold">Public Consumer</p>
                      <p className="text-[10px] text-slate-500">Scan & verify without account</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">PUBLIC</span>
                  </button>

                  {/* Seed Stakeholders */}
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        quickSwitchUser(u.id);
                        onNavigate(getRoleDashboardPage(u.role));
                      }}
                      className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between text-xs ${currentUser?.id === u.id ? 'bg-amber-100 font-bold text-amber-950' : 'hover:bg-amber-50 text-slate-700'}`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{u.organizationName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        u.role === 'PRODUCER' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'PROCESSOR' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'DISTRIBUTOR' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'RETAILER' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-900 text-white'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-amber-100 mt-2 flex justify-between gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="flex-1 text-center py-1.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100"
                  >
                    Login Page
                  </button>
                  <button
                    onClick={() => onNavigate('request-access')}
                    className="flex-1 text-center py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                  >
                    Request Access
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

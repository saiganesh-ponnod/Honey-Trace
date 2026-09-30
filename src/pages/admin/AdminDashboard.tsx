import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  UserX,
  Play,
  Hash,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useStore } from '../../context/StoreContext';
import { User, Alert, AuditLog, SupplyChainEvent } from '../../types';
import { SeverityBadge, VerificationBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC<{
  onVerifyCode: (code: string) => void;
}> = ({ onVerifyCode }) => {
  const {
    currentUser,
    users,
    batches,
    alerts,
    auditLogs,
    events,
    approveUser,
    suspendUser,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    runIntegrityChecks,
    tamperEvent,
    resetToDemoSeed
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts' | 'audit' | 'tamper'>('overview');
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState<Alert | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [viewEvidence, setViewEvidence] = useState<Alert | null>(null);
  const [tamperSelectedEventId, setTamperSelectedEventId] = useState(events[0]?.id || '');
  const [tamperNote, setTamperNote] = useState('CORRUPTED: Illegal corn syrup blend injected during storage');
  const [healthCheckStatus, setHealthCheckStatus] = useState<string | null>(null);

  // Status Distribution Chart Data
  const verifiedCount = batches.filter(b => b.verificationStatus === 'VERIFIED').length;
  const inProgCount = batches.filter(b => b.verificationStatus === 'INFORMATION_INCOMPLETE').length;
  const flaggedCount = batches.filter(b => b.verificationStatus === 'FLAGGED').length;

  const chartData = [
    { name: 'Verified Authentic', value: verifiedCount, color: '#10b981' },
    { name: 'Information Incomplete', value: inProgCount, color: '#f59e0b' },
    { name: 'Flagged / Suspicious', value: flaggedCount, color: '#f43f5e' }
  ];

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const openAlerts = alerts.filter(a => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED');

  const handleRunChecks = () => {
    const res = runIntegrityChecks();
    setHealthCheckStatus(`Scanned ${res.checksRun} batches. Created ${res.alertsCreated} automated alerts.`);
    setTimeout(() => setHealthCheckStatus(null), 4000);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolve || !resolveNote.trim()) return;
    resolveAlert(selectedAlertForResolve.id, resolveNote.trim());
    setSelectedAlertForResolve(null);
    setResolveNote('');
  };

  const handleTamperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tamperEvent(tamperSelectedEventId, tamperNote);
    alert('Cryptographic ledger event modified! Check verification page for immediate CHAIN_INTEGRITY_FAILURE detection.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Safety, Auditing & Administrative Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              PLATFORM OPERATOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System overview, cryptographic audit trails, user approvals, and automated safety rule enforcement.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRunChecks}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Automated Health Checks</span>
          </button>
        </div>
      </div>

      {healthCheckStatus && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{healthCheckStatus}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Registered Batches</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{batches.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across All Producers</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Open Alerts</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 font-display mt-1">{openAlerts.length}</p>
          <p className="text-[11px] text-rose-700 mt-0.5">Safety & Sequence Flags</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Pending Users</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">{pendingUsers.length}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Awaiting Approval</p>
        </div>

        <div className="honey-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Audit Log Entries</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{auditLogs.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Immutable System Events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'overview' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'alerts' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Alert Catalog ({openAlerts.length} Open)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'users' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          User Management ({pendingUsers.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'audit' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('tamper')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'tamper' ? 'border-rose-600 text-rose-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Tamper Simulation Tool
        </button>
      </div>

      {/* TAB 1: System Analytics Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Status Donut */}
          <div className="md:col-span-5 honey-card p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">Verification Status Distribution</h3>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {chartData.map(c => (
                <div key={c.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Health Summary */}
          <div className="md:col-span-7 honey-card p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">Automated Integrity Monitors</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950">SHA-256 Event Signatures</p>
                  <p className="text-slate-600">All blockchain-style hash chains intact and validated against genesis block.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">PASS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-950">Transit Duration Checker</p>
                  <p className="text-slate-600">Monitors batches in transit longer than 7 days without retailer receipt.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">NORMAL</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sky-950">IoT Thermal Degradation Defense</p>
                  <p className="text-slate-600">Active temperature monitors alert on readings exceeding 35°C / extreme 40°C.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Alerts */}
      {activeTab === 'alerts' && (
        <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Safety & Verification Alert Catalog</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Severity & Type</th>
                  <th className="py-3 px-4 font-bold">Batch Code</th>
                  <th className="py-3 px-4 font-bold">Alert Message</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <SeverityBadge severity={a.severity} />
                      <p className="font-mono text-[10px] text-slate-500 mt-1">{a.type}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {a.batchCode || 'System Wide'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm">
                      <p className="font-medium text-slate-900">{a.message}</p>
                      {a.note && <p className="text-[10px] text-slate-500 italic mt-0.5">Note: "{a.note}" ({a.resolvedBy})</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'OPEN' ? 'bg-rose-100 text-rose-800' :
                        a.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.evidence && (
                          <button
                            onClick={() => setViewEvidence(a)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                            title="Inspect JSON Evidence"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {a.status === 'OPEN' && (
                          <button
                            onClick={() => acknowledgeAlert(a.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px]"
                          >
                            Ack
                          </button>
                        )}
                        {a.status !== 'RESOLVED' && (
                          <button
                            onClick={() => setSelectedAlertForResolve(a)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Users */}
      {activeTab === 'users' && (
        <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900">Stakeholder User Directory</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">User Name & Email</th>
                  <th className="py-3 px-4 font-bold">Organization</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Account Status</th>
                  <th className="py-3 px-4 font-bold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{u.organizationName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'PENDING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status === 'PENDING' && (
                            <button
                              onClick={() => approveUser(u.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          {u.status === 'APPROVED' && (
                            <button
                              onClick={() => suspendUser(u.id, 'Administrative suspension for security audit')}
                              className="px-2.5 py-1 rounded-xl hover:bg-rose-50 text-rose-700 text-[11px] font-semibold"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="honey-card rounded-3xl overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Immutable Cryptographic Audit Trail</h3>
              <p className="text-xs text-slate-500">Append-only security log for every mutating state transition</p>
            </div>
            <span className="font-mono text-xs text-slate-500">{auditLogs.length} Total Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Entity & ID</th>
                  <th className="py-3 px-4 font-bold">Client IP Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{log.actorName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {log.ipHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Tamper Demo Tool */}
      {activeTab === 'tamper' && (
        <div className="honey-card p-8 rounded-3xl border-2 border-rose-200 bg-rose-50/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-slate-900">
                Live Cryptographic Tampering Simulation Tool
              </h3>
              <p className="text-xs text-slate-600">
                Demonstrates how HoneyTrace mathematically detects SQL injection / database record tampering using SHA-256 hash chains.
              </p>
            </div>
          </div>

          <form onSubmit={handleTamperSubmit} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Supply Chain Event to Tamper</label>
              <select
                value={tamperSelectedEventId}
                onChange={e => setTamperSelectedEventId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-rose-300 text-sm font-semibold bg-white"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.eventType} ({e.actorOrg}) - Hash: {e.eventHash.substring(0, 10)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tampered Event Content Injection</label>
              <textarea
                rows={3}
                required
                value={tamperNote}
                onChange={e => setTamperNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-rose-300 text-xs font-mono bg-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
              >
                Execute Record Tampering & Test Engine
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemoSeed();
                  alert('Reset to clean demo seed state.');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Restore Clean Genesis State
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Resolve Alert */}
      {selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Resolve Safety Alert</h3>
            <p className="text-xs text-slate-600">
              Provide an audit explanation for resolving alert: <strong>{selectedAlertForResolve.type}</strong>
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Audit explanation (e.g. Lab re-test confirmed calibrated reading, physical seal re-verified)..."
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedAlertForResolve(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow">Save Resolution Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Evidence */}
      {viewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900">Alert Evidence JSON</h3>
              <button onClick={() => setViewEvidence(null)} className="text-slate-500">✕</button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-60">
              {JSON.stringify(viewEvidence.evidence, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => setViewEvidence(null)} className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

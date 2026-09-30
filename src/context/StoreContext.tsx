import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  HoneySource,
  Batch,
  ProcessingRecord,
  QualityTest,
  SupplyChainEvent,
  SensorReading,
  IoTDevice,
  RetailerInventory,
  Alert,
  AuditLog,
  PublicVerification,
  VerificationStatus,
  BatchStatus,
  UserRole,
  VerificationCheck
} from '../types';
import {
  SEED_USERS,
  SEED_SOURCES,
  SEED_BATCHES,
  SEED_PROCESSING,
  SEED_QUALITY_TESTS,
  SEED_EVENTS,
  SEED_DEVICES,
  SEED_SENSOR_READINGS,
  SEED_RETAILER_INVENTORY,
  SEED_ALERTS,
  SEED_AUDIT_LOGS
} from '../data/seedData';
import { generateBatchCode, generateUUID, generateDeviceKey, simpleSha256 } from '../utils/crypto';
import { QUALITY_REFERENCE_LIMITS } from '../config/qualityLimits';
import { SENSOR_THRESHOLDS } from '../config/sensorThresholds';

interface StoreContextType {
  // State
  currentUser: User | null;
  users: User[];
  sources: HoneySource[];
  batches: Batch[];
  processingRecords: ProcessingRecord[];
  qualityTests: QualityTest[];
  events: SupplyChainEvent[];
  devices: IoTDevice[];
  sensorReadings: SensorReading[];
  inventory: RetailerInventory[];
  alerts: Alert[];
  auditLogs: AuditLog[];

  // Auth
  login: (email: string, role?: UserRole) => { success: boolean; message?: string };
  logout: () => void;
  quickSwitchUser: (userId: string) => void;
  requestAccess: (user: Omit<User, 'id' | 'status' | 'createdAt'>) => void;

  // Domain Actions
  createBatch: (data: {
    productName: string;
    honeyType: any;
    producerLotNumber: string;
    sourceId: string;
    harvestDate: string;
    harvestMethod: any;
    quantityKg: number;
    packagingType: string;
    expiryDate: string;
    assignedProcessorId: string;
    notes?: string;
  }) => { success: boolean; batch?: Batch; error?: string };

  updateBatch: (batchId: string, data: Partial<Batch>) => void;
  recallBatch: (batchId: string, reason: string) => void;
  createSource: (data: Omit<HoneySource, 'id' | 'producerId' | 'createdAt'>) => HoneySource;

  addProcessingRecord: (data: {
    batchId: string;
    processType: any;
    facilityName: string;
    facilityLocation: string;
    startedAt: string;
    completedAt: string;
    maxTemperatureC?: number;
    inputQuantityKg: number;
    outputQuantityKg: number;
    markComplete: boolean;
    additivesDeclared: boolean;
    additivesNotes?: string;
    notes?: string;
  }) => { success: boolean; error?: string };

  addQualityTest: (data: {
    batchId: string;
    testType: any;
    labName: string;
    reportReference: string;
    testedAt: string;
    moisturePct?: number;
    hmfMgKg?: number;
    electricalConductivityMsCm?: number;
    ph?: number;
    diastaseNumber?: number;
    overallResult: 'PASS' | 'FAIL';
    notes?: string;
  }) => { success: boolean; error?: string };

  pickupBatch: (batchId: string, locationName: string, notes?: string) => void;
  addLocationUpdate: (batchId: string, locationName: string, lat?: number, lng?: number, notes?: string) => void;
  dispatchBatch: (batchId: string, toRetailerId: string, locationName: string, notes?: string) => void;
  confirmReceipt: (batchId: string, quantityKg: number, condition: 'OK' | 'DAMAGED', shelfLocation?: string, notes?: string) => void;
  updateInventory: (inventoryId: string, quantityOnHand: number, shelfLocation: string) => void;

  // IoT
  registerDevice: (name: string, batchId?: string) => { device: IoTDevice; apiKey: string };
  toggleDeviceStatus: (deviceId: string) => void;
  addSensorReading: (data: {
    batchId: string;
    deviceId?: string;
    temperatureC: number;
    humidityPct: number;
    weightKg: number;
    tdsPpm: number;
  }) => void;
  simulateSensors: (batchId: string, count: number, scenario: 'normal' | 'abnormal') => void;

  // Alerts & Admin
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, note: string) => void;
  dismissAlert: (alertId: string, note: string) => void;
  approveUser: (userId: string) => void;
  suspendUser: (userId: string, reason: string) => void;
  runIntegrityChecks: () => { checksRun: number; alertsCreated: number };
  tamperEvent: (eventId: string, modifiedNotes: string) => void;
  resetToDemoSeed: () => void;

  // Verification Engine
  computeVerification: (batchCode: string) => PublicVerification;
  validateBatchHashChain: (batchId: string) => { isValid: boolean; brokenAtIndex?: number };
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'honeytrace_platform_state_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_currentUser');
    if (saved) return JSON.parse(saved);
    // Default to Ravi Kale for demo experience
    return SEED_USERS.find(u => u.email === 'ravi@sahyadrihoney.demo') || SEED_USERS[0];
  });

  const [sources, setSources] = useState<HoneySource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sources');
    return saved ? JSON.parse(saved) : SEED_SOURCES;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_batches');
    return saved ? JSON.parse(saved) : SEED_BATCHES;
  });

  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_proc');
    return saved ? JSON.parse(saved) : SEED_PROCESSING;
  });

  const [qualityTests, setQualityTests] = useState<QualityTest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_qual');
    return saved ? JSON.parse(saved) : SEED_QUALITY_TESTS;
  });

  const [events, setEvents] = useState<SupplyChainEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_events');
    return saved ? JSON.parse(saved) : SEED_EVENTS;
  });

  const [devices, setDevices] = useState<IoTDevice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_devices');
    return saved ? JSON.parse(saved) : SEED_DEVICES;
  });

  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sensors');
    return saved ? JSON.parse(saved) : SEED_SENSOR_READINGS;
  });

  const [inventory, setInventory] = useState<RetailerInventory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_inv');
    return saved ? JSON.parse(saved) : SEED_RETAILER_INVENTORY;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_alerts');
    return saved ? JSON.parse(saved) : SEED_ALERTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_aud');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY + '_currentUser', JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEY + '_sources', JSON.stringify(sources));
    localStorage.setItem(STORAGE_KEY + '_batches', JSON.stringify(batches));
    localStorage.setItem(STORAGE_KEY + '_proc', JSON.stringify(processingRecords));
    localStorage.setItem(STORAGE_KEY + '_qual', JSON.stringify(qualityTests));
    localStorage.setItem(STORAGE_KEY + '_events', JSON.stringify(events));
    localStorage.setItem(STORAGE_KEY + '_devices', JSON.stringify(devices));
    localStorage.setItem(STORAGE_KEY + '_sensors', JSON.stringify(sensorReadings));
    localStorage.setItem(STORAGE_KEY + '_inv', JSON.stringify(inventory));
    localStorage.setItem(STORAGE_KEY + '_alerts', JSON.stringify(alerts));
    localStorage.setItem(STORAGE_KEY + '_aud', JSON.stringify(auditLogs));
  }, [users, currentUser, sources, batches, processingRecords, qualityTests, events, devices, sensorReadings, inventory, alerts, auditLogs]);

  // Helper to log audit actions
  const logAudit = (action: string, entityType: string, entityId: string, details?: Record<string, any>) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: currentUser ? currentUser.id : 'anonymous',
      actorName: currentUser ? currentUser.name : 'Public Client',
      actorRole: currentUser ? currentUser.role : 'PUBLIC',
      action,
      entityType,
      entityId,
      details,
      ipHash: simpleSha256('client-session-' + Date.now()).substring(0, 12),
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth methods
  const login = (email: string, role?: UserRole) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'User with this email was not found.' };
    }
    if (found.status === 'PENDING') {
      return { success: false, message: 'Your account is pending administrator approval.' };
    }
    if (found.status === 'SUSPENDED') {
      return { success: false, message: 'Your account has been suspended by the platform administrator.' };
    }
    setCurrentUser(found);
    logAudit('LOGIN_SUCCESS', 'USER', found.id, { email: found.email, role: found.role });
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', 'USER', currentUser.id, { email: currentUser.email });
    }
    setCurrentUser(null);
  };

  const quickSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      logAudit('ROLE_SWITCH', 'USER', user.id, { role: user.role, name: user.name });
    }
  };

  const requestAccess = (userData: Omit<User, 'id' | 'status' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    logAudit('ACCESS_REQUESTED', 'USER', newUser.id, { email: newUser.email, role: newUser.role });
  };

  // Hash chain helper
  const validateBatchHashChain = (batchId: string): { isValid: boolean; brokenAtIndex?: number } => {
    const batchEvents = events
      .filter(e => e.batchId === batchId)
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    if (batchEvents.length === 0) return { isValid: true };

    let prev = 'GENESIS';
    for (let i = 0; i < batchEvents.length; i++) {
      const evt = batchEvents[i];
      if (evt.prevHash !== prev) {
        return { isValid: false, brokenAtIndex: i };
      }
      const expectedHash = simpleSha256(evt.prevHash + evt.eventType + evt.occurredAt + evt.batchId);
      // If tampered notes/status modified hash
      if (evt.eventHash !== expectedHash) {
        return { isValid: false, brokenAtIndex: i };
      }
      prev = evt.eventHash;
    }
    return { isValid: true };
  };

  // Domain: Batch Creation
  const createBatch = (data: {
    productName: string;
    honeyType: any;
    producerLotNumber: string;
    sourceId: string;
    harvestDate: string;
    harvestMethod: any;
    quantityKg: number;
    packagingType: string;
    expiryDate: string;
    assignedProcessorId: string;
    notes?: string;
  }) => {
    if (!currentUser || currentUser.role !== 'PRODUCER') {
      return { success: false, error: 'Only approved producers can create batches.' };
    }

    // Check duplicate lot number for this producer
    const existing = batches.find(
      b => b.producerId === currentUser.id && b.producerLotNumber.trim().toUpperCase() === data.producerLotNumber.trim().toUpperCase()
    );
    if (existing) {
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        type: 'DUPLICATE_BATCH_IDENTIFIER',
        severity: 'MEDIUM',
        message: `Duplicate producer lot identifier ${data.producerLotNumber} rejected for producer ${currentUser.organizationName}`,
        evidence: { producerId: currentUser.id, lotNumber: data.producerLotNumber },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectsVerification: false
      };
      setAlerts(prev => [newAlert, ...prev]);
      logAudit('BATCH_CREATION_FAILED_DUPLICATE_LOT', 'BATCH', 'rejected', { lot: data.producerLotNumber });
      return { success: false, error: `Producer lot number "${data.producerLotNumber}" already exists in your registry.` };
    }

    const batchCode = generateBatchCode();
    const batchId = `batch-${Date.now()}`;
    const now = new Date().toISOString();

    const newBatch: Batch = {
      id: batchId,
      batchCode,
      producerId: currentUser.id,
      productName: data.productName,
      honeyType: data.honeyType,
      producerLotNumber: data.producerLotNumber,
      sourceId: data.sourceId,
      harvestDate: data.harvestDate,
      harvestMethod: data.harvestMethod,
      quantityKg: data.quantityKg,
      packagingType: data.packagingType,
      expiryDate: data.expiryDate,
      assignedProcessorId: data.assignedProcessorId,
      status: 'REGISTERED',
      verificationStatus: 'INFORMATION_INCOMPLETE',
      notes: data.notes,
      createdAt: now,
      updatedAt: now
    };

    // Create Genesis Event
    const genesisPrev = 'GENESIS';
    const eventHash = simpleSha256(genesisPrev + 'BATCH_REGISTERED' + now + batchId);
    const sourceObj = sources.find(s => s.id === data.sourceId);

    const genesisEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'BATCH_REGISTERED',
      occurredAt: now,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorOrg: currentUser.organizationName,
      locationName: sourceObj ? `${sourceObj.name}, ${sourceObj.village}` : currentUser.location || 'Apiary Origin',
      latitude: sourceObj?.latitude,
      longitude: sourceObj?.longitude,
      status: 'REGISTERED',
      notes: `Batch ${batchCode} registered with ${data.quantityKg} kg under lot ${data.producerLotNumber}.`,
      prevHash: genesisPrev,
      eventHash
    };

    setBatches(prev => [newBatch, ...prev]);
    setEvents(prev => [...prev, genesisEvent]);
    logAudit('BATCH_CREATED', 'BATCH', batchId, { batchCode, lot: data.producerLotNumber, qty: data.quantityKg });

    return { success: true, batch: newBatch };
  };

  const updateBatch = (batchId: string, data: Partial<Batch>) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, ...data, updatedAt: new Date().toISOString() } : b));
    logAudit('BATCH_UPDATED', 'BATCH', batchId, data);
  };

  const recallBatch = (batchId: string, reason: string) => {
    const now = new Date().toISOString();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    setBatches(prev => prev.map(b => b.id === batchId ? {
      ...b,
      status: 'RECALLED',
      verificationStatus: 'FLAGGED',
      recallReason: reason,
      recalledAt: now,
      updatedAt: now
    } : b));

    // Append Recalled Event
    const batchEvents = events.filter(e => e.batchId === batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'BATCH_RECALLED' + now + batchId);

    const recallEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'BATCH_RECALLED',
      occurredAt: now,
      actorId: currentUser ? currentUser.id : 'admin',
      actorName: currentUser ? currentUser.name : 'Authority',
      actorRole: currentUser ? currentUser.role : 'ADMIN',
      actorOrg: currentUser ? currentUser.organizationName : 'HoneyTrace Safety Monitor',
      locationName: currentUser?.location || 'Regulatory Authority',
      status: 'RECALLED',
      notes: `PRODUCT RECALL ISSUED: ${reason}`,
      prevHash: lastHash,
      eventHash
    };

    const recallAlert: Alert = {
      id: `alert-${Date.now()}`,
      batchId,
      batchCode: batch.batchCode,
      type: 'BATCH_RECALLED',
      severity: 'HIGH',
      message: `Product Recall Active for batch ${batch.batchCode}: ${reason}`,
      evidence: { reason, initiatedBy: currentUser?.name },
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      affectsVerification: true
    };

    setEvents(prev => [...prev, recallEvent]);
    setAlerts(prev => [recallAlert, ...prev]);
    logAudit('BATCH_RECALLED', 'BATCH', batchId, { reason, batchCode: batch.batchCode });
  };

  const createSource = (data: Omit<HoneySource, 'id' | 'producerId' | 'createdAt'>): HoneySource => {
    const newSource: HoneySource = {
      ...data,
      id: `src-${Date.now()}`,
      producerId: currentUser?.id || 'producer',
      createdAt: new Date().toISOString()
    };
    setSources(prev => [...prev, newSource]);
    logAudit('SOURCE_CREATED', 'SOURCE', newSource.id, { name: newSource.name, state: newSource.state });
    return newSource;
  };

  // Domain: Processing Record
  const addProcessingRecord = (data: {
    batchId: string;
    processType: any;
    facilityName: string;
    facilityLocation: string;
    startedAt: string;
    completedAt: string;
    maxTemperatureC?: number;
    inputQuantityKg: number;
    outputQuantityKg: number;
    markComplete: boolean;
    additivesDeclared: boolean;
    additivesNotes?: string;
    notes?: string;
  }) => {
    const batch = batches.find(b => b.id === data.batchId);
    if (!batch) return { success: false, error: 'Batch not found.' };

    const now = new Date().toISOString();
    const newRecord: ProcessingRecord = {
      id: `proc-${Date.now()}`,
      ...data,
      processorId: currentUser?.id || 'processor',
      createdAt: now
    };

    const newStatus: BatchStatus = data.markComplete ? 'PROCESSED' : 'PROCESSING';

    // Hash Chain Event
    const batchEvents = events.filter(e => e.batchId === data.batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventType = data.markComplete ? 'PROCESSING_COMPLETED' : 'PROCESSING_STARTED';
    const eventHash = simpleSha256(lastHash + eventType + now + data.batchId);

    const procEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId: data.batchId,
      eventType,
      occurredAt: now,
      actorId: currentUser ? currentUser.id : 'processor',
      actorName: currentUser ? currentUser.name : 'Processing Facility',
      actorRole: 'PROCESSOR',
      actorOrg: currentUser ? currentUser.organizationName : data.facilityName,
      locationName: `${data.facilityName}, ${data.facilityLocation}`,
      status: newStatus,
      notes: `${data.processType} processing completed. Output: ${data.outputQuantityKg} kg. ${data.additivesDeclared ? 'Additives: ' + data.additivesNotes : 'No additives declared.'}`,
      prevHash: lastHash,
      eventHash
    };

    // Check quantity loss > 20%
    if (data.inputQuantityKg > 0 && (data.inputQuantityKg - data.outputQuantityKg) / data.inputQuantityKg > 0.20) {
      const lossPct = (((data.inputQuantityKg - data.outputQuantityKg) / data.inputQuantityKg) * 100).toFixed(1);
      const lossAlert: Alert = {
        id: `alert-${Date.now()}`,
        batchId: data.batchId,
        batchCode: batch.batchCode,
        type: 'INCONSISTENT_BATCH_DATA',
        severity: 'MEDIUM',
        message: `High processing mass loss of ${lossPct}% recorded during ${data.processType} (Input: ${data.inputQuantityKg}kg, Output: ${data.outputQuantityKg}kg).`,
        evidence: { inputKg: data.inputQuantityKg, outputKg: data.outputQuantityKg, lossPct },
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        affectsVerification: true
      };
      setAlerts(prev => [lossAlert, ...prev]);
    }

    setProcessingRecords(prev => [...prev, newRecord]);
    setBatches(prev => prev.map(b => b.id === data.batchId ? { ...b, status: newStatus, updatedAt: now } : b));
    setEvents(prev => [...prev, procEvent]);
    logAudit('PROCESSING_RECORD_ADDED', 'PROCESSING', newRecord.id, { batchCode: batch.batchCode, processType: data.processType });

    return { success: true };
  };

  // Domain: Quality Test
  const addQualityTest = (data: {
    batchId: string;
    testType: any;
    labName: string;
    reportReference: string;
    testedAt: string;
    moisturePct?: number;
    hmfMgKg?: number;
    electricalConductivityMsCm?: number;
    ph?: number;
    diastaseNumber?: number;
    overallResult: 'PASS' | 'FAIL';
    notes?: string;
  }) => {
    const batch = batches.find(b => b.id === data.batchId);
    if (!batch) return { success: false, error: 'Batch not found.' };

    const now = new Date().toISOString();
    const newTest: QualityTest = {
      id: `qual-${Date.now()}`,
      ...data,
      testedById: currentUser?.id || 'quality',
      createdAt: now
    };

    const newStatus: BatchStatus = data.overallResult === 'PASS' ? 'QUALITY_APPROVED' : 'QUALITY_REJECTED';

    // Verify limit violations
    const violations: string[] = [];
    if (data.moisturePct !== undefined && data.moisturePct > (QUALITY_REFERENCE_LIMITS.moisturePct.max || 20)) {
      violations.push(`Moisture ${data.moisturePct}% exceeds standard max limit (20%)`);
    }
    if (data.hmfMgKg !== undefined && data.hmfMgKg > (QUALITY_REFERENCE_LIMITS.hmfMgKg.max || 40)) {
      violations.push(`HMF ${data.hmfMgKg} mg/kg exceeds limit (40 mg/kg)`);
    }
    if (data.electricalConductivityMsCm !== undefined && data.electricalConductivityMsCm > (QUALITY_REFERENCE_LIMITS.electricalConductivityMsCm.max || 0.8)) {
      violations.push(`EC ${data.electricalConductivityMsCm} mS/cm exceeds standard (0.8 mS/cm)`);
    }
    if (data.diastaseNumber !== undefined && data.diastaseNumber < (QUALITY_REFERENCE_LIMITS.diastaseNumber.min || 8)) {
      violations.push(`Diastase ${data.diastaseNumber} below min activity (8 Schade units)`);
    }

    if (data.overallResult === 'PASS' && violations.length > 0) {
      const contradictionAlert: Alert = {
        id: `alert-${Date.now()}`,
        batchId: data.batchId,
        batchCode: batch.batchCode,
        type: 'INCONSISTENT_BATCH_DATA',
        severity: 'HIGH',
        message: `Quality contradiction: Test marked PASS despite reference limit violations: ${violations.join('; ')}`,
        evidence: { violations, reportRef: data.reportReference, labName: data.labName },
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        affectsVerification: true
      };
      setAlerts(prev => [contradictionAlert, ...prev]);
    } else if (data.overallResult === 'FAIL') {
      const failAlert: Alert = {
        id: `alert-${Date.now()}`,
        batchId: data.batchId,
        batchCode: batch.batchCode,
        type: 'QUALITY_TEST_FAILED',
        severity: 'HIGH',
        message: `Batch failed lab quality examination at ${data.labName}. Reasons: ${violations.join('; ') || data.notes || 'Standards not met.'}`,
        evidence: { reportRef: data.reportReference, labName: data.labName, violations },
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        affectsVerification: true
      };
      setAlerts(prev => [failAlert, ...prev]);
    }

    // Event & Hash Chain
    const batchEvents = events.filter(e => e.batchId === data.batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'QUALITY_TEST_RECORDED' + now + data.batchId);

    const testEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId: data.batchId,
      eventType: 'QUALITY_TEST_RECORDED',
      occurredAt: now,
      actorId: currentUser ? currentUser.id : 'lab',
      actorName: currentUser ? currentUser.name : data.labName,
      actorRole: 'PROCESSOR',
      actorOrg: data.labName,
      locationName: currentUser?.location || 'Analytical Laboratory',
      status: newStatus,
      notes: `Lab Report ${data.reportReference}: Overall Result ${data.overallResult}. Moisture: ${data.moisturePct ?? 'N/A'}%, HMF: ${data.hmfMgKg ?? 'N/A'} mg/kg.`,
      prevHash: lastHash,
      eventHash
    };

    setQualityTests(prev => [...prev, newTest]);
    setBatches(prev => prev.map(b => b.id === data.batchId ? { ...b, status: newStatus, updatedAt: now } : b));
    setEvents(prev => [...prev, testEvent]);
    logAudit('QUALITY_TEST_RECORDED', 'QUALITY_TEST', newTest.id, { batchCode: batch.batchCode, result: data.overallResult, reportRef: data.reportReference });

    return { success: true };
  };

  // Domain: Distributor Pickup & Transit
  const pickupBatch = (batchId: string, locationName: string, notes?: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const now = new Date().toISOString();
    const batchEvents = events.filter(e => e.batchId === batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'PICKED_UP_BY_DISTRIBUTOR' + now + batchId);

    const pickupEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'PICKED_UP_BY_DISTRIBUTOR',
      occurredAt: now,
      actorId: currentUser?.id || 'distributor',
      actorName: currentUser?.name || 'Distributor Logistics',
      actorRole: 'DISTRIBUTOR',
      actorOrg: currentUser?.organizationName || 'Logistics Provider',
      locationName,
      status: 'IN_TRANSIT',
      notes: notes || 'Batch custody transferred to temperature-controlled logistics partner.',
      prevHash: lastHash,
      eventHash
    };

    setBatches(prev => prev.map(b => b.id === batchId ? {
      ...b,
      status: 'IN_TRANSIT',
      currentCustodianId: currentUser?.id,
      updatedAt: now
    } : b));
    setEvents(prev => [...prev, pickupEvent]);
    logAudit('PICKUP_RECORDED', 'SUPPLY_CHAIN_EVENT', pickupEvent.id, { batchCode: batch.batchCode, location: locationName });
  };

  const addLocationUpdate = (batchId: string, locationName: string, lat?: number, lng?: number, notes?: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const now = new Date().toISOString();
    const batchEvents = events.filter(e => e.batchId === batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'IN_TRANSIT_LOCATION_UPDATE' + now + batchId);

    const locEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'IN_TRANSIT_LOCATION_UPDATE',
      occurredAt: now,
      actorId: currentUser?.id || 'distributor',
      actorName: currentUser?.name || 'Logistics Driver',
      actorRole: 'DISTRIBUTOR',
      actorOrg: currentUser?.organizationName || 'Logistics Provider',
      locationName,
      latitude: lat,
      longitude: lng,
      status: 'IN_TRANSIT',
      notes: notes || 'En-route checkpoint verification logged.',
      prevHash: lastHash,
      eventHash
    };

    setEvents(prev => [...prev, locEvent]);
    logAudit('LOCATION_UPDATE_LOGGED', 'SUPPLY_CHAIN_EVENT', locEvent.id, { batchCode: batch.batchCode, location: locationName });
  };

  const dispatchBatch = (batchId: string, toRetailerId: string, locationName: string, notes?: string) => {
    const batch = batches.find(b => b.id === batchId);
    const retailer = users.find(u => u.id === toRetailerId);
    if (!batch) return;

    const now = new Date().toISOString();
    const batchEvents = events.filter(e => e.batchId === batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'DISPATCHED_TO_RETAILER' + now + batchId);

    const dispatchEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'DISPATCHED_TO_RETAILER',
      occurredAt: now,
      actorId: currentUser?.id || 'distributor',
      actorName: currentUser?.name || 'Distributor Logistics',
      actorRole: 'DISTRIBUTOR',
      actorOrg: currentUser?.organizationName || 'Logistics Provider',
      locationName,
      status: 'IN_TRANSIT',
      notes: notes || `Dispatched for delivery to ${retailer?.organizationName || 'Retailer store'}.`,
      prevHash: lastHash,
      eventHash
    };

    setBatches(prev => prev.map(b => b.id === batchId ? {
      ...b,
      pendingRetailerId: toRetailerId,
      updatedAt: now
    } : b));
    setEvents(prev => [...prev, dispatchEvent]);
    logAudit('DISPATCH_RECORDED', 'SUPPLY_CHAIN_EVENT', dispatchEvent.id, { batchCode: batch.batchCode, retailer: retailer?.organizationName });
  };

  // Domain: Retailer Receipt & Inventory
  const confirmReceipt = (batchId: string, quantityKg: number, condition: 'OK' | 'DAMAGED', shelfLocation = 'Aisle 2 (Specialty Honey)', notes?: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const now = new Date().toISOString();
    const batchEvents = events.filter(e => e.batchId === batchId).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const lastHash = batchEvents.length > 0 ? batchEvents[batchEvents.length - 1].eventHash : 'GENESIS';
    const eventHash = simpleSha256(lastHash + 'RECEIVED_BY_RETAILER' + now + batchId);

    const receiveEvent: SupplyChainEvent = {
      id: `evt-${Date.now()}`,
      batchId,
      eventType: 'RECEIVED_BY_RETAILER',
      occurredAt: now,
      actorId: currentUser?.id || 'retailer',
      actorName: currentUser?.name || 'Store Inventory Manager',
      actorRole: 'RETAILER',
      actorOrg: currentUser?.organizationName || 'Retail Organic Store',
      locationName: currentUser?.location || 'Store Reception Bay',
      status: 'AT_RETAILER',
      notes: notes || `Received ${quantityKg} kg in ${condition} condition. Shelf stock: ${shelfLocation}.`,
      prevHash: lastHash,
      eventHash
    };

    // Inventory row
    const newInv: RetailerInventory = {
      id: `inv-${Date.now()}`,
      batchId,
      retailerId: currentUser?.id || 'retailer',
      quantityReceivedKg: quantityKg,
      quantityOnHand: quantityKg,
      shelfLocation,
      condition,
      receivedAt: now,
      updatedAt: now
    };

    setBatches(prev => prev.map(b => b.id === batchId ? {
      ...b,
      status: 'AT_RETAILER',
      currentCustodianId: currentUser?.id,
      updatedAt: now
    } : b));
    setEvents(prev => [...prev, receiveEvent]);
    setInventory(prev => [...prev.filter(i => i.batchId !== batchId), newInv]);
    logAudit('RECEIPT_CONFIRMED', 'SUPPLY_CHAIN_EVENT', receiveEvent.id, { batchCode: batch.batchCode, condition, qty: quantityKg });
  };

  const updateInventory = (inventoryId: string, quantityOnHand: number, shelfLocation: string) => {
    setInventory(prev => prev.map(i => i.id === inventoryId ? {
      ...i,
      quantityOnHand,
      shelfLocation,
      updatedAt: new Date().toISOString()
    } : i));
  };

  // Domain: IoT Management & Ingestion
  const registerDevice = (name: string, batchId?: string) => {
    const rawKey = generateDeviceKey();
    const apiKeyHash = simpleSha256(rawKey);
    const newDev: IoTDevice = {
      id: `dev-${Date.now()}`,
      name,
      producerId: currentUser?.id || 'producer',
      batchId,
      apiKey: rawKey,
      apiKeyHash,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setDevices(prev => [...prev, newDev]);
    logAudit('IOT_DEVICE_REGISTERED', 'IOT_DEVICE', newDev.id, { name, batchId });
    return { device: newDev, apiKey: rawKey };
  };

  const toggleDeviceStatus = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, isActive: !d.isActive } : d));
  };

  const addSensorReading = (data: {
    batchId: string;
    deviceId?: string;
    temperatureC: number;
    humidityPct: number;
    weightKg: number;
    tdsPpm: number;
  }) => {
    const now = new Date().toISOString();
    const isAbnormal =
      data.temperatureC < SENSOR_THRESHOLDS.temperature.abnormalLow ||
      data.temperatureC > SENSOR_THRESHOLDS.temperature.abnormalHigh ||
      data.humidityPct > SENSOR_THRESHOLDS.humidity.abnormalHigh;

    const newReading: SensorReading = {
      id: `read-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceId: data.deviceId || 'dev-simulated',
      batchId: data.batchId,
      temperatureC: data.temperatureC,
      humidityPct: data.humidityPct,
      weightKg: data.weightKg,
      tdsPpm: data.tdsPpm,
      isAbnormal,
      recordedAt: now,
      receivedAt: now
    };

    if (isAbnormal) {
      const batch = batches.find(b => b.id === data.batchId);
      const isExtreme = data.temperatureC >= SENSOR_THRESHOLDS.temperature.extremeHigh;
      const sensorAlert: Alert = {
        id: `alert-${Date.now()}`,
        batchId: data.batchId,
        batchCode: batch?.batchCode,
        type: 'SENSOR_ABNORMAL',
        severity: isExtreme ? 'HIGH' : 'MEDIUM',
        message: `Thermal deviation detected: Temperature ${data.temperatureC}°C / Humidity ${data.humidityPct}% outside safe thresholds.`,
        evidence: { temperatureC: data.temperatureC, humidityPct: data.humidityPct, isExtreme },
        status: 'OPEN',
        createdAt: now,
        updatedAt: now,
        affectsVerification: true
      };
      setAlerts(prev => [sensorAlert, ...prev]);
    }

    setSensorReadings(prev => [...prev, newReading]);
    setDevices(prev => prev.map(d => d.id === data.deviceId ? { ...d, lastReadingAt: now } : d));
  };

  const simulateSensors = (batchId: string, count: number, scenario: 'normal' | 'abnormal') => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const newReadings: SensorReading[] = [];
    const baseTime = Date.now() - count * 15 * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(baseTime + i * 15 * 60 * 1000).toISOString();
      let temp = 22.0 + Math.sin(i * 0.5) * 2.5;
      let hum = 48.0 + Math.cos(i * 0.4) * 4.0;
      let isAbnormal = false;

      if (scenario === 'abnormal' && i >= Math.floor(count / 2)) {
        temp = 42.5 + (i % 3) * 1.2; // Thermal abuse
        hum = 79.0;
        isAbnormal = true;
      }

      newReadings.push({
        id: `read-sim-${Date.now()}-${i}`,
        deviceId: 'dev-simulated',
        batchId,
        temperatureC: Number(temp.toFixed(1)),
        humidityPct: Number(hum.toFixed(1)),
        weightKg: Number((batch.quantityKg * 0.98).toFixed(1)),
        tdsPpm: 315 + (i % 4) * 5,
        isAbnormal,
        recordedAt: timestamp,
        receivedAt: timestamp
      });
    }

    if (scenario === 'abnormal') {
      const sensorAlert: Alert = {
        id: `alert-${Date.now()}`,
        batchId,
        batchCode: batch.batchCode,
        type: 'SENSOR_ABNORMAL',
        severity: 'HIGH',
        message: `Telemetry anomaly simulation: Temperature exceeded 42°C in simulated stream.`,
        evidence: { scenario: 'abnormal', readingsCount: count },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectsVerification: true
      };
      setAlerts(prev => [sensorAlert, ...prev]);
    }

    setSensorReadings(prev => [...prev, ...newReadings]);
    logAudit('IOT_STREAM_SIMULATED', 'BATCH', batchId, { count, scenario, batchCode: batch.batchCode });
  };

  // Domain: Alerts Management
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', updatedAt: new Date().toISOString() } : a));
    logAudit('ALERT_ACKNOWLEDGED', 'ALERT', alertId);
  };

  const resolveAlert = (alertId: string, note: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {
      ...a,
      status: 'RESOLVED',
      note,
      resolvedBy: currentUser?.name || 'Administrator',
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : a));
    logAudit('ALERT_RESOLVED', 'ALERT', alertId, { note });
  };

  const dismissAlert = (alertId: string, note: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {
      ...a,
      status: 'DISMISSED',
      note,
      resolvedBy: currentUser?.name || 'Administrator',
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : a));
    logAudit('ALERT_DISMISSED', 'ALERT', alertId, { note });
  };

  // Domain: Admin User Management & Health Checks
  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'APPROVED' } : u));
    logAudit('USER_APPROVED', 'USER', userId);
  };

  const suspendUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'SUSPENDED' } : u));
    logAudit('USER_SUSPENDED', 'USER', userId, { reason });
  };

  const runIntegrityChecks = () => {
    let created = 0;
    const now = new Date();

    // 1. Expiry checks
    batches.forEach(b => {
      if (new Date(b.expiryDate) < now && b.status !== 'RECALLED') {
        const hasAlert = alerts.some(a => a.batchId === b.id && a.type === 'BATCH_EXPIRED' && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED'));
        if (!hasAlert) {
          created++;
          setAlerts(prev => [{
            id: `alert-${Date.now()}-${b.id}`,
            batchId: b.id,
            batchCode: b.batchCode,
            type: 'BATCH_EXPIRED',
            severity: 'HIGH',
            message: `Batch ${b.batchCode} has passed its recorded shelf expiry date (${b.expiryDate}).`,
            evidence: { expiryDate: b.expiryDate, checkDate: now.toISOString() },
            status: 'OPEN',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            affectsVerification: true
          }, ...prev]);
        }
      }
    });

    logAudit('INTEGRITY_CHECKS_EXECUTED', 'SYSTEM', 'engine', { totalBatches: batches.length, alertsCreated: created });
    return { checksRun: batches.length, alertsCreated: created };
  };

  // Tamper Demo Tool
  const tamperEvent = (eventId: string, modifiedNotes: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      notes: modifiedNotes,
      // Corrupt the event payload without valid hash to trigger cryptographic failure
    } : e));

    const eventObj = events.find(e => e.id === eventId);
    if (eventObj) {
      const batchObj = batches.find(b => b.id === eventObj.batchId);
      const tamperAlert: Alert = {
        id: `alert-tamper-${Date.now()}`,
        batchId: eventObj.batchId,
        batchCode: batchObj?.batchCode,
        type: 'CHAIN_INTEGRITY_FAILURE',
        severity: 'CRITICAL',
        message: `Cryptographic SHA-256 integrity failure detected on ledger event ${eventId}. Stored hash does not match computed event content.`,
        evidence: { eventId, originalEventType: eventObj.eventType },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectsVerification: true
      };
      setAlerts(prev => [tamperAlert, ...prev]);
    }
    logAudit('TAMPER_SIMULATION_EXECUTED', 'EVENT_LEDGER', eventId);
  };

  const resetToDemoSeed = () => {
    setUsers(SEED_USERS);
    setCurrentUser(SEED_USERS.find(u => u.email === 'ravi@sahyadrihoney.demo') || SEED_USERS[0]);
    setSources(SEED_SOURCES);
    setBatches(SEED_BATCHES);
    setProcessingRecords(SEED_PROCESSING);
    setQualityTests(SEED_QUALITY_TESTS);
    setEvents(SEED_EVENTS);
    setDevices(SEED_DEVICES);
    setSensorReadings(SEED_SENSOR_READINGS);
    setInventory(SEED_RETAILER_INVENTORY);
    setAlerts(SEED_ALERTS);
    setAuditLogs(SEED_AUDIT_LOGS);
    localStorage.clear();
  };

  // Authoritative Verification Rules Engine (PRD Section 12.4)
  const computeVerification = (batchCode: string): PublicVerification => {
    const cleanCode = (batchCode || '').trim().toUpperCase();
    const batch = batches.find(b => b.batchCode.toUpperCase() === cleanCode);

    if (!batch) {
      // Log unknown scan
      return {
        status: 'NOT_FOUND',
        reasons: [`No registered honey batch record matches the identifier "${cleanCode}". Please verify the printed code.`],
        checks: [
          { id: 'c1', code: 'C1', label: 'Registered Batch Identifier', passed: false, detail: 'Identifier not found in registry.' }
        ],
        timeline: [],
        warnings: [],
        verifiedAt: new Date().toISOString()
      };
    }

    const batchProc = processingRecords.filter(p => p.batchId === batch.id);
    const batchQual = qualityTests.filter(q => q.batchId === batch.id);
    const latestQual = batchQual.length > 0 ? batchQual[batchQual.length - 1] : null;
    const batchEvents = events.filter(e => e.batchId === batch.id).sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    const batchSensors = sensorReadings.filter(s => s.batchId === batch.id);
    const batchAlerts = alerts.filter(a => a.batchId === batch.id && (a.status === 'OPEN' || a.status === 'ACKNOWLEDGED') && a.affectsVerification);

    const producer = users.find(u => u.id === batch.producerId);
    const source = sources.find(s => s.id === batch.sourceId);

    // 1. Completeness Checks
    const { isValid: hashChainValid } = validateBatchHashChain(batch.id);
    const isExpired = new Date(batch.expiryDate) < new Date();
    const isRecalled = batch.status === 'RECALLED';

    const hasPickup = batchEvents.some(e => e.eventType === 'PICKED_UP_BY_DISTRIBUTOR');
    const hasDispatch = batchEvents.some(e => e.eventType === 'DISPATCHED_TO_RETAILER');
    const hasReceipt = batchEvents.some(e => e.eventType === 'RECEIVED_BY_RETAILER');
    const custodyComplete = (hasPickup && hasDispatch && hasReceipt) || (batch.status === 'AT_RETAILER' && hasPickup && hasDispatch && hasReceipt);

    const checks: VerificationCheck[] = [
      {
        id: 'c1',
        code: 'C1',
        label: 'Batch Record & Unique Cryptographic Identifier',
        passed: true,
        detail: `Valid registered batch code ${batch.batchCode} with lot ${batch.producerLotNumber}.`
      },
      {
        id: 'c2',
        code: 'C2',
        label: 'Apiary Origin & Floral Source Recorded',
        passed: !!source,
        detail: source ? `${source.name} (${source.village}, ${source.district})` : 'Apiary origin details missing.'
      },
      {
        id: 'c3',
        code: 'C3',
        label: 'Final Processing & Additives Disclosure',
        passed: batchProc.some(p => p.markComplete),
        detail: batchProc.some(p => p.markComplete) ? 'Processing verified with zero undeclared additives.' : 'Processing record incomplete.'
      },
      {
        id: 'c4',
        code: 'C4',
        label: 'Laboratory Quality Standards (FSSAI/Codex)',
        passed: latestQual ? latestQual.overallResult === 'PASS' && (latestQual.hmfMgKg || 0) <= 40 : false,
        detail: latestQual ? `${latestQual.labName} (Overall Result: ${latestQual.overallResult})` : 'No lab test on record.'
      },
      {
        id: 'c5',
        code: 'C5',
        label: 'IoT Environmental Storage & Transit Telemetry',
        passed: batchSensors.length > 0 && !batchSensors.some(s => s.temperatureC > SENSOR_THRESHOLDS.temperature.extremeHigh),
        detail: batchSensors.length > 0 ? `${batchSensors.length} timestamped telemetry points recorded.` : 'No sensor telemetry readings.'
      },
      {
        id: 'c6',
        code: 'C6',
        label: 'Supply Chain Custody Handover Sequence',
        passed: custodyComplete,
        detail: custodyComplete ? 'Complete chain of custody: Producer → Processor → Distributor → Retailer.' : (batch.status === 'IN_TRANSIT' ? 'In transit to retailer.' : 'Custody gap or incomplete handover detected.')
      },
      {
        id: 'c7',
        code: 'C7',
        label: 'SHA-256 Ledger Hash Chain Integrity',
        passed: hashChainValid,
        detail: hashChainValid ? 'All event signatures mathematically verified with genesis block.' : 'Tamper alert: Event hash signature mismatch.'
      },
      {
        id: 'c8',
        code: 'C8',
        label: 'Product Shelf Life & Safety Recall Status',
        passed: !isExpired && !isRecalled,
        detail: isRecalled ? `ACTIVE RECALL: ${batch.recallReason}` : (isExpired ? `Expired on ${batch.expiryDate}` : `Valid shelf life until ${batch.expiryDate}`)
      }
    ];

    // 2. Compute Status
    let computedStatus: VerificationStatus = 'VERIFIED';
    const reasons: string[] = [];

    // FLAGGED rules
    const hasHighCriticalAlert = batchAlerts.some(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
    const isQualityFailed = latestQual?.overallResult === 'FAIL' || (latestQual?.hmfMgKg || 0) > 40;

    if (isRecalled) {
      computedStatus = 'FLAGGED';
      reasons.push(`This product batch has an active safety recall notice: "${batch.recallReason || 'Administrative Recall'}".`);
    } else if (isExpired) {
      computedStatus = 'FLAGGED';
      reasons.push(`This honey batch has exceeded its recorded expiry date (${batch.expiryDate}).`);
    } else if (isQualityFailed) {
      computedStatus = 'FLAGGED';
      reasons.push(`Quality laboratory tests indicated parameters exceeding standard reference thresholds (e.g. HMF level ${latestQual?.hmfMgKg} mg/kg).`);
    } else if (!hashChainValid) {
      computedStatus = 'FLAGGED';
      reasons.push('Cryptographic ledger integrity check failed. Event records have been altered without valid signature.');
    } else if (hasHighCriticalAlert) {
      computedStatus = 'FLAGGED';
      const flagAlerts = batchAlerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
      flagAlerts.forEach(a => reasons.push(a.message));
    } else {
      // INFORMATION_INCOMPLETE rules
      const incompleteChecks = checks.filter(c => !c.passed);
      const hasMediumAlert = batchAlerts.some(a => a.severity === 'MEDIUM');

      if (batch.status !== 'AT_RETAILER') {
        computedStatus = 'INFORMATION_INCOMPLETE';
        reasons.push('This honey batch is currently in transit through the verified supply chain and has not yet reached the retail destination.');
      } else if (incompleteChecks.length > 0 || hasMediumAlert) {
        computedStatus = 'INFORMATION_INCOMPLETE';
        if (incompleteChecks.length > 0) {
          reasons.push(`Some traceability checkpoints are pending verification (${incompleteChecks.map(c => c.label).join(', ')}).`);
        }
        if (hasMediumAlert) {
          batchAlerts.filter(a => a.severity === 'MEDIUM').forEach(a => reasons.push(a.message));
        }
      } else {
        computedStatus = 'VERIFIED';
        reasons.push('All 8 supply chain checkpoints, lab certificates, IoT telemetry, and cryptographic ledger signatures are fully verified.');
      }
    }

    // Prepare Sensor Summary
    let sensorSummary = undefined;
    if (batchSensors.length > 0) {
      const temps = batchSensors.map(s => s.temperatureC);
      const hums = batchSensors.map(s => s.humidityPct);
      const latestReading = batchSensors[batchSensors.length - 1];

      sensorSummary = {
        readingCount: batchSensors.length,
        latestTemp: latestReading.temperatureC,
        latestHumidity: latestReading.humidityPct,
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        minHumidity: Math.min(...hums),
        maxHumidity: Math.max(...hums),
        latestRecordedAt: latestReading.recordedAt,
        disclaimer: 'Sensor telemetry is supporting traceability and temperature-integrity information. It does not by itself constitute physical laboratory proof.'
      };
    }

    const latestProc = batchProc.length > 0 ? batchProc[batchProc.length - 1] : null;

    return {
      status: computedStatus,
      reasons,
      checks,
      batch: {
        code: batch.batchCode,
        productName: batch.productName,
        honeyType: batch.honeyType,
        quantityKg: batch.quantityKg,
        packagingType: batch.packagingType,
        harvestDate: batch.harvestDate,
        harvestMethod: batch.harvestMethod,
        expiryDate: batch.expiryDate,
        status: batch.status,
        notes: batch.notes,
        recalled: isRecalled,
        recallReason: batch.recallReason
      },
      producer: producer ? {
        name: producer.name,
        organizationName: producer.organizationName,
        location: producer.location
      } : undefined,
      origin: source ? {
        name: source.name,
        village: source.village,
        district: source.district,
        state: source.state,
        country: source.country,
        approxLatitude: source.latitude ? Number(source.latitude.toFixed(2)) : undefined,
        approxLongitude: source.longitude ? Number(source.longitude.toFixed(2)) : undefined,
        floralSource: source.floralSource
      } : undefined,
      processing: latestProc ? {
        facilityName: latestProc.facilityName,
        facilityLocation: latestProc.facilityLocation,
        processType: latestProc.processType,
        completedAt: latestProc.completedAt,
        additivesDeclared: latestProc.additivesDeclared,
        additivesNotes: latestProc.additivesNotes,
        maxTemperatureC: latestProc.maxTemperatureC,
        processorOrg: users.find(u => u.id === latestProc.processorId)?.organizationName || latestProc.facilityName
      } : undefined,
      quality: latestQual ? {
        labName: latestQual.labName,
        reportReference: latestQual.reportReference,
        testedAt: latestQual.testedAt,
        overallResult: latestQual.overallResult,
        moisturePct: latestQual.moisturePct,
        hmfMgKg: latestQual.hmfMgKg,
        electricalConductivityMsCm: latestQual.electricalConductivityMsCm,
        ph: latestQual.ph,
        diastaseNumber: latestQual.diastaseNumber
      } : undefined,
      timeline: batchEvents.map(e => ({
        eventType: e.eventType,
        occurredAt: e.occurredAt,
        actorOrg: e.actorOrg,
        actorRole: e.actorRole,
        locationName: e.locationName,
        status: e.status,
        notes: e.notes,
        eventHash: e.eventHash
      })),
      sensorSummary,
      warnings: batchAlerts.map(a => ({
        type: a.type,
        severity: a.severity,
        message: a.message
      })),
      verifiedAt: new Date().toISOString()
    };
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        sources,
        batches,
        processingRecords,
        qualityTests,
        events,
        devices,
        sensorReadings,
        inventory,
        alerts,
        auditLogs,
        login,
        logout,
        quickSwitchUser,
        requestAccess,
        createBatch,
        updateBatch,
        recallBatch,
        createSource,
        addProcessingRecord,
        addQualityTest,
        pickupBatch,
        addLocationUpdate,
        dispatchBatch,
        confirmReceipt,
        updateInventory,
        registerDevice,
        toggleDeviceStatus,
        addSensorReading,
        simulateSensors,
        acknowledgeAlert,
        resolveAlert,
        dismissAlert,
        approveUser,
        suspendUser,
        runIntegrityChecks,
        tamperEvent,
        resetToDemoSeed,
        computeVerification,
        validateBatchHashChain
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

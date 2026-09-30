export type UserRole = 'PRODUCER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'ADMIN';

export type UserStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationName: string;
  phone?: string;
  location?: string;
  createdAt: string;
}

export interface HoneySource {
  id: string;
  producerId: string;
  name: string;
  village: string;
  district: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  floralSource?: string;
  createdAt: string;
}

export type HoneyType =
  | 'WILDFLOWER'
  | 'MULTIFLORA'
  | 'ACACIA'
  | 'EUCALYPTUS'
  | 'JAMUN'
  | 'FOREST'
  | 'MUSTARD'
  | 'KASHMIR_WHITE'
  | 'OTHER';

export type HarvestMethod = 'MANUAL_EXTRACTION' | 'CENTRIFUGE' | 'PRESSING' | 'OTHER';

export type BatchStatus =
  | 'REGISTERED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'QUALITY_APPROVED'
  | 'QUALITY_REJECTED'
  | 'IN_TRANSIT'
  | 'AT_RETAILER'
  | 'RECALLED';

export type VerificationStatus = 'VERIFIED' | 'INFORMATION_INCOMPLETE' | 'FLAGGED' | 'NOT_FOUND';

export interface Batch {
  id: string;
  batchCode: string; // e.g. HT-2026-DEMO01
  producerId: string;
  productName: string;
  honeyType: HoneyType;
  producerLotNumber: string;
  sourceId: string;
  harvestDate: string;
  harvestMethod: HarvestMethod;
  quantityKg: number;
  packagingType: string;
  expiryDate: string;
  assignedProcessorId: string;
  currentCustodianId?: string;
  pendingRetailerId?: string;
  status: BatchStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  recallReason?: string;
  recalledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessType =
  | 'FILTRATION'
  | 'SETTLING'
  | 'MOISTURE_ADJUSTMENT'
  | 'PASTEURIZATION'
  | 'PACKAGING'
  | 'OTHER';

export interface ProcessingRecord {
  id: string;
  batchId: string;
  processorId: string;
  processType: ProcessType;
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
  createdAt: string;
}

export type QualityTestType = 'ROUTINE_LAB' | 'THIRD_PARTY_LAB' | 'IN_HOUSE_RAPID';

export interface QualityTest {
  id: string;
  batchId: string;
  testedById: string;
  testType: QualityTestType;
  labName: string;
  reportReference: string;
  testedAt: string;
  moisturePct?: number; // Normal <= 20%
  hmfMgKg?: number; // Normal <= 40 mg/kg
  electricalConductivityMsCm?: number; // Normal <= 0.8 mS/cm
  ph?: number; // Normal 3.2 - 4.5
  diastaseNumber?: number; // Normal >= 8 Schade units
  overallResult: 'PASS' | 'FAIL';
  notes?: string;
  createdAt: string;
}

export type SupplyChainEventType =
  | 'BATCH_REGISTERED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'QUALITY_TEST_RECORDED'
  | 'PICKED_UP_BY_DISTRIBUTOR'
  | 'IN_TRANSIT_LOCATION_UPDATE'
  | 'DISPATCHED_TO_RETAILER'
  | 'RECEIVED_BY_RETAILER'
  | 'BATCH_RECALLED';

export interface SupplyChainEvent {
  id: string;
  batchId: string;
  eventType: SupplyChainEventType;
  occurredAt: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorOrg: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  status: BatchStatus;
  notes?: string;
  prevHash: string;
  eventHash: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  batchId: string;
  temperatureC: number;
  humidityPct: number;
  weightKg: number;
  tdsPpm: number;
  isAbnormal: boolean;
  recordedAt: string;
  receivedAt: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  producerId: string;
  batchId?: string;
  apiKey: string;
  apiKeyHash: string;
  isActive: boolean;
  createdAt: string;
  lastReadingAt?: string;
}

export interface RetailerInventory {
  id: string;
  batchId: string;
  retailerId: string;
  quantityReceivedKg: number;
  quantityOnHand: number;
  shelfLocation: string;
  condition: 'OK' | 'DAMAGED';
  receivedAt: string;
  updatedAt: string;
}

export type AlertType =
  | 'UNKNOWN_BATCH_SCAN'
  | 'DUPLICATE_BATCH_IDENTIFIER'
  | 'UNAUTHORIZED_UPDATE_ATTEMPT'
  | 'INVALID_STATE_TRANSITION'
  | 'INCONSISTENT_BATCH_DATA'
  | 'MISSING_HANDOVER'
  | 'SENSOR_ABNORMAL'
  | 'SENSOR_MISSING'
  | 'UNEXPECTED_LOCATION'
  | 'QUALITY_TEST_FAILED'
  | 'BATCH_RECALLED'
  | 'BATCH_EXPIRED'
  | 'CHAIN_INTEGRITY_FAILURE';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
  id: string;
  batchId?: string;
  batchCode?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  evidence?: Record<string, any>;
  status: AlertStatus;
  note?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  affectsVerification: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipHash: string;
  createdAt: string;
}

export interface VerificationCheck {
  id: string;
  code: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface PublicVerification {
  status: VerificationStatus;
  reasons: string[];
  checks: VerificationCheck[];
  batch?: {
    code: string;
    productName: string;
    honeyType: HoneyType;
    quantityKg: number;
    packagingType: string;
    harvestDate: string;
    harvestMethod: HarvestMethod;
    expiryDate: string;
    status: BatchStatus;
    notes?: string;
    recalled?: boolean;
    recallReason?: string;
  };
  producer?: {
    name: string;
    organizationName: string;
    location?: string;
  };
  origin?: {
    name: string;
    village: string;
    district: string;
    state: string;
    country: string;
    approxLatitude?: number;
    approxLongitude?: number;
    floralSource?: string;
  };
  processing?: {
    facilityName: string;
    facilityLocation: string;
    processType: string;
    completedAt: string;
    additivesDeclared: boolean;
    additivesNotes?: string;
    maxTemperatureC?: number;
    processorOrg: string;
  };
  quality?: {
    labName: string;
    reportReference: string;
    testedAt: string;
    overallResult: 'PASS' | 'FAIL';
    moisturePct?: number;
    hmfMgKg?: number;
    electricalConductivityMsCm?: number;
    ph?: number;
    diastaseNumber?: number;
  };
  timeline: {
    eventType: SupplyChainEventType;
    occurredAt: string;
    actorOrg: string;
    actorRole: string;
    locationName: string;
    status: string;
    notes?: string;
    eventHash: string;
  }[];
  sensorSummary?: {
    readingCount: number;
    latestTemp: number;
    latestHumidity: number;
    minTemp: number;
    maxTemp: number;
    minHumidity: number;
    maxHumidity: number;
    latestRecordedAt: string;
    disclaimer: string;
  };
  warnings: {
    type: string;
    severity: AlertSeverity;
    message: string;
  }[];
  verifiedAt: string;
}

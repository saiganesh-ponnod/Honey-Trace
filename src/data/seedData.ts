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
  AuditLog
} from '../types';
import { simpleSha256 } from '../utils/crypto';

export const SEED_USERS: User[] = [
  {
    id: 'user-admin-01',
    name: 'Vikram Rao',
    email: 'admin@honeytrace.demo',
    role: 'ADMIN',
    status: 'APPROVED',
    organizationName: 'HoneyTrace Platform Authority',
    phone: '+91 98201 11223',
    location: 'Mumbai, Maharashtra',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-producer-01',
    name: 'Ravi Kale',
    email: 'ravi@sahyadrihoney.demo',
    role: 'PRODUCER',
    status: 'APPROVED',
    organizationName: 'Sahyadri Wild Honey FPO',
    phone: '+91 94230 45678',
    location: 'Mahabaleshwar, Satara, Maharashtra',
    createdAt: '2026-01-15T09:30:00Z'
  },
  {
    id: 'user-producer-02',
    name: 'Meera Kulkarni',
    email: 'meera@nashikapiaries.demo',
    role: 'PRODUCER',
    status: 'APPROVED',
    organizationName: 'Nashik Valley Apiaries',
    phone: '+91 98220 78901',
    location: 'Nashik, Maharashtra',
    createdAt: '2026-01-18T11:00:00Z'
  },
  {
    id: 'user-processor-01',
    name: 'Sahyadri Processing Unit',
    email: 'processing@sahyadriprocessors.demo',
    role: 'PROCESSOR',
    status: 'APPROVED',
    organizationName: 'Sahyadri Honey Processing Facility',
    phone: '+91 98231 23456',
    location: 'Hadapsar, Pune, Maharashtra',
    createdAt: '2026-01-20T10:15:00Z'
  },
  {
    id: 'user-processor-02',
    name: 'Dr. Anjali Deshmukh',
    email: 'quality@qualichecklabs.demo',
    role: 'PROCESSOR',
    status: 'APPROVED',
    organizationName: 'QualiCheck Analytical Labs (NABL Accredited)',
    phone: '+91 98233 44556',
    location: 'Shivajinagar, Pune, Maharashtra',
    createdAt: '2026-01-20T14:00:00Z'
  },
  {
    id: 'user-distributor-01',
    name: 'Sameer Shaikh',
    email: 'ops@greenroute.demo',
    role: 'DISTRIBUTOR',
    status: 'APPROVED',
    organizationName: 'GreenRoute Agro Logistics',
    phone: '+91 97654 32109',
    location: 'Pune Cold Storage Hub, Maharashtra',
    createdAt: '2026-01-25T12:00:00Z'
  },
  {
    id: 'user-distributor-02',
    name: 'Konkan Cold Chain Ops',
    email: 'ops@konkancoldchain.demo',
    role: 'DISTRIBUTOR',
    status: 'APPROVED',
    organizationName: 'Konkan Temperature Controlled Logistics',
    phone: '+91 98210 99887',
    location: 'Navi Mumbai, Maharashtra',
    createdAt: '2026-01-26T09:00:00Z'
  },
  {
    id: 'user-retailer-01',
    name: 'Neha Joshi',
    email: 'store@freshbasket.demo',
    role: 'RETAILER',
    status: 'APPROVED',
    organizationName: 'FreshBasket Organic Superstore',
    phone: '+91 98205 66778',
    location: 'Bandra West, Mumbai, Maharashtra',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user-retailer-02',
    name: 'Nature\'s Aisle Retail',
    email: 'store@naturesaisle.demo',
    role: 'RETAILER',
    status: 'APPROVED',
    organizationName: 'Nature\'s Aisle Artisanal Foods',
    phone: '+91 98224 55667',
    location: 'Koregaon Park, Pune, Maharashtra',
    createdAt: '2026-02-05T11:30:00Z'
  },
  {
    id: 'user-pending-01',
    name: 'Anand Shinde',
    email: 'pending@newapiary.demo',
    role: 'PRODUCER',
    status: 'PENDING',
    organizationName: 'Western Ghats Forest Honey Initiative',
    phone: '+91 94220 11998',
    location: 'Kolhapur, Maharashtra',
    createdAt: '2026-03-28T16:20:00Z'
  }
];

export const SEED_SOURCES: HoneySource[] = [
  {
    id: 'src-01',
    producerId: 'user-producer-01',
    name: 'Sahyadri High-Altitude Apiary #4',
    village: 'Metgutad',
    district: 'Satara (Mahabaleshwar Range)',
    state: 'Maharashtra',
    country: 'India',
    latitude: 17.9234,
    longitude: 73.6586,
    floralSource: 'Wild Karvi, Jamun & Hirda Blossom',
    createdAt: '2026-01-20T08:00:00Z'
  },
  {
    id: 'src-02',
    producerId: 'user-producer-02',
    name: 'Trimbak Mountain Flora Hive #12',
    village: 'Trimbakeshwar',
    district: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.9381,
    longitude: 73.5312,
    floralSource: 'Wild Multifloral, Neem & Mustard',
    createdAt: '2026-01-22T09:00:00Z'
  },
  {
    id: 'src-03',
    producerId: 'user-producer-01',
    name: 'Koyna Valley Forest Station #2',
    village: 'Bamnoli',
    district: 'Satara',
    state: 'Maharashtra',
    country: 'India',
    latitude: 17.7121,
    longitude: 73.7432,
    floralSource: 'Deep Evergreen Forest Flora',
    createdAt: '2026-01-25T10:00:00Z'
  }
];

export const SEED_BATCHES: Batch[] = [
  {
    id: 'batch-demo-01',
    batchCode: 'HT-2026-DEMO01',
    producerId: 'user-producer-01',
    productName: 'Mahabaleshwar Wild Forest Raw Honey',
    honeyType: 'WILDFLOWER',
    producerLotNumber: 'RAVI-2026-045',
    sourceId: 'src-01',
    harvestDate: '2026-02-10',
    harvestMethod: 'MANUAL_EXTRACTION',
    quantityKg: 250,
    packagingType: '500g Glass Jars',
    expiryDate: '2028-02-10',
    assignedProcessorId: 'user-processor-01',
    currentCustodianId: 'user-retailer-01',
    pendingRetailerId: 'user-retailer-01',
    status: 'AT_RETAILER',
    verificationStatus: 'VERIFIED',
    notes: 'Pure unprocessed raw wild honey harvested from pristine Sahyadri hill forests.',
    createdAt: '2026-02-12T06:30:00Z',
    updatedAt: '2026-03-05T14:20:00Z'
  },
  {
    id: 'batch-demo-02',
    batchCode: 'HT-2026-DEMO02',
    producerId: 'user-producer-02',
    productName: 'Nashik Valley Multifloral Blossom Honey',
    honeyType: 'MULTIFLORA',
    producerLotNumber: 'MEERA-2026-019',
    sourceId: 'src-02',
    harvestDate: '2026-03-01',
    harvestMethod: 'CENTRIFUGE',
    quantityKg: 400,
    packagingType: '1kg Eco-PET Jars',
    expiryDate: '2028-03-01',
    assignedProcessorId: 'user-processor-01',
    currentCustodianId: 'user-distributor-01',
    pendingRetailerId: 'user-retailer-02',
    status: 'IN_TRANSIT',
    verificationStatus: 'INFORMATION_INCOMPLETE',
    notes: 'Light golden nectar collected from organic orchard blossoms around Godavari river basin.',
    createdAt: '2026-03-03T08:00:00Z',
    updatedAt: '2026-03-22T10:15:00Z'
  },
  {
    id: 'batch-demo-03',
    batchCode: 'HT-2026-DEMO03',
    producerId: 'user-producer-01',
    productName: 'Sahyadri Forest Honey Reserve',
    honeyType: 'FOREST',
    producerLotNumber: 'RAVI-2026-048',
    sourceId: 'src-03',
    harvestDate: '2026-01-15',
    harvestMethod: 'PRESSING',
    quantityKg: 180,
    packagingType: '350g Hexagonal Glass Jars',
    expiryDate: '2028-01-15',
    assignedProcessorId: 'user-processor-01',
    currentCustodianId: 'user-retailer-02',
    pendingRetailerId: 'user-retailer-02',
    status: 'AT_RETAILER',
    verificationStatus: 'FLAGGED',
    notes: 'Seeded test case demonstrating automated detection of custody gap, thermal spike, and elevated HMF.',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-03-15T16:45:00Z'
  }
];

export const SEED_PROCESSING: ProcessingRecord[] = [
  {
    id: 'proc-01',
    batchId: 'batch-demo-01',
    processorId: 'user-processor-01',
    processType: 'FILTRATION',
    facilityName: 'Sahyadri Central Facility',
    facilityLocation: 'Pune, Maharashtra',
    startedAt: '2026-02-14T08:00:00Z',
    completedAt: '2026-02-14T17:30:00Z',
    maxTemperatureC: 28.5,
    inputQuantityKg: 250,
    outputQuantityKg: 246.5,
    markComplete: true,
    additivesDeclared: false,
    notes: 'Micro-cloth gravity filtration to remove wax impurities. No heating applied.',
    createdAt: '2026-02-14T17:35:00Z'
  },
  {
    id: 'proc-02',
    batchId: 'batch-demo-02',
    processorId: 'user-processor-01',
    processType: 'SETTLING',
    facilityName: 'Sahyadri Central Facility',
    facilityLocation: 'Pune, Maharashtra',
    startedAt: '2026-03-05T09:00:00Z',
    completedAt: '2026-03-07T12:00:00Z',
    maxTemperatureC: 26.0,
    inputQuantityKg: 400,
    outputQuantityKg: 395,
    markComplete: true,
    additivesDeclared: false,
    notes: 'Settled in stainless steel food-grade tanks at room temperature.',
    createdAt: '2026-03-07T12:05:00Z'
  },
  {
    id: 'proc-03',
    batchId: 'batch-demo-03',
    processorId: 'user-processor-01',
    processType: 'PASTEURIZATION',
    facilityName: 'Sahyadri Secondary Unit',
    facilityLocation: 'Pune, Maharashtra',
    startedAt: '2026-01-25T10:00:00Z',
    completedAt: '2026-01-25T15:00:00Z',
    maxTemperatureC: 68.0, // High thermal treatment
    inputQuantityKg: 180,
    outputQuantityKg: 177,
    markComplete: true,
    additivesDeclared: false,
    notes: 'Processed with heat treatment.',
    createdAt: '2026-01-25T15:30:00Z'
  }
];

export const SEED_QUALITY_TESTS: QualityTest[] = [
  {
    id: 'qual-01',
    batchId: 'batch-demo-01',
    testedById: 'user-processor-02',
    testType: 'THIRD_PARTY_LAB',
    labName: 'QualiCheck Analytical Labs (NABL Accredited)',
    reportReference: 'QC-LAB-2026-M0458',
    testedAt: '2026-02-16T14:30:00Z',
    moisturePct: 17.8, // Normal <= 20%
    hmfMgKg: 18.4, // Normal <= 40
    electricalConductivityMsCm: 0.42, // Normal <= 0.8
    ph: 3.85, // Normal 3.2 - 4.5
    diastaseNumber: 14.6, // Normal >= 8
    overallResult: 'PASS',
    notes: 'All quality parameters conform strictly to FSSAI Gazetted standards & Codex Alimentarius.',
    createdAt: '2026-02-16T15:00:00Z'
  },
  {
    id: 'qual-02',
    batchId: 'batch-demo-02',
    testedById: 'user-processor-02',
    testType: 'ROUTINE_LAB',
    labName: 'QualiCheck Analytical Labs',
    reportReference: 'QC-LAB-2026-M0612',
    testedAt: '2026-03-10T11:00:00Z',
    moisturePct: 18.2,
    hmfMgKg: 21.0,
    electricalConductivityMsCm: 0.38,
    ph: 4.10,
    diastaseNumber: 12.0,
    overallResult: 'PASS',
    notes: 'Excellent floral aroma profile and enzymatic density.',
    createdAt: '2026-03-10T11:30:00Z'
  },
  {
    id: 'qual-03',
    batchId: 'batch-demo-03',
    testedById: 'user-processor-02',
    testType: 'ROUTINE_LAB',
    labName: 'QualiCheck Analytical Labs',
    reportReference: 'QC-LAB-2026-M0199',
    testedAt: '2026-01-28T16:00:00Z',
    moisturePct: 19.4,
    hmfMgKg: 62.5, // Out-of-limit! (> 40 mg/kg limit)
    electricalConductivityMsCm: 0.65,
    ph: 3.60,
    diastaseNumber: 5.2, // Below minimum 8
    overallResult: 'PASS', // Inconsistent PASS!
    notes: 'Tested with elevated HMF; flagged for thermal degradation.',
    createdAt: '2026-01-28T16:30:00Z'
  }
];

// Helper to construct hash chained events for demo seed
function buildDemoEvents(): SupplyChainEvent[] {
  const events: SupplyChainEvent[] = [];

  // DEMO01 Events
  const h0 = 'GENESIS';
  const h1 = simpleSha256(h0 + 'BATCH_REGISTERED' + '2026-02-12T06:30:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-01',
    batchId: 'batch-demo-01',
    eventType: 'BATCH_REGISTERED',
    occurredAt: '2026-02-12T06:30:00Z',
    actorId: 'user-producer-01',
    actorName: 'Ravi Kale',
    actorRole: 'PRODUCER',
    actorOrg: 'Sahyadri Wild Honey FPO',
    locationName: 'Mahabaleshwar Apiary, Satara',
    latitude: 17.9234,
    longitude: 73.6586,
    status: 'REGISTERED',
    notes: 'Harvested 250 kg raw wild forest honey. Assigned lot RAVI-2026-045.',
    prevHash: h0,
    eventHash: h1
  });

  const h2 = simpleSha256(h1 + 'PROCESSING_STARTED' + '2026-02-14T08:00:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-02',
    batchId: 'batch-demo-01',
    eventType: 'PROCESSING_STARTED',
    occurredAt: '2026-02-14T08:00:00Z',
    actorId: 'user-processor-01',
    actorName: 'Sahyadri Processing Unit',
    actorRole: 'PROCESSOR',
    actorOrg: 'Sahyadri Honey Processing Facility',
    locationName: 'Hadapsar Facility, Pune',
    latitude: 18.5089,
    longitude: 73.9259,
    status: 'PROCESSING',
    notes: 'Received batch at processing unit. Commenced cold cloth filtration.',
    prevHash: h1,
    eventHash: h2
  });

  const h3 = simpleSha256(h2 + 'PROCESSING_COMPLETED' + '2026-02-14T17:30:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-03',
    batchId: 'batch-demo-01',
    eventType: 'PROCESSING_COMPLETED',
    occurredAt: '2026-02-14T17:30:00Z',
    actorId: 'user-processor-01',
    actorName: 'Sahyadri Processing Unit',
    actorRole: 'PROCESSOR',
    actorOrg: 'Sahyadri Honey Processing Facility',
    locationName: 'Hadapsar Facility, Pune',
    latitude: 18.5089,
    longitude: 73.9259,
    status: 'PROCESSED',
    notes: 'Filtration complete. 246.5 kg bottled into 500g glass jars.',
    prevHash: h2,
    eventHash: h3
  });

  const h4 = simpleSha256(h3 + 'QUALITY_TEST_RECORDED' + '2026-02-16T14:30:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-04',
    batchId: 'batch-demo-01',
    eventType: 'QUALITY_TEST_RECORDED',
    occurredAt: '2026-02-16T14:30:00Z',
    actorId: 'user-processor-02',
    actorName: 'Dr. Anjali Deshmukh',
    actorRole: 'PROCESSOR',
    actorOrg: 'QualiCheck Analytical Labs (NABL)',
    locationName: 'QualiCheck Labs, Pune',
    latitude: 18.5314,
    longitude: 73.8446,
    status: 'QUALITY_APPROVED',
    notes: 'Full physicochemical panel passed (Moisture 17.8%, HMF 18.4 mg/kg, Diastase 14.6).',
    prevHash: h3,
    eventHash: h4
  });

  const h5 = simpleSha256(h4 + 'PICKED_UP_BY_DISTRIBUTOR' + '2026-02-20T09:15:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-05',
    batchId: 'batch-demo-01',
    eventType: 'PICKED_UP_BY_DISTRIBUTOR',
    occurredAt: '2026-02-20T09:15:00Z',
    actorId: 'user-distributor-01',
    actorName: 'Sameer Shaikh',
    actorRole: 'DISTRIBUTOR',
    actorOrg: 'GreenRoute Agro Logistics',
    locationName: 'Pune Cold Hub, Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'IN_TRANSIT',
    notes: 'Loaded into insulated reefer van MH-12-GR-4491. IoT telemetry active.',
    prevHash: h4,
    eventHash: h5
  });

  const h6 = simpleSha256(h5 + 'IN_TRANSIT_LOCATION_UPDATE' + '2026-02-21T13:45:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-06',
    batchId: 'batch-demo-01',
    eventType: 'IN_TRANSIT_LOCATION_UPDATE',
    occurredAt: '2026-02-21T13:45:00Z',
    actorId: 'user-distributor-01',
    actorName: 'Sameer Shaikh',
    actorRole: 'DISTRIBUTOR',
    actorOrg: 'GreenRoute Agro Logistics',
    locationName: 'Expressway Transit Depot, Navi Mumbai',
    latitude: 19.0330,
    longitude: 73.0297,
    status: 'IN_TRANSIT',
    notes: 'Midpoint temperature verified at 22.4°C. Transit proceeding on schedule.',
    prevHash: h5,
    eventHash: h6
  });

  const h7 = simpleSha256(h6 + 'DISPATCHED_TO_RETAILER' + '2026-02-22T08:30:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-07',
    batchId: 'batch-demo-01',
    eventType: 'DISPATCHED_TO_RETAILER',
    occurredAt: '2026-02-22T08:30:00Z',
    actorId: 'user-distributor-01',
    actorName: 'Sameer Shaikh',
    actorRole: 'DISTRIBUTOR',
    actorOrg: 'GreenRoute Agro Logistics',
    locationName: 'Bandra Delivery Terminal, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    status: 'IN_TRANSIT',
    notes: 'Arrived at destination hub for handover to FreshBasket Organic.',
    prevHash: h6,
    eventHash: h7
  });

  const h8 = simpleSha256(h7 + 'RECEIVED_BY_RETAILER' + '2026-02-22T11:00:00Z' + 'batch-demo-01');
  events.push({
    id: 'evt-08',
    batchId: 'batch-demo-01',
    eventType: 'RECEIVED_BY_RETAILER',
    occurredAt: '2026-02-22T11:00:00Z',
    actorId: 'user-retailer-01',
    actorName: 'Neha Joshi',
    actorRole: 'RETAILER',
    actorOrg: 'FreshBasket Organic Superstore',
    locationName: 'FreshBasket Bandra Store, Mumbai',
    latitude: 19.0600,
    longitude: 72.8339,
    status: 'AT_RETAILER',
    notes: 'Received 246.5 kg in pristine condition. QR shelf display tags printed.',
    prevHash: h7,
    eventHash: h8
  });

  // DEMO02 Events (In Transit)
  const d2_0 = 'GENESIS';
  const d2_1 = simpleSha256(d2_0 + 'BATCH_REGISTERED' + '2026-03-03T08:00:00Z' + 'batch-demo-02');
  events.push({
    id: 'evt-d2-01',
    batchId: 'batch-demo-02',
    eventType: 'BATCH_REGISTERED',
    occurredAt: '2026-03-03T08:00:00Z',
    actorId: 'user-producer-02',
    actorName: 'Meera Kulkarni',
    actorRole: 'PRODUCER',
    actorOrg: 'Nashik Valley Apiaries',
    locationName: 'Trimbakeshwar Grove, Nashik',
    latitude: 19.9381,
    longitude: 73.5312,
    status: 'REGISTERED',
    notes: '400 kg lot MEERA-2026-019 registered.',
    prevHash: d2_0,
    eventHash: d2_1
  });

  const d2_2 = simpleSha256(d2_1 + 'PROCESSING_COMPLETED' + '2026-03-07T12:00:00Z' + 'batch-demo-02');
  events.push({
    id: 'evt-d2-02',
    batchId: 'batch-demo-02',
    eventType: 'PROCESSING_COMPLETED',
    occurredAt: '2026-03-07T12:00:00Z',
    actorId: 'user-processor-01',
    actorName: 'Sahyadri Processing Unit',
    actorRole: 'PROCESSOR',
    actorOrg: 'Sahyadri Honey Processing Facility',
    locationName: 'Hadapsar Unit, Pune',
    latitude: 18.5089,
    longitude: 73.9259,
    status: 'PROCESSED',
    notes: 'Settled and packaged into 1kg jars.',
    prevHash: d2_1,
    eventHash: d2_2
  });

  const d2_3 = simpleSha256(d2_2 + 'QUALITY_TEST_RECORDED' + '2026-03-10T11:00:00Z' + 'batch-demo-02');
  events.push({
    id: 'evt-d2-03',
    batchId: 'batch-demo-02',
    eventType: 'QUALITY_TEST_RECORDED',
    occurredAt: '2026-03-10T11:00:00Z',
    actorId: 'user-processor-02',
    actorName: 'Dr. Anjali Deshmukh',
    actorRole: 'PROCESSOR',
    actorOrg: 'QualiCheck Analytical Labs (NABL)',
    locationName: 'QualiCheck Labs, Pune',
    latitude: 18.5314,
    longitude: 73.8446,
    status: 'QUALITY_APPROVED',
    notes: 'Passed laboratory analysis.',
    prevHash: d2_2,
    eventHash: d2_3
  });

  const d2_4 = simpleSha256(d2_3 + 'PICKED_UP_BY_DISTRIBUTOR' + '2026-03-20T10:00:00Z' + 'batch-demo-02');
  events.push({
    id: 'evt-d2-04',
    batchId: 'batch-demo-02',
    eventType: 'PICKED_UP_BY_DISTRIBUTOR',
    occurredAt: '2026-03-20T10:00:00Z',
    actorId: 'user-distributor-01',
    actorName: 'Sameer Shaikh',
    actorRole: 'DISTRIBUTOR',
    actorOrg: 'GreenRoute Agro Logistics',
    locationName: 'Pune Cold Hub',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'IN_TRANSIT',
    notes: 'Picked up for distribution. In transit to Nature\'s Aisle.',
    prevHash: d2_3,
    eventHash: d2_4
  });

  // DEMO03 Events (Seeded Gap: Missing Pickup/Dispatch before Receipt)
  const d3_0 = 'GENESIS';
  const d3_1 = simpleSha256(d3_0 + 'BATCH_REGISTERED' + '2026-01-20T09:00:00Z' + 'batch-demo-03');
  events.push({
    id: 'evt-d3-01',
    batchId: 'batch-demo-03',
    eventType: 'BATCH_REGISTERED',
    occurredAt: '2026-01-20T09:00:00Z',
    actorId: 'user-producer-01',
    actorName: 'Ravi Kale',
    actorRole: 'PRODUCER',
    actorOrg: 'Sahyadri Wild Honey FPO',
    locationName: 'Koyna Valley Apiary',
    latitude: 17.7121,
    longitude: 73.7432,
    status: 'REGISTERED',
    notes: 'Batch created.',
    prevHash: d3_0,
    eventHash: d3_1
  });

  const d3_2 = simpleSha256(d3_1 + 'PROCESSING_COMPLETED' + '2026-01-25T15:00:00Z' + 'batch-demo-03');
  events.push({
    id: 'evt-d3-02',
    batchId: 'batch-demo-03',
    eventType: 'PROCESSING_COMPLETED',
    occurredAt: '2026-01-25T15:00:00Z',
    actorId: 'user-processor-01',
    actorName: 'Sahyadri Processing Unit',
    actorRole: 'PROCESSOR',
    actorOrg: 'Sahyadri Honey Processing Facility',
    locationName: 'Pune Facility',
    latitude: 18.5089,
    longitude: 73.9259,
    status: 'PROCESSED',
    notes: 'High heat processing recorded.',
    prevHash: d3_1,
    eventHash: d3_2
  });

  const d3_3 = simpleSha256(d3_2 + 'QUALITY_TEST_RECORDED' + '2026-01-28T16:00:00Z' + 'batch-demo-03');
  events.push({
    id: 'evt-d3-03',
    batchId: 'batch-demo-03',
    eventType: 'QUALITY_TEST_RECORDED',
    occurredAt: '2026-01-28T16:00:00Z',
    actorId: 'user-processor-02',
    actorName: 'Dr. Anjali Deshmukh',
    actorRole: 'PROCESSOR',
    actorOrg: 'QualiCheck Analytical Labs',
    locationName: 'Pune Lab',
    latitude: 18.5314,
    longitude: 73.8446,
    status: 'QUALITY_APPROVED',
    notes: 'Quality test recorded PASS with HMF 62.5 mg/kg.',
    prevHash: d3_2,
    eventHash: d3_3
  });

  // GAP: Direct jump to Retailer Receipt without Pickup or Dispatch!
  const d3_4 = simpleSha256(d3_3 + 'RECEIVED_BY_RETAILER' + '2026-02-15T10:00:00Z' + 'batch-demo-03');
  events.push({
    id: 'evt-d3-04',
    batchId: 'batch-demo-03',
    eventType: 'RECEIVED_BY_RETAILER',
    occurredAt: '2026-02-15T10:00:00Z',
    actorId: 'user-retailer-02',
    actorName: 'Nature\'s Aisle Retail',
    actorRole: 'RETAILER',
    actorOrg: 'Nature\'s Aisle Artisanal Foods',
    locationName: 'Koregaon Park Store, Pune',
    latitude: 18.5362,
    longitude: 73.8940,
    status: 'AT_RETAILER',
    notes: 'Handover anomaly: Batch received without preceding distributor pickup or dispatch event.',
    prevHash: d3_3,
    eventHash: d3_4
  });

  return events;
}

export const SEED_EVENTS: SupplyChainEvent[] = buildDemoEvents();

export const SEED_DEVICES: IoTDevice[] = [
  {
    id: 'dev-01',
    name: 'ESP32 Telemetry Node #1 (Reefer Cold Van)',
    producerId: 'user-producer-01',
    batchId: 'batch-demo-01',
    apiKey: 'ht_dev_982f14e7a89b43c6834d193e29f',
    apiKeyHash: simpleSha256('ht_dev_982f14e7a89b43c6834d193e29f'),
    isActive: true,
    createdAt: '2026-02-12T07:00:00Z',
    lastReadingAt: '2026-02-22T10:55:00Z'
  },
  {
    id: 'dev-02',
    name: 'ESP32 Telemetry Node #2 (Transit Hub Sensor)',
    producerId: 'user-producer-02',
    batchId: 'batch-demo-02',
    apiKey: 'ht_dev_773a21b44c9d51e8829f048d21c',
    apiKeyHash: simpleSha256('ht_dev_773a21b44c9d51e8829f048d21c'),
    isActive: true,
    createdAt: '2026-03-03T09:00:00Z',
    lastReadingAt: '2026-03-22T09:30:00Z'
  },
  {
    id: 'dev-03',
    name: 'ESP32 Storage Node #3 (Uncontrolled Storage)',
    producerId: 'user-producer-01',
    batchId: 'batch-demo-03',
    apiKey: 'ht_dev_119e88b22a44c77d991f663a77d',
    apiKeyHash: simpleSha256('ht_dev_119e88b22a44c77d991f663a77d'),
    isActive: true,
    createdAt: '2026-01-20T10:00:00Z',
    lastReadingAt: '2026-02-14T18:00:00Z'
  }
];

function generateDemoSensorReadings(): SensorReading[] {
  const readings: SensorReading[] = [];

  // 20 normal readings for DEMO01
  const startD1 = new Date('2026-02-13T00:00:00Z').getTime();
  for (let i = 0; i < 20; i++) {
    const time = new Date(startD1 + i * 10 * 3600 * 1000).toISOString();
    // subtle variations around 21-24°C, 42-52% humidity
    const temp = Number((21.5 + Math.sin(i * 0.8) * 2.2 + (i % 3) * 0.4).toFixed(1));
    const hum = Number((47.0 + Math.cos(i * 0.6) * 4.5).toFixed(1));
    const weight = Number((246.5 - (i * 0.05)).toFixed(1));
    const tds = 310 + (i % 5) * 4;

    readings.push({
      id: `read-d1-${i + 1}`,
      deviceId: 'dev-01',
      batchId: 'batch-demo-01',
      temperatureC: temp,
      humidityPct: hum,
      weightKg: weight,
      tdsPpm: tds,
      isAbnormal: false,
      recordedAt: time,
      receivedAt: time
    });
  }

  // 12 readings for DEMO02
  const startD2 = new Date('2026-03-08T00:00:00Z').getTime();
  for (let i = 0; i < 12; i++) {
    const time = new Date(startD2 + i * 12 * 3600 * 1000).toISOString();
    const temp = Number((23.0 + Math.sin(i) * 3.0).toFixed(1));
    const hum = Number((50.0 + Math.cos(i) * 5.0).toFixed(1));
    readings.push({
      id: `read-d2-${i + 1}`,
      deviceId: 'dev-02',
      batchId: 'batch-demo-02',
      temperatureC: temp,
      humidityPct: hum,
      weightKg: 395,
      tdsPpm: 295,
      isAbnormal: false,
      recordedAt: time,
      receivedAt: time
    });
  }

  // DEMO03 Readings with 44°C thermal abuse spike
  const startD3 = new Date('2026-02-01T00:00:00Z').getTime();
  for (let i = 0; i < 15; i++) {
    const time = new Date(startD3 + i * 14 * 3600 * 1000).toISOString();
    let temp = 25.0;
    let hum = 48.0;
    let isAbnormal = false;

    if (i >= 7 && i <= 10) {
      temp = Number((41.5 + (i - 7) * 1.2).toFixed(1)); // Peaks at 44.1°C!
      hum = 78.5; // High humidity
      isAbnormal = true;
    }

    readings.push({
      id: `read-d3-${i + 1}`,
      deviceId: 'dev-03',
      batchId: 'batch-demo-03',
      temperatureC: temp,
      humidityPct: hum,
      weightKg: 177,
      tdsPpm: 340,
      isAbnormal,
      recordedAt: time,
      receivedAt: time
    });
  }

  return readings;
}

export const SEED_SENSOR_READINGS: SensorReading[] = generateDemoSensorReadings();

export const SEED_RETAILER_INVENTORY: RetailerInventory[] = [
  {
    id: 'inv-01',
    batchId: 'batch-demo-01',
    retailerId: 'user-retailer-01',
    quantityReceivedKg: 246.5,
    quantityOnHand: 218.0,
    shelfLocation: 'Aisle 3 - Artisanal Honey & Organic Sweeteners (Shelf B2)',
    condition: 'OK',
    receivedAt: '2026-02-22T11:00:00Z',
    updatedAt: '2026-03-25T15:00:00Z'
  },
  {
    id: 'inv-02',
    batchId: 'batch-demo-03',
    retailerId: 'user-retailer-02',
    quantityReceivedKg: 177.0,
    quantityOnHand: 177.0,
    shelfLocation: 'Quarantine Hold Area - Quality Investigation Pending',
    condition: 'OK',
    receivedAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z'
  }
];

export const SEED_ALERTS: Alert[] = [
  {
    id: 'alert-01',
    batchId: 'batch-demo-03',
    batchCode: 'HT-2026-DEMO03',
    type: 'MISSING_HANDOVER',
    severity: 'HIGH',
    message: 'Supply chain sequence violation: Batch marked as received by retailer without preceding distributor pickup or dispatch event record.',
    evidence: {
      registeredStatus: 'PROCESSED',
      attemptedTransition: 'RECEIVED_BY_RETAILER',
      missingEvents: ['PICKED_UP_BY_DISTRIBUTOR', 'DISPATCHED_TO_RETAILER']
    },
    status: 'OPEN',
    createdAt: '2026-02-15T10:01:00Z',
    updatedAt: '2026-02-15T10:01:00Z',
    affectsVerification: true
  },
  {
    id: 'alert-02',
    batchId: 'batch-demo-03',
    batchCode: 'HT-2026-DEMO03',
    type: 'INCONSISTENT_BATCH_DATA',
    severity: 'HIGH',
    message: 'Quality test contradiction: Quality status recorded as PASS despite Hydroxymethylfurfural (HMF) level 62.5 mg/kg exceeding maximum permissible standard limit of 40.0 mg/kg.',
    evidence: {
      parameter: 'hmfMgKg',
      recordedValue: 62.5,
      referenceLimit: 40.0,
      overallResult: 'PASS'
    },
    status: 'OPEN',
    createdAt: '2026-01-28T16:30:00Z',
    updatedAt: '2026-01-28T16:30:00Z',
    affectsVerification: true
  },
  {
    id: 'alert-03',
    batchId: 'batch-demo-03',
    batchCode: 'HT-2026-DEMO03',
    type: 'SENSOR_ABNORMAL',
    severity: 'HIGH',
    message: 'Extreme thermal degradation alert: 4 consecutive sensor telemetry readings exceeded 41°C (peak 44.1°C), risking enzyme loss and sugar breakdown.',
    evidence: {
      consecutiveReadings: 4,
      peakTemperatureC: 44.1,
      safeMaxThresholdC: 35.0,
      extremeThresholdC: 40.0
    },
    status: 'OPEN',
    createdAt: '2026-02-06T12:00:00Z',
    updatedAt: '2026-02-06T12:00:00Z',
    affectsVerification: true
  },
  {
    id: 'alert-04',
    type: 'UNKNOWN_BATCH_SCAN',
    severity: 'LOW',
    message: 'Consumer scan attempted for unregistered identifier HT-2026-FAKE99 from IP hash 8b7e21a0.',
    evidence: {
      queriedCode: 'HT-2026-FAKE99',
      source: 'Public Web Scanner',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    },
    status: 'OPEN',
    createdAt: '2026-03-29T14:15:00Z',
    updatedAt: '2026-03-29T14:15:00Z',
    affectsVerification: false
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actorId: 'user-producer-01',
    actorName: 'Ravi Kale',
    actorRole: 'PRODUCER',
    action: 'BATCH_CREATED',
    entityType: 'BATCH',
    entityId: 'batch-demo-01',
    details: { batchCode: 'HT-2026-DEMO01', lot: 'RAVI-2026-045', qty: 250 },
    ipHash: 'a1b2c3d4e5f6',
    createdAt: '2026-02-12T06:30:00Z'
  },
  {
    id: 'aud-02',
    actorId: 'user-processor-01',
    actorName: 'Sahyadri Processing Unit',
    actorRole: 'PROCESSOR',
    action: 'PROCESSING_RECORD_ADDED',
    entityType: 'PROCESSING',
    entityId: 'proc-01',
    details: { batchCode: 'HT-2026-DEMO01', processType: 'FILTRATION' },
    ipHash: 'f6e5d4c3b2a1',
    createdAt: '2026-02-14T17:35:00Z'
  },
  {
    id: 'aud-03',
    actorId: 'user-processor-02',
    actorName: 'Dr. Anjali Deshmukh',
    actorRole: 'PROCESSOR',
    action: 'QUALITY_TEST_RECORDED',
    entityType: 'QUALITY_TEST',
    entityId: 'qual-01',
    details: { batchCode: 'HT-2026-DEMO01', result: 'PASS', hmf: 18.4 },
    ipHash: 'c3b2a1f6e5d4',
    createdAt: '2026-02-16T15:00:00Z'
  },
  {
    id: 'aud-04',
    actorId: 'user-distributor-01',
    actorName: 'Sameer Shaikh',
    actorRole: 'DISTRIBUTOR',
    action: 'PICKUP_RECORDED',
    entityType: 'SUPPLY_CHAIN_EVENT',
    entityId: 'evt-05',
    details: { batchCode: 'HT-2026-DEMO01', status: 'IN_TRANSIT' },
    ipHash: 'd4c3b2a1f6e5',
    createdAt: '2026-02-20T09:15:00Z'
  },
  {
    id: 'aud-05',
    actorId: 'user-retailer-01',
    actorName: 'Neha Joshi',
    actorRole: 'RETAILER',
    action: 'RECEIPT_CONFIRMED',
    entityType: 'SUPPLY_CHAIN_EVENT',
    entityId: 'evt-08',
    details: { batchCode: 'HT-2026-DEMO01', status: 'AT_RETAILER', condition: 'OK' },
    ipHash: 'e5d4c3b2a1f6',
    createdAt: '2026-02-22T11:00:00Z'
  },
  {
    id: 'aud-06',
    actorId: 'user-admin-01',
    actorName: 'Vikram Rao',
    actorRole: 'ADMIN',
    action: 'SYSTEM_HEALTH_CHECK_RUN',
    entityType: 'SYSTEM',
    entityId: 'checks',
    details: { totalBatchesScanned: 3, alertsCreated: 0 },
    ipHash: 'b2a1f6e5d4c3',
    createdAt: '2026-03-30T10:00:00Z'
  }
];

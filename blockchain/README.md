# ⛓️ HoneyTrace Blockchain Architecture & Smart Contracts

This directory contains the production-grade Solidity smart contracts and deployment tooling for **HoneyTrace**.

## 📑 Contract Specification: `HoneyTrace.sol`
- **Compiler**: Solidity `^0.8.24`
- **Standard**: AccessControl, Pausable, Struct-based event ledgers.
- **Networks Supported**:
  - Local Hardhat / Anvil / Ganache testnode (`Chain ID 31337`)
  - Polygon Amoy Testnet (`Chain ID 80002`)
  - Ethereum Sepolia Testnet (`Chain ID 11155111`)

### Key Contract Methods:
1. `registerBatch(batchCode, honeyType, quantityKg, metadataHash, originLocation, producerOrg, notes)`:
   Anchors a newly harvested honey batch on the blockchain with cryptographic genesis state.
2. `recordProcessing(batchCode, processType, facilityName, facilityLocation, processorOrg, maxTemp, additivesDeclared, notes)`:
   Anchors industrial moisture adjustment, micro-filtration, or packaging milestones.
3. `recordQualityTest(batchCode, labName, labLocation, reportRef, passed, moistureBps, hmfBps, notes)`:
   Stores immutable laboratory test results (Moisture $\le 20\%$, HMF $\le 40\text{ mg/kg}$).
4. `transferCustody(batchCode, toCustodian, carrierOrg, location, notes)`:
   Signs off handover to refrigerated logistics carriers.
5. `confirmReceipt(batchCode, retailerOrg, location, notes)`:
   Retailer acknowledgment upon physical jar receipt.
6. `recallBatch(batchCode, reason, authorityOrg)`:
   Emergency administrative recall event with cryptographic signature.
7. `verifyBatch(batchCode)`:
   View function returning on-chain validation proof, custodian address, block height, and event counter.

## 🚀 Deployment Instructions

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### Local Node Deployment
```bash
# 1. Start local Hardhat EVM node
npx hardhat node

# 2. Deploy HoneyTrace.sol
npx hardhat run scripts/deploy.js --network localhost
```

### Polygon Amoy Deployment
```bash
npx hardhat run scripts/deploy.js --network amoy
```

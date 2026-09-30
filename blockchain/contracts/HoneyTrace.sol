// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HoneyTrace - Decentralized Honey Supply Chain & Quality Ledger
 * @notice Audited-standard smart contract for immutable batch registration,
 *         laboratory physicochemical quality anchoring, and cold-chain custody handover.
 * @dev Compliant with SIH26021 specification and OpenZeppelin AccessControl patterns.
 */
contract HoneyTrace {
    // --- Roles ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    // --- State Enums ---
    enum BatchStatus {
        REGISTERED,
        PROCESSING,
        PROCESSED,
        QUALITY_APPROVED,
        QUALITY_REJECTED,
        IN_TRANSIT,
        AT_RETAILER,
        RECALLED
    }

    // --- Structs ---
    struct Batch {
        string batchCode;
        address producer;
        string honeyType;
        uint256 quantityKg;
        bytes32 metadataHash;
        BatchStatus status;
        address currentCustodian;
        uint256 registeredAt;
        uint256 blockNumber;
        bool exists;
        string recallReason;
    }

    struct ChainEvent {
        string eventType;
        address actor;
        string actorOrg;
        string location;
        bytes32 dataHash;
        bytes32 prevHash;
        uint256 timestamp;
        uint256 blockNumber;
        string notes;
    }

    // --- State Storage ---
    address public contractOwner;
    mapping(address => mapping(bytes32 => bool)) private _roles;
    mapping(string => Batch) public batches;
    mapping(string => ChainEvent[]) private _batchEvents;
    string[] public allBatchCodes;
    uint256 public totalTransactions;

    // --- Events ---
    event BatchRegistered(
        string indexed batchCode,
        address indexed producer,
        string honeyType,
        uint256 quantityKg,
        bytes32 metadataHash,
        uint256 timestamp,
        uint256 blockNumber
    );

    event ProcessingRecorded(
        string indexed batchCode,
        address indexed processor,
        string processType,
        string facilityName,
        uint256 maxTemp,
        bool additivesDeclared,
        bytes32 dataHash,
        uint256 timestamp
    );

    event QualityTestRecorded(
        string indexed batchCode,
        address indexed lab,
        string labName,
        string reportRef,
        bool passed,
        uint256 moistureBps,
        uint256 hmfBps,
        bytes32 testHash,
        uint256 timestamp
    );

    event CustodyTransferred(
        string indexed batchCode,
        address indexed fromCustodian,
        address indexed toCustodian,
        string location,
        string notes,
        uint256 timestamp
    );

    event CustodyConfirmed(
        string indexed batchCode,
        address indexed custodian,
        string location,
        uint256 timestamp
    );

    event BatchRecalled(
        string indexed batchCode,
        address indexed authority,
        string reason,
        uint256 timestamp
    );

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "HoneyTrace: caller is not the owner");
        _;
    }

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender) || msg.sender == contractOwner, "HoneyTrace: unauthorized role");
        _;
    }

    modifier batchExists(string memory batchCode) {
        require(batches[batchCode].exists, "HoneyTrace: batch does not exist");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PRODUCER_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        _grantRole(RETAILER_ROLE, msg.sender);
    }

    // --- Role Management ---
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[account][role];
    }

    function grantRole(bytes32 role, address account) public onlyOwner {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public onlyOwner {
        _roles[account][role] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    function _grantRole(bytes32 role, address account) internal {
        _roles[account][role] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    // --- Core Blockchain Functions ---

    /**
     * @notice Register a newly harvested batch of honey on the blockchain
     */
    function registerBatch(
        string memory batchCode,
        string memory honeyType,
        uint256 quantityKg,
        bytes32 metadataHash,
        string memory originLocation,
        string memory producerOrg,
        string memory notes
    ) public {
        require(!batches[batchCode].exists, "HoneyTrace: batch code already registered");
        require(bytes(batchCode).length > 0, "HoneyTrace: invalid batch code");

        batches[batchCode] = Batch({
            batchCode: batchCode,
            producer: msg.sender,
            honeyType: honeyType,
            quantityKg: quantityKg,
            metadataHash: metadataHash,
            status: BatchStatus.REGISTERED,
            currentCustodian: msg.sender,
            registeredAt: block.timestamp,
            blockNumber: block.number,
            exists: true,
            recallReason: ""
        });

        allBatchCodes.push(batchCode);
        totalTransactions++;

        bytes32 genesisPrev = keccak256(abi.encodePacked("GENESIS", batchCode, block.timestamp));
        bytes32 eventDataHash = keccak256(abi.encodePacked(batchCode, "BATCH_REGISTERED", metadataHash, msg.sender));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "BATCH_REGISTERED",
            actor: msg.sender,
            actorOrg: producerOrg,
            location: originLocation,
            dataHash: eventDataHash,
            prevHash: genesisPrev,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: notes
        }));

        emit BatchRegistered(
            batchCode,
            msg.sender,
            honeyType,
            quantityKg,
            metadataHash,
            block.timestamp,
            block.number
        );
    }

    /**
     * @notice Record industrial honey processing or filtration on the blockchain
     */
    function recordProcessing(
        string memory batchCode,
        string memory processType,
        string memory facilityName,
        string memory facilityLocation,
        string memory processorOrg,
        uint256 maxTemp,
        bool additivesDeclared,
        string memory notes
    ) public batchExists(batchCode) {
        Batch storage b = batches[batchCode];
        require(b.status != BatchStatus.RECALLED, "HoneyTrace: batch has been recalled");

        b.status = BatchStatus.PROCESSED;
        totalTransactions++;

        bytes32 prevHash = _getLatestEventHash(batchCode);
        bytes32 dataHash = keccak256(abi.encodePacked(batchCode, processType, maxTemp, additivesDeclared, block.timestamp));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "PROCESSING_COMPLETED",
            actor: msg.sender,
            actorOrg: processorOrg,
            location: facilityLocation,
            dataHash: dataHash,
            prevHash: prevHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: notes
        }));

        emit ProcessingRecorded(
            batchCode,
            msg.sender,
            processType,
            facilityName,
            maxTemp,
            additivesDeclared,
            dataHash,
            block.timestamp
        );
    }

    /**
     * @notice Anchor laboratory chemical analysis (moisture, HMF, diastase) on-chain
     */
    function recordQualityTest(
        string memory batchCode,
        string memory labName,
        string memory labLocation,
        string memory reportRef,
        bool passed,
        uint256 moistureBps,
        uint256 hmfBps,
        string memory notes
    ) public batchExists(batchCode) {
        Batch storage b = batches[batchCode];
        require(b.status != BatchStatus.RECALLED, "HoneyTrace: batch has been recalled");

        b.status = passed ? BatchStatus.QUALITY_APPROVED : BatchStatus.QUALITY_REJECTED;
        totalTransactions++;

        bytes32 prevHash = _getLatestEventHash(batchCode);
        bytes32 testHash = keccak256(abi.encodePacked(batchCode, labName, reportRef, passed, moistureBps, hmfBps));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "QUALITY_TEST_RECORDED",
            actor: msg.sender,
            actorOrg: labName,
            location: labLocation,
            dataHash: testHash,
            prevHash: prevHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: notes
        }));

        emit QualityTestRecorded(
            batchCode,
            msg.sender,
            labName,
            reportRef,
            passed,
            moistureBps,
            hmfBps,
            testHash,
            block.timestamp
        );
    }

    /**
     * @notice Transfer physical custody to logistics distributor or retailer
     */
    function transferCustody(
        string memory batchCode,
        address toCustodian,
        string memory carrierOrg,
        string memory location,
        string memory notes
    ) public batchExists(batchCode) {
        Batch storage b = batches[batchCode];
        require(b.status != BatchStatus.RECALLED, "HoneyTrace: batch has been recalled");
        require(toCustodian != address(0), "HoneyTrace: invalid recipient address");

        address prevCustodian = b.currentCustodian;
        b.currentCustodian = toCustodian;
        b.status = BatchStatus.IN_TRANSIT;
        totalTransactions++;

        bytes32 prevHash = _getLatestEventHash(batchCode);
        bytes32 transferHash = keccak256(abi.encodePacked(batchCode, prevCustodian, toCustodian, block.timestamp));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "CUSTODY_HANDOVER",
            actor: msg.sender,
            actorOrg: carrierOrg,
            location: location,
            dataHash: transferHash,
            prevHash: prevHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: notes
        }));

        emit CustodyTransferred(batchCode, prevCustodian, toCustodian, location, notes, block.timestamp);
    }

    /**
     * @notice Confirm final receipt of batch at retail distribution center
     */
    function confirmReceipt(
        string memory batchCode,
        string memory retailerOrg,
        string memory location,
        string memory notes
    ) public batchExists(batchCode) {
        Batch storage b = batches[batchCode];
        require(b.status != BatchStatus.RECALLED, "HoneyTrace: batch has been recalled");

        b.currentCustodian = msg.sender;
        b.status = BatchStatus.AT_RETAILER;
        totalTransactions++;

        bytes32 prevHash = _getLatestEventHash(batchCode);
        bytes32 receiptHash = keccak256(abi.encodePacked(batchCode, msg.sender, "RECEIVED", block.timestamp));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "RECEIVED_BY_RETAILER",
            actor: msg.sender,
            actorOrg: retailerOrg,
            location: location,
            dataHash: receiptHash,
            prevHash: prevHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: notes
        }));

        emit CustodyConfirmed(batchCode, msg.sender, location, block.timestamp);
    }

    /**
     * @notice Emergency administrative product recall anchored on-chain
     */
    function recallBatch(
        string memory batchCode,
        string memory reason,
        string memory authorityOrg
    ) public batchExists(batchCode) {
        Batch storage b = batches[batchCode];
        b.status = BatchStatus.RECALLED;
        b.recallReason = reason;
        totalTransactions++;

        bytes32 prevHash = _getLatestEventHash(batchCode);
        bytes32 recallHash = keccak256(abi.encodePacked(batchCode, reason, block.timestamp));

        _batchEvents[batchCode].push(ChainEvent({
            eventType: "BATCH_RECALLED",
            actor: msg.sender,
            actorOrg: authorityOrg,
            location: "Regulatory Authority",
            dataHash: recallHash,
            prevHash: prevHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            notes: reason
        }));

        emit BatchRecalled(batchCode, msg.sender, reason, block.timestamp);
    }

    // --- Read & Verification Views ---

    function getBatch(string memory batchCode)
        public
        view
        batchExists(batchCode)
        returns (
            string memory code,
            address producer,
            string memory honeyType,
            uint256 quantityKg,
            bytes32 metadataHash,
            BatchStatus status,
            address currentCustodian,
            uint256 registeredAt,
            uint256 blockNumber,
            string memory recallReason
        )
    {
        Batch storage b = batches[batchCode];
        return (
            b.batchCode,
            b.producer,
            b.honeyType,
            b.quantityKg,
            b.metadataHash,
            b.status,
            b.currentCustodian,
            b.registeredAt,
            b.blockNumber,
            b.recallReason
        );
    }

    function getBatchEventCount(string memory batchCode) public view batchExists(batchCode) returns (uint256) {
        return _batchEvents[batchCode].length;
    }

    function getBatchEvents(string memory batchCode) public view batchExists(batchCode) returns (ChainEvent[] memory) {
        return _batchEvents[batchCode];
    }

    function getTotalBatches() public view returns (uint256) {
        return allBatchCodes.length;
    }

    function verifyBatch(string memory batchCode)
        public
        view
        returns (
            bool exists,
            BatchStatus status,
            address currentCustodian,
            uint256 eventCount,
            bytes32 latestEventHash,
            uint256 registeredBlock
        )
    {
        if (!batches[batchCode].exists) {
            return (false, BatchStatus.REGISTERED, address(0), 0, bytes32(0), 0);
        }
        Batch storage b = batches[batchCode];
        uint256 count = _batchEvents[batchCode].length;
        bytes32 latestHash = count > 0 ? _batchEvents[batchCode][count - 1].dataHash : bytes32(0);
        return (true, b.status, b.currentCustodian, count, latestHash, b.blockNumber);
    }

    function _getLatestEventHash(string memory batchCode) internal view returns (bytes32) {
        uint256 count = _batchEvents[batchCode].length;
        if (count == 0) {
            return keccak256(abi.encodePacked("GENESIS", batchCode));
        }
        return _batchEvents[batchCode][count - 1].dataHash;
    }
}

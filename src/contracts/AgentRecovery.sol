pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AgentRecovery is AccessControl {
    struct RecoveryPackage {
        address beneficiary;
        uint256 unlockTimestamp;
        bytes32 configHash;
    }
    
    mapping(uint256 => RecoveryPackage) public recoveryPackages;
    uint256 public recoveryLockDuration = 30 days;
    
    event RecoveryInitiated(uint256 indexed agentId, uint256 unlockTime);
    event RecoveryExecuted(uint256 indexed agentId, address indexed beneficiary);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function initiateRecovery(uint256 agentId, bytes32 configHash) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || 
            msg.sender == ownerOf(agentId),
            "Unauthorized"
        );
        
        recoveryPackages[agentId] = RecoveryPackage({
            beneficiary: msg.sender,
            unlockTimestamp: block.timestamp + recoveryLockDuration,
            configHash: configHash
        });
        
        emit RecoveryInitiated(agentId, block.timestamp + recoveryLockDuration);
    }
    
    function executeRecovery(uint256 agentId) external {
        RecoveryPackage memory pkg = recoveryPackages[agentId];
        require(block.timestamp >= pkg.unlockTimestamp, "Lock active");
        require(msg.sender == pkg.beneficiary, "Not beneficiary");
        
        // Perform recovery logic
        emit RecoveryExecuted(agentId, msg.sender);
        delete recoveryPackages[agentId];
    }
} 
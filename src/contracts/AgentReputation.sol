pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AgentReputation is AccessControl {
    struct Reputation {
        uint256 score;
        uint256 lastUpdated;
        uint256 successfulTasks;
        uint256 failedTasks;
    }
    
    mapping(address => Reputation) public operatorReputation;
    mapping(uint256 => Reputation) public agentReputation;
    
    event ReputationUpdated(
        address indexed operator,
        uint256 indexed agentId,
        int256 delta
    );
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function updateAgentReputation(
        uint256 agentId,
        bool taskSuccess,
        uint256 complexity
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Reputation storage rep = agentReputation[agentId];
        rep.score = taskSuccess ? 
            rep.score + (complexity * 10) :
            rep.score > complexity ? rep.score - complexity : 0;
            
        rep.successfulTasks += taskSuccess ? 1 : 0;
        rep.failedTasks += taskSuccess ? 0 : 1;
        rep.lastUpdated = block.timestamp;
    }
    
    function getAgentTrustScore(uint256 agentId) external view returns(uint256) {
        return agentReputation[agentId].score;
    }
} 
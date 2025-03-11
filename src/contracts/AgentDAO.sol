pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";

contract AgentDAO is Governor, GovernorSettings {
    constructor()
        Governor("AgentDAO")
        GovernorSettings(
            1, /* 1 block */
            45818, /* 1 week */
            0
        )
    {}
    
    function votingDelay() public view override returns (uint256) {
        return 1;
    }
    
    function votingPeriod() public view override returns (uint256) {
        return 45818;
    }
    
    // Custom DAO logic for agent governance
    function proposeAgentUpgrade(
        uint256 agentId, 
        string memory newConfigHash
    ) public returns (uint256) {
        return propose(
            new address[](0),
            new uint256[](0),
            new bytes[](0),
            string(abi.encodePacked("Upgrade Agent ", agentId, " to ", newConfigHash))
        );
    }
    
    // Implement custom voting power based on token holdings
    function _getVotes(
        address account,
        uint256 blockNumber,
        bytes memory /*params*/
    ) internal view override returns (uint256) {
        return IERC721(agentNFTAddress).balanceOf(account);
    }
} 
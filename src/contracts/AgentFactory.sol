pragma solidity ^0.8.0;

import "./AgentNFT.sol";
import "./AgentDAO.sol";

contract AgentFactory {
    AgentNFT public nftContract;
    AgentDAO public daoContract;
    
    struct DeploymentConfig {
        address owner;
        string containerSpec;
        uint256 stakeAmount;
    }
    
    mapping(uint256 => DeploymentConfig) public agentDeployments;
    
    event AgentDeployed(uint256 indexed tokenId, address indexed owner);
    event AgentUpgraded(uint256 indexed tokenId, string newConfigHash);
    
    constructor(address _nftAddress, address _daoAddress) {
        nftContract = AgentNFT(_nftAddress);
        daoContract = AgentDAO(_daoAddress);
    }
    
    function deployAgent(
        uint256 tokenId,
        string memory containerSpec,
        uint256 stakeAmount
    ) external payable {
        require(msg.value >= stakeAmount, "Insufficient stake");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not agent owner");
        
        agentDeployments[tokenId] = DeploymentConfig({
            owner: msg.sender,
            containerSpec: containerSpec,
            stakeAmount: stakeAmount
        });
        
        emit AgentDeployed(tokenId, msg.sender);
    }
    
    function proposeUpgrade(
        uint256 tokenId,
        string memory newConfigHash
    ) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not agent owner");
        daoContract.proposeAgentUpgrade(tokenId, newConfigHash);
    }
} 
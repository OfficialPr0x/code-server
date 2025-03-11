// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AgentNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _tokenIdCounter;
    
    struct AgentMetadata {
        string configHash;
        address creator;
        uint256 creationDate;
        uint256 lastUpdated;
    }
    
    mapping(uint256 => AgentMetadata) public agentData;
    
    constructor() ERC721("AIWarroomAgent", "AIWA") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }
    
    function mintAgent(address to, string memory configHash) 
        public 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        agentData[tokenId] = AgentMetadata({
            configHash: configHash,
            creator: msg.sender,
            creationDate: block.timestamp,
            lastUpdated: block.timestamp
        });
        return tokenId;
    }
    
    function updateAgent(uint256 tokenId, string memory newConfigHash) 
        public 
        onlyRole(MINTER_ROLE) 
    {
        require(_exists(tokenId), "Agent does not exist");
        agentData[tokenId].configHash = newConfigHash;
        agentData[tokenId].lastUpdated = block.timestamp;
    }
    
    // Additional functions for DAO integration, transfers, and upgrades
} 
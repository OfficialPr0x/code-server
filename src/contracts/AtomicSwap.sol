pragma solidity ^0.8.0;

contract AtomicSwap {
    struct Swap {
        address initiator;
        address participant;
        uint256 initiatorChain;
        uint256 participantChain;
        bytes32 secretHash;
        uint256 timeout;
        uint256 agentId;
        bool completed;
    }
    
    mapping(bytes32 => Swap) public swaps;
    
    event SwapInitiated(
        bytes32 indexed swapId,
        uint256 agentId,
        uint256 initiatorChain,
        uint256 participantChain
    );
    
    event SwapCompleted(bytes32 indexed swapId);
    event SwapCanceled(bytes32 indexed swapId);

    function initiateSwap(
        address participant,
        uint256 participantChain,
        uint256 agentId,
        bytes32 secretHash,
        uint256 timeout
    ) external payable {
        bytes32 swapId = keccak256(abi.encodePacked(
            msg.sender, participant, block.chainid, participantChain, agentId
        ));
        
        swaps[swapId] = Swap({
            initiator: msg.sender,
            participant: participant,
            initiatorChain: block.chainid,
            participantChain: participantChain,
            secretHash: secretHash,
            timeout: block.timestamp + timeout,
            agentId: agentId,
            completed: false
        });
        
        emit SwapInitiated(swapId, agentId, block.chainid, participantChain);
    }

    function completeSwap(bytes32 swapId, bytes32 secret) external {
        Swap storage swap = swaps[swapId];
        require(sha256(abi.encodePacked(secret)) == swap.secretHash, "Invalid secret");
        require(block.timestamp < swap.timeout, "Swap expired");
        
        // Cross-chain transfer logic
        swap.completed = true;
        emit SwapCompleted(swapId);
    }

    function cancelSwap(bytes32 swapId) external {
        Swap storage swap = swaps[swapId];
        require(block.timestamp >= swap.timeout, "Swap not expired");
        require(msg.sender == swap.initiator, "Not initiator");
        
        // Return funds logic
        delete swaps[swapId];
        emit SwapCanceled(swapId);
    }
} 
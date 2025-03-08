pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrossChainLiquidityPool is ReentrancyGuard {
    struct PoolConfig {
        IERC20 token;
        uint256 chainId;
        uint256 totalLiquidity;
        uint256 commissionRate;
    }
    
    mapping(uint256 => PoolConfig) public chainPools;
    address public bridgeOracle;
    
    event LiquidityProvided(uint256 chainId, address provider, uint256 amount);
    event CrossChainSwap(
        uint256 fromChain,
        uint256 toChain,
        address trader,
        uint256 amount
    );
    
    constructor(address _oracle) {
        bridgeOracle = _oracle;
    }
    
    function provideLiquidity(uint256 chainId, uint256 amount) external nonReentrant {
        PoolConfig storage pool = chainPools[chainId];
        require(address(pool.token) != address(0), "Invalid chain");
        
        pool.token.transferFrom(msg.sender, address(this), amount);
        pool.totalLiquidity += amount;
        
        emit LiquidityProvided(chainId, msg.sender, amount);
    }
    
    function executeSwap(
        uint256 fromChain,
        uint256 toChain,
        uint256 amount,
        bytes calldata oracleSignature
    ) external nonReentrant {
        require(verifyOracleSignature(fromChain, toChain, amount, oracleSignature), "Invalid swap");
        
        PoolConfig storage sourcePool = chainPools[fromChain];
        PoolConfig storage destPool = chainPools[toChain];
        
        uint256 commission = amount * sourcePool.commissionRate / 10000;
        uint256 receivedAmount = amount - commission;
        
        sourcePool.token.transfer(msg.sender, receivedAmount);
        destPool.totalLiquidity -= receivedAmount;
        
        emit CrossChainSwap(fromChain, toChain, msg.sender, amount);
    }
    
    function verifyOracleSignature(
        uint256 fromChain,
        uint256 toChain,
        uint256 amount,
        bytes memory signature
    ) internal view returns(bool) {
        bytes32 hash = keccak256(abi.encodePacked(fromChain, toChain, amount));
        return SignatureChecker.isValidSignatureNow(bridgeOracle, hash, signature);
    }
} 
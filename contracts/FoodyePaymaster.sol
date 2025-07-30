// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IEntryPoint {
    function handleOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external;
    
    function balanceOf(address account) external view returns (uint256);
    
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external;
}

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

/**
 * @title FoodyePaymaster
 * @dev ERC-4337 Paymaster that accepts Foodye Coin as payment for gas fees
 */
contract FoodyePaymaster is Ownable, ReentrancyGuard {
    IEntryPoint public immutable entryPoint;
    IERC20 public immutable foodyeToken;
    
    // Exchange rate: 1 ETH = X FOODYE tokens
    // Based on 1 FOODYE = 0.0001 USDC, 1 ETH ≈ 2500 USDC
    uint256 public exchangeRate = 25000000; // 1 ETH = 25M FOODYE (adjustable)
    
    // Minimum gas sponsorship amount in ETH
    uint256 public constant MIN_GAS_AMOUNT = 0.001 ether;
    
    // Events
    event PaymasterDeposit(address indexed account, uint256 amount);
    event PaymasterWithdraw(address indexed account, uint256 amount);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event GasPayment(address indexed user, uint256 foodyeAmount, uint256 gasAmount);
    
    // Errors
    error InsufficientFoodyeBalance();
    error InsufficientAllowance();
    error InvalidExchangeRate();
    error TransferFailed();
    
    modifier onlyEntryPoint() {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        _;
    }
    
    constructor(
        IEntryPoint _entryPoint,
        IERC20 _foodyeToken,
        address _owner
    ) {
        entryPoint = _entryPoint;
        foodyeToken = _foodyeToken;
        _transferOwnership(_owner);
    }
    
    /**
     * @dev Validate and pay for a user operation using Foodye tokens
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 maxCost
    ) external onlyEntryPoint returns (bytes memory context, uint256 validationData) {
        address user = userOp.sender;
        
        // Calculate required Foodye tokens
        uint256 requiredFoodyeAmount = (maxCost * exchangeRate) / 1 ether;
        
        // Check user's Foodye balance
        if (foodyeToken.balanceOf(user) < requiredFoodyeAmount) {
            revert InsufficientFoodyeBalance();
        }
        
        // Check allowance
        if (foodyeToken.allowance(user, address(this)) < requiredFoodyeAmount) {
            revert InsufficientAllowance();
        }
        
        // Return context for post-op
        context = abi.encode(user, requiredFoodyeAmount, maxCost);
        validationData = 0; // Success
    }
    
    /**
     * @dev Post-operation: collect Foodye tokens from user
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external onlyEntryPoint nonReentrant {
        if (mode == PostOpMode.opSucceeded || mode == PostOpMode.opReverted) {
            (address user, uint256 maxFoodyeAmount, uint256 maxCost) = abi.decode(
                context,
                (address, uint256, uint256)
            );
            
            // Calculate actual Foodye amount needed
            uint256 actualFoodyeAmount = (actualGasCost * exchangeRate) / 1 ether;
            
            // Don't charge more than the max
            if (actualFoodyeAmount > maxFoodyeAmount) {
                actualFoodyeAmount = maxFoodyeAmount;
            }
            
            // Transfer Foodye tokens from user
            bool success = foodyeToken.transferFrom(user, address(this), actualFoodyeAmount);
            if (!success) {
                revert TransferFailed();
            }
            
            emit GasPayment(user, actualFoodyeAmount, actualGasCost);
        }
    }
    
    /**
     * @dev Get required Foodye amount for gas cost estimate
     */
    function getRequiredFoodyeAmount(uint256 gasCostInWei) external view returns (uint256) {
        return (gasCostInWei * exchangeRate) / 1 ether;
    }
    
    /**
     * @dev Update exchange rate (owner only)
     */
    function updateExchangeRate(uint256 _newRate) external onlyOwner {
        if (_newRate == 0) revert InvalidExchangeRate();
        
        uint256 oldRate = exchangeRate;
        exchangeRate = _newRate;
        
        emit ExchangeRateUpdated(oldRate, _newRate);
    }
    
    /**
     * @dev Deposit ETH to sponsor gas (owner only)
     */
    function deposit() external payable onlyOwner {
        (bool success, ) = payable(address(entryPoint)).call{value: msg.value}("");
        require(success, "Deposit failed");
        
        emit PaymasterDeposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw ETH from EntryPoint (owner only)
     */
    function withdrawTo(address payable _to, uint256 _amount) external onlyOwner {
        entryPoint.withdrawTo(_to, _amount);
        
        emit PaymasterWithdraw(_to, _amount);
    }
    
    /**
     * @dev Withdraw collected Foodye tokens (owner only)
     */
    function withdrawFoodye(address _to, uint256 _amount) external onlyOwner {
        bool success = foodyeToken.transfer(_to, _amount);
        if (!success) revert TransferFailed();
    }
    
    /**
     * @dev Get Paymaster's balance in EntryPoint
     */
    function getDeposit() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }
    
    receive() external payable {
        // Allow ETH deposits
    }
}

enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
}

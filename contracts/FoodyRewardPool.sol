// contracts/FoodyRewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FoodyRewardPool
 * @dev 管理 FOODY 代币奖励发放的智能合约
 */
contract FoodyRewardPool is Ownable, ReentrancyGuard {
    IERC20 public immutable foodyToken;
    
    // 奖励配置
    uint256 public dinerRegistrationReward = 1000 * 10**18; // 1000 FOODY
    uint256 public maxRewardsPerDay = 10000 * 10**18; // 每日最大发放量
    uint256 public totalRewardsDistributed;
    uint256 public dailyRewardsDistributed;
    uint256 public lastResetDay;
    
    // 已领取奖励的地址
    mapping(address => bool) public hasClaimedDinerReward;
    mapping(address => uint256) public lastClaimTime;
    
    // 授权的发放者（后端 API）
    mapping(address => bool) public authorizedDistributors;
    
    // 事件
    event DinerRewardDistributed(address indexed recipient, uint256 amount, uint256 timestamp);
    event RewardConfigUpdated(uint256 newDinerReward, uint256 newDailyLimit);
    event DistributorUpdated(address indexed distributor, bool authorized);
    event TokensDeposited(uint256 amount);
    event TokensWithdrawn(uint256 amount);
    
    constructor(address _foodyToken, address _initialOwner) Ownable(_initialOwner) {
        foodyToken = IERC20(_foodyToken);
        lastResetDay = block.timestamp / 1 days;
    }
    
    modifier onlyAuthorized() {
        require(authorizedDistributors[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev 重置每日发放计数器
     */
    function _resetDailyCounterIfNeeded() internal {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            dailyRewardsDistributed = 0;
            lastResetDay = currentDay;
        }
    }
    
    /**
     * @dev 为新注册的 Diner 发放奖励
     */
    function distributeDinerReward(address recipient) external onlyAuthorized nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(!hasClaimedDinerReward[recipient], "Already claimed diner reward");
        
        _resetDailyCounterIfNeeded();
        
        require(
            dailyRewardsDistributed + dinerRegistrationReward <= maxRewardsPerDay,
            "Daily reward limit exceeded"
        );
        
        require(
            foodyToken.balanceOf(address(this)) >= dinerRegistrationReward,
            "Insufficient reward pool balance"
        );
        
        // 标记已领取
        hasClaimedDinerReward[recipient] = true;
        lastClaimTime[recipient] = block.timestamp;
        
        // 更新统计
        totalRewardsDistributed += dinerRegistrationReward;
        dailyRewardsDistributed += dinerRegistrationReward;
        
        // 发放代币
        require(
            foodyToken.transfer(recipient, dinerRegistrationReward),
            "Token transfer failed"
        );
        
        emit DinerRewardDistributed(recipient, dinerRegistrationReward, block.timestamp);
    }
    
    /**
     * @dev 批量发放奖励（气体优化）
     */
    function batchDistributeDinerRewards(address[] calldata recipients) external onlyAuthorized nonReentrant {
        require(recipients.length > 0, "Empty recipients list");
        require(recipients.length <= 50, "Too many recipients"); // 防止气体耗尽
        
        _resetDailyCounterIfNeeded();
        
        uint256 totalAmount = dinerRegistrationReward * recipients.length;
        
        require(
            dailyRewardsDistributed + totalAmount <= maxRewardsPerDay,
            "Daily reward limit exceeded"
        );
        
        require(
            foodyToken.balanceOf(address(this)) >= totalAmount,
            "Insufficient reward pool balance"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            require(recipient != address(0), "Invalid recipient");
            require(!hasClaimedDinerReward[recipient], "Recipient already claimed");
            
            hasClaimedDinerReward[recipient] = true;
            lastClaimTime[recipient] = block.timestamp;
            
            require(
                foodyToken.transfer(recipient, dinerRegistrationReward),
                "Token transfer failed"
            );
            
            emit DinerRewardDistributed(recipient, dinerRegistrationReward, block.timestamp);
        }
        
        totalRewardsDistributed += totalAmount;
        dailyRewardsDistributed += totalAmount;
    }
    
    /**
     * @dev 检查地址是否已领取奖励
     */
    function hasClaimedReward(address account) external view returns (bool) {
        return hasClaimedDinerReward[account];
    }
    
    /**
     * @dev 获取合约状态信息
     */
    function getContractInfo() external view returns (
        uint256 poolBalance,
        uint256 totalDistributed,
        uint256 dailyDistributed,
        uint256 dailyLimit,
        uint256 dinerReward
    ) {
        return (
            foodyToken.balanceOf(address(this)),
            totalRewardsDistributed,
            dailyRewardsDistributed,
            maxRewardsPerDay,
            dinerRegistrationReward
        );
    }
    
    // === 管理员功能 ===
    
    /**
     * @dev 设置奖励配置
     */
    function setRewardConfig(uint256 _dinerReward, uint256 _dailyLimit) external onlyOwner {
        dinerRegistrationReward = _dinerReward;
        maxRewardsPerDay = _dailyLimit;
        emit RewardConfigUpdated(_dinerReward, _dailyLimit);
    }
    
    /**
     * @dev 添加或移除授权发放者
     */
    function setDistributorAuthorization(address distributor, bool authorized) external onlyOwner {
        authorizedDistributors[distributor] = authorized;
        emit DistributorUpdated(distributor, authorized);
    }
    
    /**
     * @dev 向奖励池存入代币
     */
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            foodyToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        emit TokensDeposited(amount);
    }
    
    /**
     * @dev 紧急提取代币（仅所有者）
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= foodyToken.balanceOf(address(this)), "Insufficient balance");
        require(foodyToken.transfer(owner(), amount), "Token transfer failed");
        emit TokensWithdrawn(amount);
    }
    
    /**
     * @dev 暂停/恢复奖励发放
     */
    bool public rewardsPaused = false;
    
    function pauseRewards() external onlyOwner {
        rewardsPaused = true;
    }
    
    function resumeRewards() external onlyOwner {
        rewardsPaused = false;
    }
    
    modifier whenNotPaused() {
        require(!rewardsPaused, "Rewards are paused");
        _;
    }
}

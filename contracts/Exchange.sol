// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Exchange
 * @dev This contract is a simplified clone of Uniswap V1's exchange.
 * It facilitates swaps between ETH and a single ERC20 token.
 * It also allows users to provide and remove liquidity.
 */
contract Exchange is IERC20 {
    address public tokenAddress;

    // --- ERC20 State Variables ---
    string public name = "FoodySwap LP Token";
    string public symbol = "FDY-LP";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // --- Events ---
    event TokenPurchase(address indexed buyer, uint256 eth_sold, uint256 tokens_bought);
    event EthPurchase(address indexed buyer, uint256 tokens_sold, uint256 eth_bought);
    event AddLiquidity(address indexed provider, uint256 eth_amount, uint256 token_amount);
    event RemoveLiquidity(address indexed provider, uint256 eth_amount, uint256 token_amount);

    constructor(address _token) {
        require(_token != address(0), "Token address cannot be zero");
        tokenAddress = _token;
    }

    /**
     * @dev Returns the amount of ETH in the contract.
     */
    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Returns the amount of the ERC20 token in the contract.
     */
    function getTokenBalance() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    /**
     * @dev Adds liquidity to the exchange.
     * The first liquidity provider sets the initial exchange rate.
     * All subsequent providers must add liquidity at the current exchange rate.
     */
    function addLiquidity() public payable returns (uint256) {
        require(msg.value > 0, "Must send ETH to add liquidity");
        uint256 tokenAmount = IERC20(tokenAddress).balanceOf(address(this));
        
        if (tokenAmount == 0) {
            // This is the first liquidity provider.
            // The amount of LP tokens minted is equal to the amount of ETH sent.
            uint256 liquidity = getEthBalance();
            totalSupply += liquidity;
            balanceOf[msg.sender] += liquidity;
            
            // Transfer tokens from the user to this contract
            uint256 tokensToTransfer = msg.value; // Example: 1 ETH = 1 LP token, and we can set initial token amount
            require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensToTransfer), "Token transfer failed");

            emit AddLiquidity(msg.sender, msg.value, tokensToTransfer);
            return liquidity;
        } else {
            // Subsequent liquidity provider.
            uint256 ethReserve = getEthBalance() - msg.value;
            uint256 tokenReserve = getTokenBalance();
            uint256 tokenAmountToAdd = (msg.value * tokenReserve) / ethReserve;
            
            require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmountToAdd), "Token transfer failed");

            uint256 liquidityMinted = (totalSupply * msg.value) / ethReserve;
            totalSupply += liquidityMinted;
            balanceOf[msg.sender] += liquidityMinted;

            emit AddLiquidity(msg.sender, msg.value, tokenAmountToAdd);
            return liquidityMinted;
        }
    }

    /**
     * @dev Removes liquidity from the exchange.
     */
    function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
        require(_amount > 0, "Amount must be greater than zero");
        uint256 ethReserve = getEthBalance();
        uint256 tokenReserve = getTokenBalance();
        
        uint256 ethToReturn = (ethReserve * _amount) / totalSupply;
        uint256 tokenToReturn = (tokenReserve * _amount) / totalSupply;

        totalSupply -= _amount;
        balanceOf[msg.sender] -= _amount;

        (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
        require(success, "ETH transfer failed");
        require(IERC20(tokenAddress).transfer(msg.sender, tokenToReturn), "Token transfer failed");

        emit RemoveLiquidity(msg.sender, ethToReturn, tokenToReturn);
        return (ethToReturn, tokenToReturn);
    }

    /**
     * @dev Swaps ETH for the ERC20 token.
     */
    function ethToTokenSwap() public payable {
        require(msg.value > 0, "Must send ETH to swap");
        uint256 ethSold = msg.value;
        uint256 tokenReserve = getTokenBalance();
        uint256 ethReserve = getEthBalance() - ethSold;

        // The constant product formula with fees
        uint256 numerator = ethSold * tokenReserve * 997;
        uint256 denominator = (ethReserve * 1000) + (ethSold * 997);
        uint256 tokensBought = numerator / denominator;

        require(IERC20(tokenAddress).transfer(msg.sender, tokensBought), "Token transfer failed");
        emit TokenPurchase(msg.sender, ethSold, tokensBought);
    }

    /**
     * @dev Swaps the ERC20 token for ETH.
     */
    function tokenToEthSwap(uint256 _tokensSold) public {
        require(_tokensSold > 0, "Must sell at least some tokens");
        uint256 tokenReserve = getTokenBalance();
        require(_tokensSold <= tokenReserve, "Not enough tokens in reserve");

        uint256 ethReserve = getEthBalance();
        
        // The constant product formula with fees
        uint256 numerator = _tokensSold * ethReserve * 997;
        uint256 denominator = (tokenReserve * 1000) + (_tokensSold * 997);
        uint256 ethBought = numerator / denominator;

        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokensSold), "Token transfer failed");
        (bool success, ) = payable(msg.sender).call{value: ethBought}("");
        require(success, "ETH transfer failed");

        emit EthPurchase(msg.sender, _tokensSold, ethBought);
    }

    // --- Unimplemented ERC20 functions ---
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }
}

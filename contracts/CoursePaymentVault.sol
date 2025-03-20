// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Import the interface for ERC-20 tokens (USDC is an ERC-20 token)
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
contract CoursePaymentVault {
    address public adminWallet;
    IERC20 public usdcToken;
    
    event Paid(address indexed user, string courseId, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == adminWallet, "Not the admin");
        _;
    }

    constructor(address _usdcToken, address _adminWallet) {
        adminWallet = _adminWallet;
        usdcToken = IERC20(_usdcToken);
    }

    function pay(string memory courseId, uint256 amount) external {
        require(amount > 0, "Invalid amount");

        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        
        emit Paid(msg.sender, courseId, amount);
    }

    function withdraw() external onlyAdmin() {
        uint256 contractBalance = usdcToken.balanceOf(address(this));
        require(contractBalance > 0, "There is no fund to withdraw");

        bool success = usdcToken.transfer(msg.sender, contractBalance);
        require(success, "Withdrawal failed");

        emit Withdrawn(msg.sender, contractBalance);
    }

    // Function to check the contract's USDC balance
    function balance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}

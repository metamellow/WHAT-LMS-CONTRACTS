// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract CoursePaymentVault is
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using ECDSAUpgradeable for bytes32;
    using AddressUpgradeable for address;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20Upgradeable public usdc;
    mapping(string => bool) public isTxIdUsed;
    mapping(address => bool) private isUserProcessing;

    event Deposit(address indexed token, address indexed user, uint256 amount);
    event Withdraw(string txId, address indexed user, uint256 amount);
    event Paid(address indexed user, string courseId, uint256 amount);
    event Execute(address indexed owner, uint256 amount);

    function initialize(address _usdc) public initializer {
        __Ownable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        usdc = IERC20Upgradeable(_usdc);
    }

    function pay(string memory courseId, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        IERC20Upgradeable(usdc).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        emit Paid(msg.sender, courseId, amount);
    }

    function withdraw(
        string memory _txId,
        uint256 _amount,
        uint256 _deadline,
        bytes memory _signature
    ) external nonReentrant {
        require(!msg.sender.isContract(), "ONLY_EOA");
        require(_amount > 0, " INVALID_AMOUNT");
        require(block.timestamp <= _deadline, " EXPIRED_DEADLINE");
        require(!isTxIdUsed[_txId], " INVALID_TXID");
        require(!isUserProcessing[msg.sender], " USER_PROCESS");
        isUserProcessing[msg.sender] = true;
        bytes32 message = keccak256(
            abi.encodePacked(_txId, msg.sender, _amount, _deadline)
        );
        address signer = ECDSAUpgradeable.recover(
            message.toEthSignedMessageHash(),
            _signature
        );
        require(hasRole(ADMIN_ROLE, signer), " INVALID_SIGNATURE");

        isTxIdUsed[_txId] = true;
        IERC20Upgradeable(usdc).safeTransfer(msg.sender, _amount);
        isUserProcessing[msg.sender] = false;
        emit Withdraw(_txId, msg.sender, _amount);
    }

    function execute() external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to execute");

        IERC20Upgradeable(usdc).safeTransfer(msg.sender, balance);
        emit Execute(owner(), balance);
    }

    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}

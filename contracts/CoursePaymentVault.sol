// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract CoursePaymentVault is
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using ECDSAUpgradeable for bytes32;
    using AddressUpgradeable for address;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20Upgradeable public usdc;
    mapping(string => bool) public isTxIdUsed;
    mapping(address => bool) public isKol;
    mapping(address => uint256) public nonces;

    struct UserCourseHistory {
        uint256 totalPaid;
        string[] courseIds;
    }
    struct KolEarning {
        uint256 totalEarned;
        uint256 availableToClaim;
    }

    mapping(address => UserCourseHistory) public userCourseHistory;
    mapping(address => mapping(string => uint256)) public userCoursePayments;
    mapping(address => KolEarning) public kolEarnings;
    mapping(address => mapping(string => uint256)) public kolCourseEarnings;

    event Withdraw(
        string txId,
        address indexed user,
        uint256 amount,
        uint256 nonce
    );
    event Paid(address indexed user, string courseId, uint256 amount);
    event Execute(address indexed owner, uint256 amount);

    function initialize(address _usdc) public initializer {
        require(_usdc != address(0), "USDC address is zero");
        __Ownable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        usdc = IERC20Upgradeable(_usdc);
    }

    function pay(
        string memory courseId,
        uint256 amount,
        address kol,
        uint256 kolCommissionRate
    ) external whenNotPaused {
        require(amount > 0, "Invalid amount");
        IERC20Upgradeable(usdc).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        userCourseHistory[msg.sender].totalPaid += amount;
        if (userCoursePayments[msg.sender][courseId] == 0) {
            userCourseHistory[msg.sender].courseIds.push(courseId);
        }
        userCoursePayments[msg.sender][courseId] += amount;

        if (kol != address(0)) {
            isKol[kol] = true;
            uint256 kolEarning = (amount * kolCommissionRate) / 10000;
            kolEarnings[kol].totalEarned += kolEarning;
            kolEarnings[kol].availableToClaim += kolEarning;
            kolCourseEarnings[kol][courseId] += kolEarning;
        }
        emit Paid(msg.sender, courseId, amount);
    }

    function getKolClaimableAmount(
        address kol
    ) external view returns (uint256) {
        return kolEarnings[kol].availableToClaim;
    }

    function getUserCourseHistory(
        address user
    ) external view returns (string[] memory) {
        return userCourseHistory[user].courseIds;
    }

    function withdraw(
        string memory _txId,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) external nonReentrant whenNotPaused {
        require(!msg.sender.isContract(), "ONLY_EOA");
        require(block.timestamp <= _deadline, "EXPIRED_DEADLINE");
        require(!isTxIdUsed[_txId], "INVALID_TXID");
        require(_nonce == nonces[msg.sender], "INVALID_NONCE");
        require(isKol[msg.sender], "NOT_KOL");
        uint256 amountToWithdraw = kolEarnings[msg.sender].availableToClaim;
        require(amountToWithdraw > 0, "NO_KOL_BALANCE");
        bytes32 message = keccak256(
            abi.encodePacked(_txId, msg.sender, _nonce, _deadline)
        );
        address signer = ECDSAUpgradeable.recover(
            message.toEthSignedMessageHash(),
            _signature
        );
        require(hasRole(ADMIN_ROLE, signer), "INVALID_SIGNATURE");
        require(
            usdc.balanceOf(address(this)) >= amountToWithdraw,
            "INSUFFICIENT_CONTRACT_BALANCE"
        );
        IERC20Upgradeable(usdc).safeTransfer(msg.sender, amountToWithdraw);
        isTxIdUsed[_txId] = true;
        kolEarnings[msg.sender].availableToClaim = 0;
        nonces[msg.sender] += 1;
        emit Withdraw(_txId, msg.sender, amountToWithdraw, _nonce);
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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

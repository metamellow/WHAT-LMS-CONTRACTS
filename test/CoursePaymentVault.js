const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoursePaymentVault", function () {
  let CoursePaymentVault, vault, MockUSDC, usdc;
  let owner, admin, user1, user2;
  const initialBalance = ethers.parseUnits("1000", 6); // 1000 USDC
  const courseId = "4b7966cc-c544-42d2-8bac-38de5a1fbae8";
  const paymentAmount = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    [owner, admin, user1, user2] = await ethers.getSigners();

    // Deploy MockUSDC
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // Deploy CoursePaymentVault
    CoursePaymentVault = await ethers.getContractFactory("CoursePaymentVault");
    const usdcAddress = await usdc.getAddress();
    vault = await CoursePaymentVault.deploy(usdcAddress, admin.address);

    // Mint some USDC to user1
    await usdc.mint(user1.address, initialBalance);
    
    // Approve vault to spend user1's USDC
    const vaultAddress = await vault.getAddress();
    await usdc.connect(user1).approve(vaultAddress, initialBalance);
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await vault.adminWallet()).to.equal(admin.address);
    });

    it("Should set the right USDC token address", async function () {
      const usdcAddress = await usdc.getAddress();
      expect(await vault.usdcToken()).to.equal(usdcAddress);
    });
  });

  describe("Payments", function () {
    it("Should allow users to pay for courses", async function () {
      await expect(vault.connect(user1).pay(courseId, paymentAmount))
        .to.emit(vault, "Paid")
        .withArgs(user1.address, courseId, paymentAmount);
      const vaultAddress = await vault.getAddress();
      expect(await usdc.balanceOf(vaultAddress)).to.equal(paymentAmount);
    });

    it("Should revert if payment amount is 0", async function () {
      await expect(vault.connect(user1).pay(courseId, 0)).to.be.revertedWith("Invalid amount");
    });

    it("Should revert if user doesn't have enough USDC", async function () {
      const largeAmount = ethers.parseUnits("2000", 6); // More than initial balance
      await expect(vault.connect(user1).pay(courseId, largeAmount)).to.be.reverted;
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Make a payment first
      await vault.connect(user1).pay(courseId, paymentAmount);
    });

    it("Should allow admin to withdraw funds", async function () {
      await expect(vault.connect(admin).withdraw())
        .to.emit(vault, "Withdrawn")
        .withArgs(admin.address, paymentAmount);

      const vaultAddress = await vault.getAddress();
      expect(await usdc.balanceOf(vaultAddress)).to.equal(0);
      expect(await usdc.balanceOf(admin.address)).to.equal(paymentAmount);
    });

    it("Should revert if non-admin tries to withdraw", async function () {
      await expect(vault.connect(user1).withdraw()).to.be.revertedWith("Not the admin");
    });

    it("Should revert if there are no funds to withdraw", async function () {
      await vault.connect(admin).withdraw(); // First withdrawal
      await expect(vault.connect(admin).withdraw()).to.be.revertedWith("There is no fund to withdraw");
    });
  });

  describe("Balance", function () {
    it("Should return the correct balance", async function () {
      expect(await vault.balance()).to.equal(0);

      await vault.connect(user1).pay(courseId, paymentAmount);
      expect(await vault.balance()).to.equal(paymentAmount);

      await vault.connect(admin).withdraw();
      expect(await vault.balance()).to.equal(0);
    });
  });
});
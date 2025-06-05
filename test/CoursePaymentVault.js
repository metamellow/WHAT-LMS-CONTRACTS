const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CoursePaymentVault", function () {
  let CoursePaymentVault, vault, MockUSDC, usdc;
  let owner, user1, user2;
  const initialBalance = ethers.utils.parseUnits("1000", 6); // 1000 USDC
  const courseId = "4b7966cc-c544-42d2-8bac-38de5a1fbae8";
  const paymentAmount = ethers.utils.parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockUSDC
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // Deploy CoursePaymentVault as upgradeable proxy
    CoursePaymentVault = await ethers.getContractFactory("CoursePaymentVault");
    vault = await upgrades.deployProxy(CoursePaymentVault, [usdc.address], {
      initializer: "initialize",
    });

    // Mint some USDC to user1
    await usdc.mint(user1.address, initialBalance);

    // Approve vault to spend user1's USDC
    await usdc.connect(user1).approve(vault.address, initialBalance);
  });

  describe("Deployment", function () {
    it("Should set the right USDC token address", async function () {
      expect(await vault.usdc()).to.equal(usdc.address);
    });
    it("Should set the right owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe("Payments", function () {
    it("Should allow users to pay for courses", async function () {
      await expect(
        vault.connect(user1).pay(courseId, paymentAmount, ethers.constants.AddressZero, 0)
      )
        .to.emit(vault, "Paid")
        .withArgs(user1.address, courseId, paymentAmount);
      expect(await usdc.balanceOf(await vault.address)).to.equal(paymentAmount);
    });

    it("Should revert if payment amount is 0", async function () {
      await expect(
        vault.connect(user1).pay(courseId, 0, ethers.constants.AddressZero, 0)
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should revert if user doesn't have enough USDC", async function () {
      const largeAmount = ethers.utils.parseUnits("2000", 6); // More than initial balance
      await expect(
        vault.connect(user1).pay(courseId, largeAmount, ethers.constants.AddressZero, 0)
      ).to.be.reverted;
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await vault.connect(user1).pay(courseId, paymentAmount, ethers.constants.AddressZero, 0);
    });

    it("Should allow owner to execute and withdraw all funds", async function () {
      const before = await usdc.balanceOf(owner.address);
      await vault.connect(owner).execute();
      const after = await usdc.balanceOf(owner.address);
      expect(after.sub(before)).to.equal(paymentAmount);
    });

    it("Should revert if non-owner tries to execute", async function () {
      await expect(vault.connect(user1).execute()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if there are no funds to execute", async function () {
      await vault.connect(owner).execute(); // First withdrawal
      await expect(vault.connect(owner).execute()).to.be.revertedWith("No funds to execute");
    });
  });

  describe("Balance", function () {
    it("Should return the correct balance", async function () {
      expect(await vault.getBalance()).to.equal(0);

      await vault.connect(user1).pay(courseId, paymentAmount, ethers.constants.AddressZero, 0);
      expect(await vault.getBalance()).to.equal(paymentAmount);

      await vault.connect(owner).execute();
      expect(await vault.getBalance()).to.equal(0);
    });
  });
});
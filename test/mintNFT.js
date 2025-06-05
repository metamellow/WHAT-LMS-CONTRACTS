const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MintNFT", function () {
  let MintNFT, nft, owner, user1;
  const TOKEN_URI = "https://tiki.vn/blog/wp-content/uploads/2023/01/9m2Xzg9ixF3Z4x-D2K_nC8tU9tT8E7ePEJubjx9yKFof4IViwhzO3_mZt2jyfx4qeWgDor1MBfcQpnZkTtpVZIXTF8ibcApfdSoybN2gq5a16A66APTxPRgcT4omIYfBu3pRZfuwyvlbiwlPdCHkf6LpB31_ioh-oC3pAwZAJ6Vro9UkJDDaKN6PfYAgBg.jpg";
  const COURSE_ID = "course-123";

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    MintNFT = await ethers.getContractFactory("MintNFT");
    nft = await MintNFT.deploy();
    await nft.deployed();
  });

  it("Owner can mint NFT for a course", async function () {
    await expect(nft.mint(user1.address, TOKEN_URI, COURSE_ID))
      .to.emit(nft, "NFTMinted")
      .withArgs(user1.address, 1, TOKEN_URI, COURSE_ID);

    expect(await nft.ownerOf(1)).to.equal(user1.address);
    await expect(nft.mint(user1.address, TOKEN_URI, COURSE_ID)).to.be.revertedWith("Already minted for this course");
  });

  it("Should revert if URI is empty", async function () {
    await expect(nft.mint(user1.address, "", COURSE_ID)).to.be.revertedWith("Invalid URI");
  });

  it("Should revert if not owner tries to mint", async function () {
    await expect(nft.connect(user1).mint(user1.address, TOKEN_URI, COURSE_ID)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("ethers");

async function main() {
  const userPrivateKey =
    "0xf3432076119f4914892bd149eb0722f7b63a20bccc05b4294cc758617c3d25f5";
  const provider = new JsonRpcProvider("https://rpc.testnet.fantom.network");
  const user = new ethers.Wallet(userPrivateKey, provider);
  console.log("Signer Address:", user.address);

  const nftAddress = "0x1c8d14fC9506997b54D4a5a23cA1166f6F27d896";
  const nft = await ethers.getContractAt("MintNFT", nftAddress, user);

  const owner = await nft.owner(); // Kiểm tra owner của contract
  console.log("Contract Owner:", owner);

  if (user.address.toLowerCase() !== owner.toLowerCase()) {
    console.error("❌ Signer không phải là owner, không thể mint NFT.");
    return;
  }

  const TOKEN_URI =
    "https://tiki.vn/blog/wp-content/uploads/2023/01/9m2Xzg9ixF3Z4x-D2K_nC8tU9tT8E7ePEJubjx9yKFof4IViwhzO3_mZt2jyfx4qeWgDor1MBfcQpnZkTtpVZIXTF8ibcApfdSoybN2gq5a16A66APTxPRgcT4omIYfBu3pRZfuwyvlbiwlPdCHkf6LpB31_ioh-oC3pAwZAJ6Vro9UkJDDaKN6PfYAgBg.jpg";

  const tx = await nft.mint(user.address, TOKEN_URI);
  await tx.wait();

  console.log(`✅ NFT minted to ${user.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

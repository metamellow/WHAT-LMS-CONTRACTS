const { ethers } = require("ethers");
const { coursePaymentVaultAbi } = require("./abi");

// Setup provider + signer (ví dụ dùng private key)
const provider = new ethers.providers.JsonRpcProvider("https://rpc.testnet.fantom.network");
const privateKey = "71ab6096bd3108823b3417e00479ca670503c080833dba431d741a81cea12a2d";
const wallet = new ethers.Wallet(privateKey, provider);
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
];
const TOKEN_ADDRESS = "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F"; // Địa chỉ token (USDC trên Fantom Testnet)
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
// Địa chỉ contract
const vaultAddress = "0x6F6D49bBcBfBdb41851D9A7754012e56a702a2b1";


const vaultContract = new ethers.Contract(vaultAddress, coursePaymentVaultAbi, wallet);

async function payCourse() {
  const courseId = "course123";
  const amount = ethers.utils.parseUnits("0.01", 18);
  const approveTx = await tokenContract.approve(vaultContract.address, amount);
await approveTx.wait();
    console.log("Approve tx hash:", approveTx.hash);
    
    // Kiểm tra allowance
    const allowance = await tokenContract.allowance(wallet.address, vaultContract.address);
    console.log("Allowance:", ethers.utils.formatUnits(allowance, 18));
    
    // Kiểm tra balance
    const balance = await tokenContract.balanceOf(wallet.address);
    console.log("Balance:", ethers.utils.formatUnits(balance, 18));
    
    // Gọi hàm pay
const estimateGas = await vaultContract.estimateGas.pay(courseId, amount);
  const tx = await vaultContract.pay(courseId, amount, {
    gasLimit: estimateGas.mul(2) // bạn có thể set gasLimit thủ công nếu lỗi estimateGas
  });
  console.log("Pay tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Pay transaction confirmed:", receipt.transactionHash);
}

async function withdrawFunds() {
  const txId = "tx-123";
  const amount = ethers.utils.parseUnits("0.01", 18); // số tiền rút
  const deadline = Math.floor(Date.now() / 1000) + 3600; // ví dụ 1 tiếng nữa
    const messageHash = ethers.utils.solidityKeccak256(
    ["string", "address", "uint256", "uint256"],
    [txId, wallet.address, amount, deadline,]
  );

  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

  const tx = await vaultContract.withdraw(txId, amount, deadline, signature, {
    gasLimit: 200000
  });
  console.log("Withdraw tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Withdraw transaction confirmed:", receipt.transactionHash);
}

    async function getBalance() {

  const balance = await vaultContract.getBalance();
    console.log("Vault balance:", ethers.utils.formatUnits(balance, 18));
    }

    async function execute() {
        await vaultContract.execute();
        console.log("Execute transaction confirmed");
    }

// Chạy thử
(async () => {
//   await getBalance();
  await withdrawFunds();
})();

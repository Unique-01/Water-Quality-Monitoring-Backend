// testContract.js
require("dotenv").config()
const { ethers } = require('ethers');
async function test() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ['function getReadingCount() view returns (uint256)'],
    wallet
  );
  console.log(await contract.getReadingCount());
}
test();
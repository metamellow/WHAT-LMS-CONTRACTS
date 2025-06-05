rm -rf .openzeppelin
rm -rf artifacts
rm -rf cache
rm -rf deployments

npx hardhat compile
npx hardhat run deploy/mintnft.js --network fantomTestnet
npx hardhat run deploy/coursepaymentvault.js --network fantomTestnet

# npx hardhat run scripts/upgrade_coursepaymentvault.js --network fantomTestnet
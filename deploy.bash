rm -rf .openzeppelin
rm -rf artifacts
rm -rf cache
rm -rf deployments

npx hardhat compile
npx hardhat run --no-compile  deploy/mintnft.js --network fantomTestnet
npx hardhat run --no-compile  deploy/coursepaymentvault.js --network fantomTestnet

# npx hardhat run scripts/upgrade_coursepaymentvault.js --network fantomTestnet
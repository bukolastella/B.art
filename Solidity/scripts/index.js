const { ethers } = require("hardhat");
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  const NFTsContract = await ethers.getContractFactory("NFTs");
  const deployedNFTs = await NFTsContract.deploy(
    METADATA_URL,
    WHITELIST_CONTRACT_ADDRESS
  );
  await deployedNFTs.deployed();
  console.log("successfully deployed nft contract", deployedNFTs.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

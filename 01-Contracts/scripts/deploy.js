// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const {
  Geocache1155,
  Geocache1155__factory,
  Geocache,
  Geocache__factory
 } = require('../typechain-types');
 require('dotenv').config();
 const fs = require("fs");


// import { expect } from 'chai';
const { ethers } = require("hardhat");
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

async function main() {
  // console.log(process.env.GOERLI_ALCHEMY_KEY)

      const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.GOERLI_ALCHEMY_KEY
      );
      let textData = "";

      const owner = new ethers.Wallet(process.env.GOERLI_PRIVATE_KEY, provider);
    //Signers
    // [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // Deploying manifold creator contract (ERC1155Creator)
    // const Geocache1155Factory = new Geocache1155__factory(owner);
    const Geocache1155Factory = await ethers.getContractFactory(
      "Geocache1155",
      owner
    );
    console.log("constructed factory")
    // const feeData = await provider.getFeeData();
    // console.log("feeData: " + JSON.stringify(feeData, null, 2))

    Geocache1155Instance = await Geocache1155Factory.deploy()

    // Geocache1155Instance = await Geocache1155Factory.deploy({
    //   gasLimit: 20000000,
    //   // gasPrice: 7562687260
    // });
    await Geocache1155Instance.deployed();
    textData += "exports.Geocache1155 = '" + Geocache1155Instance.address + "';\n";

    console.log('Geocache1155 deployed to:', Geocache1155Instance.address);

    // Deploying Community Creations contract
    const GeocacheFactory = new Geocache__factory(owner);
    GeocacheInstance = await GeocacheFactory.deploy(Geocache1155Instance.address);
    await GeocacheInstance.deployed();
    textData += "exports.Geocache = '" + GeocacheInstance.address + "';\n";
    // textData += "exports.Geocache = '0x0BFb1918606E2c4B89114a1Fd9A7A9Ba608A8755';\n";

    console.log('Geocache deployed to:', GeocacheInstance.address);

    // Registering geocache as an extension (necessary for using manifold)
    let tx = await Geocache1155Instance['registerExtension(address,string)'](
      GeocacheInstance.address,
      ''
    );
    await tx.wait();
    console.log("register transaction finished!")




    //
    // Write data in 'Output.txt' .
    fs.writeFileSync(
      "../02-App3/contract_info/contractAddressesGoerli.js",
      textData,
      (err) => {
        // In case of a error throw err.
        if (err) {
          console.log("bad");
          throw err;
        }
        console.log("done writing to file");
      }
    );



    //This copies the abi from our build folder to a dedicated folder in the backend folder
    let contractNames = ['Geocache', 'Geocache1155']
    contractNames.forEach(async (contractName) => {
      srcPath = "./artifacts/contracts/" + contractName + ".sol/" + contractName + ".json";
      backendPath = "../02-App3/contract_info/goerliAbis/" + contractName + ".json";
      // let srcPath = "./build/contracts/contracts/" + contractName + ".sol/" + contractName + ".json";
      // let backendPath = "../02-DApp/backend/contractscripts/contract_info/abis/" + contractName + ".json";
      const abiData = fs.readFileSync(srcPath)
      fs.writeFileSync(backendPath, abiData, (err) => {
        // In case of a error throw err.
        if (err) {
          console.log("bad");
          throw err;
        }
        console.log("done writing to file");
      });
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("Error: " + error);
  // console.error("Error: " + error.reason);
  // console.error(error.code);
  // console.error(error.error.body);
  // console.log(JSON.stringify(error, null, 2));
  process.exitCode = 1;
});

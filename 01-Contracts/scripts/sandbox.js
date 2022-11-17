// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const axios= require('axios');
const CONTRACT_ADDRESSES = require('../../02-App3/contract_info/contractAddressesGoerli.js')
 require('dotenv').config();
 const fs = require("fs");

const { ethers } = require("hardhat");
async function main() {

      const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.GOERLI_ALCHEMY_KEY
      );
      let textData = "";
      console.log("address: " + await CONTRACT_ADDRESSES.Geocache);
      const owner = new ethers.Wallet(process.env.CACHEIT_PRIVATE_KEY, provider);
      const geocacheContractWithSigner = await ethers.getContractAt("Geocache", CONTRACT_ADDRESSES.Geocache, owner);
      const numGeocaches = await geocacheContractWithSigner.numGeocaches();
      console.log("numGeocaches: " + numGeocaches);

      const getTokenURIPinata = async (
        name,
        originStory,
        numItems,
        locationCreated,
      ) => {
        // Creating our metadata
        const metadataObj = {
          image:
            'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png', // hardcoded image for now (TODO: change to user-uploaded photo)
          name: name,
          description: originStory,
          attributes: [
            // TODO: Determine what other attributes we want in metadata
            {
              trait_type: 'Geocache Date Created',
              display_type: 'date',
              value: Date.now(),
            },
            {trait_type: 'Geocache Size', value: numItems},
            {trait_type: 'Location Created', value: locationCreated},
          ],
        };
    
        // Getting pinata URL for tokenURI
        const config = {
          method: 'POST',
          url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          headers: {
            pinata_api_key: `${process.env.PINATA_KEY}`,
            pinata_secret_api_key: `${process.env.PINATA_SECRET}`,
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(metadataObj),
        };
    
        console.log('Making api call');
    
        let ipfsURL;
        try {
          const res = await axios(config);
          console.log('PINATA API RESULTS');
          console.log(res.data);
          ipfsURL = `ipfs://${res.data.IpfsHash}`;
        } catch (error) {
          console.log(error.response);
        }
    
        console.log('Final IPFS URL for metadata is: ', ipfsURL);
        return ipfsURL; // Passing this into the newGeocache URI
      };


      // const uri = await getTokenURIPinata("name", "originStory", 1, "locationCreated");
      // print the uri
      // console.log("uri: " + uri);

      // deploy a new geocache from the contract
      // const createGeocacheTxn = await geocacheContractWithSigner
      //         .newGeocache(
      //           3,
      //           "ipfs://QmeW3AcQoAVmGoMQo7XKGp2CGs2CaNNWi3VNipKdkTQqja",
      //           // 'https://gateway.pinata.cloud/ipfs/QmeW3AcQoAVmGoMQo7XKGp2CGs2CaNNWi3VNipKdkTQqja',
      //           // 'https://gateway.pinata.cloud/ipfs/QmXgkKXsTyW9QJCHWsgrt2BW7p5csfFE21eWtmbd5Gzbjr/',
      //           "date.toString()",
      //           ["itelmocations"],
      //           //TODO this context needs to be updated
      //           "currentPosition.latitude.toString()",
      //           "currentPosition.longitude.toString()",
      //           3,
      //           "name15",
      //           "originStory.trim()",
      //           // {
      //           //   gasLimit: 10000000,
      //           // },
      //         )
      //         .then(res => {
      //           console.log("Success: " + JSON.stringify(res, null, 2))
      //         })
      //         .catch(error => {
      //           // // setHasThrownError(true)
      //           // setErrorMessage(error.message);
      //           // setIsDeployingGeocache(false);
      //           console.log('Error: ' + error.message);
      //         });

    const geocacheCreatedCallback = async (
      creatorAddress,
      geocacheName,
      newGeocacheId,
    ) => {
      // creatorAddress = creatorAddress.toLocaleLowerCase();
      // // console.log("creatorAddress in new cahce form callback: " + creatorAddress)
      // const connectedAddress = connector.accounts[0];
      // // console.log("connectorAddress in new cahce form callback: " + connectedAddress)
  
      // if (creatorAddress == connectedAddress && !isLoading && !hasDeployedGeocache) {
      console.log('contract deployed ' + geocacheName + " id: " + newGeocacheId);
      //   await getGeocacheMetadata(newGeocacheId)
      //   setIsDeployingGeocache(false);
      //   setHasDeployedGeocache(true);
      // }
    };
    const creatorContract = await geocacheContractWithSigner.creatorContract();
    console.log("creatorContract: " + creatorContract);
    const tokenURI = await geocacheContractWithSigner.tokenURI(creatorContract, numGeocaches - 1);
    console.log("tokenURI: " + tokenURI);
    geocacheContractWithSigner.on('GeocacheCreated', geocacheCreatedCallback);




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

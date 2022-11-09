global.latitudeDelta = 0.01;
global.longitudeDelta = 0.01;

// const ethers = require('ethers');

// const provider = new ethers.providers.AlchemyProvider(
//   "goerli",
//   process.env.GOERLI_ALCHEMY_KEY
// );
// const LeagueProxyContract = new ethers.Contract(
//   router.query.leagueRoute[0],
//   LeagueOfLegendsLogicJSON.abi,
//   provider
// );

global.shortenAddress = (address) => {
    // console.log("address to shorten: " + address);
    const shortenedAddress1 = `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`;
    return shortenedAddress1;
    // setIsConnected(true);
  };
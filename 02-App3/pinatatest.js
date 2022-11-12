// TODO DELETE THIS FILE once tested
const axios = require('axios');

async function main() {
  // FUNC
  const getTokenURIPinata = async (
    name,
    originStory,
    numItems,
    locationCreated,
  ) => {
    console.log('IN MAIN');
    PINATA_KEY = 'e8f85c1fc51da4b40845';
    PINATA_SECRET =
      '37f1366a806713c93ce8721cd93a855546ecdb95b3596c3f89ea11633513f609';
    PINATA_JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMWJjYjAzMi04Zjk1LTRlZmEtYTc4Ni0xZDEzOTFlNzYxNTIiLCJlbWFpbCI6ImhsYjk0OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZThmODVjMWZjNTFkYTRiNDA4NDUiLCJzY29wZWRLZXlTZWNyZXQiOiIzN2YxMzY2YTgwNjcxM2M5M2NlODcyMWNkOTNhODU1NTQ2ZWNkYjk1YjM1OTZjM2Y4OWVhMTE2MzM1MTNmNjA5IiwiaWF0IjoxNjY4MjE4MzkzfQ.23cfgjEXJ7JlzBNdL0JA-GlE3FqQ9Eap1bgwmRWNrqE';

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

    const config = {
      method: 'POST',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      headers: {
        pinata_api_key: `${PINATA_KEY}`,
        pinata_secret_api_key: `${PINATA_SECRET}`,
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(metadataObj),
    };

    console.log('Making api call');
    try {
      const res = await axios(config);
      console.log('API Call complete');
      console.log('PINATA API RESULTS');
      console.log(res.data);
    } catch (error) {
      console.log(error.response);
    }

    // const res = await pinata.pinJSONToIPFS(metadataObj, {});
    // const ipfsURL = `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`;
    // const ipfsURL = `ipfs://${res.data.IpfsHash}`;
    // return ipfsURL; // Passing this into the newGeocache URI
  };

  await getTokenURIPinata('test', 'origin story', 5, '123091.222, 123040912.1');
  // normalTest();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

import React, {useState, useContext, useEffect} from 'react';
import {
  RecyclerViewBackedScrollViewComponent,
  Text,
  View,
  Button,
} from 'react-native';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
} from '../App';
import randomLocation from 'random-location';
const globalStyles = require('../styles');
// import { URL, URLSearchParams } from 'react-native-url-polyfill';
import Geolocation from 'react-native-geolocation-service';

//Component Imports
import MessageModal from './MessageModal';
// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims';
// Import the ethers library
import {ethers} from 'ethers';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
//OPENAI
// const { Configuration, OpenAIApi } = require("openai");
import {OPENAI_SECRET_KEY, PINATA_KEY, PINATA_SECRET, PINATA_JWT} from '@env';
import axios from 'axios';

export default function NewCacheForm() {
  const {currentPosition, setCurrentPosition} = useContext(LocationContext);
  const providers = useContext(Web3ProviderContext);
  const GeocacheContract = useContext(GeocacheContractContext);
  const connector = useWalletConnect();
  //Alert if transaction is delayed
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [isDeployingGeocache, setIsDeployingGeocache] = useState(false);
  const [hasDeployedGeocache, setHasDeployedGeocache] = useState(false);
  const [transactionHash, setTransactionHash] = useState();
  // const [hasThrownError, setHasThrownError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false);
  const [name, onChangeName] = useState('Default Name');
  const [radius, onChangeRadius] = useState(1);
  const [numItems, onChangeNumItems] = useState(5);
  let fixedRadius = 0;

  useEffect(() => {
    GeocacheContract.on('GeocacheCreated', geocacheCreatedCallback);
    // const testURI = getTokenURIPinata('name', 'story', 10, 'location...');
    // console.log('TEST URIIII');
    // console.log(testURI);
  });

  const geocacheCreatedCallback = (creatorAddress, geocacheName, numItems) => {
    creatorAddress = creatorAddress.toLocaleLowerCase();
    // console.log("creatorAddress in new cahce form callback: " + creatorAddress)
    const connectedAddress = connector.accounts[0];
    // console.log("connectorAddress in new cahce form callback: " + connectedAddress)

    if (creatorAddress == connectedAddress) {
      console.log('callback triggered in new cacheform');
      setIsDeployingGeocache(false);
      setHasDeployedGeocache(true);
    }
  };

  const findInitialCoordinates = async () => {
    await Geolocation.getCurrentPosition(
      position => {
        const crd = position.coords;
        setCurrentPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 100000},
    );
  };

  const generateGeocacheOriginStory = async () => {
    var url = 'https://api.openai.com/v1/completions';
    var bearer = 'Bearer ' + OPENAI_SECRET_KEY;
    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: bearer,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-davinci-002',
        prompt:
          'Write a mysterious, interesting origin story for a geocache item.',
        temperature: 0.7,
        max_tokens: 2263,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        // console.log(data)
        // console.log(typeof data)
        // console.log(Object.keys(data))
        console.log(data['choices'][0].text);
        return data['choices'][0].text;
        // console.log(JSON.stringify(data, null, 2))
      })
      .catch(error => {
        console.log('Something bad happened ' + error);
      });
  };

  // const createGeocacheSubmitHandler = async () => {
  //   // setTransactionHash(res.hash)
  //   setIsDeployingGeocache(true)
  //   setTimeout(() => {
  //     console.log("DELAYED")
  //     // setIsTransactionDelayed(true)
  //     setIsTransactionDelayed(true && !hasDeployedGeocache)
  //   }, 2000)
  // }
  const createGeocacheSubmitHandler = async () => {
    // console.log("create geocache")
    //update location
    setIsDeployingGeocache(false);
    await findInitialCoordinates();
    const itemLocations = generateItemLocations();
    await providers.walletConnect.enable();
    const ethers_provider = new ethers.providers.Web3Provider(
      providers.walletConnect,
    );

    const signer = await ethers_provider.getSigner();
    const geocacheContractWithSigner = await GeocacheContract.connect(signer);

    const date = new Date(Date.now()).toLocaleString();
    // console.log("Date: " + date.toString)

    // The generate origin story function isn't working @trey, hardcoding origin story for now
    // const originStory = await generateGeocacheOriginStory();
    const originStory =
      "Here is an origin story. This will be the item's description!";

    const tokenURI = await getTokenURIPinata(
      name,
      originStory,
      numItems,
      String(
        currentPosition.latitude.toString() +
          ', ' +
          currentPosition.longitude.toString(),
      ),
    );

    const createGeocacheTxn = await geocacheContractWithSigner
      .newGeocache(
        numItems,
        tokenURI,
        date.toString(),
        itemLocations,
        //TODO this context needs to be updated
        currentPosition.latitude.toString(),
        currentPosition.longitude.toString(),
        radius,
        name,
        //Wait to deploy new contracts to include randomly generated originStory
        'ORIGIN STORY :)',
        {
          gasLimit: 1000000,
        },
      )
      .then(res => {
        setTransactionHash(res.hash);
        setIsDeployingGeocache(true);
        setTimeout(() => {
          // console.log("DELAYED")
          setIsTransactionDelayed(true && !hasDeployedGeocache);
        }, 15000);
        console.log('Success: ' + JSON.stringify(res, null, 2));
      })
      .catch(error => {
        // setHasThrownError(true)
        setErrorMessage(error.message);
        setIsDeployingGeocache(false);
        console.log('Error: ' + error.message);
      });

    // console.log('done');
  };

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
        pinata_api_key: `${PINATA_KEY}`,
        pinata_secret_api_key: `${PINATA_SECRET}`,
        Authorization: `Bearer ${PINATA_JWT}`,
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

  const generateItemLocations = () => {
    //generate numItems coordinate pairs within radius
    // console.log("locationContext: " + JSON.stringify(locationContext));
    const randomCoords = Array();
    // findCoordinates();
    fixedRadius = radius * 1; //* 1609.34;
    for (let i = 0; i < numItems; i++) {
      let coord = randomLocation.randomCirclePoint(
        currentPosition,
        fixedRadius,
      );
      randomCoords.push(coord);
    }

    //Formatting item locations to be a list of string tuples
    var itemLocationsFormatted = [];
    randomCoords.map((coord, index) => {
      itemLocationsFormatted[index] = coord.latitude + ',' + coord.longitude;
    });
    return itemLocationsFormatted;
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeName}
          placeholder="Name"
          // value={name}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeRadius}
          // value={radius}
          placeholder="Radius (Meters)"
          keyboardType="decimal-pad"
        />
        {/* TODO make it so a cache can only contain 10 items for now, so transaction doesn't run out of gas */}
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumItems}
          // value={numItems}
          placeholder="Number of items"
          keyboardType="numeric"
        />
        <Button
          // onPress={() => {generateGeocacheOriginStory()}}
          onPress={() => {
            createGeocacheSubmitHandler();
          }}
          title="Submit"
          color="#841584"
          disabled={!connector.connected}
          accessibilityLabel="Learn more about this purple button"
        />
        {!connector.connected && (
          <View style={globalStyles.textContainer}>
            <Text style={globalStyles.centerText}>
              Uh-Oh! Please connect your wallet to create a new Geocache.
            </Text>
          </View>
        )}
        {/* {true &&  */}
        {isDeployingGeocache && (
          // {isTransactionDelayed &&
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Deploying your Geocache'}
              isProgress={true}
              isTransactionDelayed={isTransactionDelayed}
              transactionHash={transactionHash}
              body={
                'Please wait for this transaction to complete.'
              }></MessageModal>
          </View>
        )}

        {hasDeployedGeocache && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Success!'}
              body={'Finished deploying.'}></MessageModal>
          </View>
        )}
        {/* {hasThrownError && */}
        {errorMessage && (
          <MessageModal title={'Error!'} body={errorMessage}></MessageModal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
  },
});

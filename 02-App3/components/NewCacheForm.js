import React, {useState, useContext, useEffect} from 'react';
import {
  RecyclerViewBackedScrollViewComponent,
  Text,
  View,
  Button,
} from 'react-native';
// import { useRoute } from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
} from '../App';
import randomLocation from 'random-location';
const globalStyles = require('../styles');
import '../global';
// import { URL, URLSearchParams } from 'react-native-url-polyfill';
import Geolocation from 'react-native-geolocation-service';

//Component Imports
import MessageModal from './MessageModal';
  import { useRoute } from '@react-navigation/native';

// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims';
// Import the ethers library
import {ethers} from 'ethers';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
//OPENAI
// const { Configuration, OpenAIApi } = require("openai");
import {OPENAI_SECRET_KEY} from '@env';
// import { white } from 'react-native-paper/lib/typescript/styles/colors';
//
// const configuration = new Configuration({
//   apiKey: OPENAI_SECRET_KEY,
// });
// import { create } from 'ipfs-http-client'
// const ipfsClient = require('ipfs-http-client');

import {GOERLI_INFURA_KEY} from '@env';

// connect to the default API address http://localhost:5001
const IPFS = require('ipfs-mini');

export default function NewCacheForm({navigation}) {
  // const client = create()
  // ipfs.add('hello world!').then(console.log).catch(console.log);


  //  const navigation = useNavigation()

  const {currentPosition, setCurrentPosition} = useContext(LocationContext);
  const providers = useContext(Web3ProviderContext);
  const GeocacheContract = useContext(GeocacheContractContext);
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);

  const connector = useWalletConnect();
  //Alert if transaction is delayed
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [isDeployingGeocache, setIsDeployingGeocache] = useState(false);
  const [hasDeployedGeocache, setHasDeployedGeocache] = useState(false);
  const [transactionHash, setTransactionHash] = useState();
  const [imgUrl, setImgUrl] = useState();
  const [geocacheOriginStory, setGeocacheOriginStory] = useState([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState();
  const [isGeneratingImage, setIsGeneratingImage] = useState();
  const [isLoading, setIsLoading] = useState()
  // const [hasThrownError, setHasThrownError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false);
  const [name, onChangeName] = useState();
  const [radius, onChangeRadius] = useState();
  const [numItems, onChangeNumItems] = useState();
  let fixedRadius = 0;

  // const auth = 'Basic ' + process.env.GOERLI_INFURA_KEY;
  // const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: {
  //   authorization: auth,
  // }});
  // const client = ipfsClient.create({
  //     host: 'ipfs.infura.io',
  //     port: 5001,
  //     protocol: 'https',
  //     headers: {
  //         authorization: auth,
  //     },
  // });

  useEffect(() => {
    GeocacheContract.on('GeocacheCreated', geocacheCreatedCallback);
    // ipfs.add('hello world!').then(console.log).catch(console.log);
  });

  const getGeocacheMetadata = async id => {
    //get data on selected geocache
    // console.log("Getting data for id: " + id)
    setIsLoading(true);
    // setIsLoading(id);
    var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(id).catch((e) => {alert("OOPS! Error: " + e)});
    var selectedGeocacheItemLocations =
      await GeocacheContract.getGeolocationsOfGeocache(id).catch((e) => {alert("OOPS! Error: " + e)});;
    // console.log("selected geocahce: " + JSON.stringify(selectedGeocacheRawData, null, 2))
    // console.log("selected geocache gelocaitons: " + selectedGeocacheItemLocations)
    var itemLocations = [];
    selectedGeocacheItemLocations.map((coordsAsString, index) => {
      var coord = {
        latitude: parseFloat(
          coordsAsString.substring(0, coordsAsString.indexOf(',')),
        ),
        longitude: parseFloat(
          coordsAsString.substring(coordsAsString.indexOf(',') + 1),
        ),
      };
      itemLocations.push(coord);
    });
    setCacheMetadata({
      creator: selectedGeocacheRawData[0],
      imgUrl: selectedGeocacheRawData[1],
      date: selectedGeocacheRawData[2],
      numberOfItems: parseInt(selectedGeocacheRawData[3]),
      isActive: selectedGeocacheRawData[4],
      epicenterLat: parseFloat(selectedGeocacheRawData[5]),
      epicenterLong: parseFloat(selectedGeocacheRawData[6]),
      name: selectedGeocacheRawData[7],
      radius: parseInt(selectedGeocacheRawData[8]),
      geolocations: itemLocations,
      geocacheId: id,
    });
    setIsLoading(false);
    // await delay(1000)
    // setModalVisible(!modalVisible);
  };

  // TODO, send them to their new geocahce after this is completed
  const geocacheCreatedCallback = async (
    creatorAddress,
    geocacheName,
    newGeocacheId,
  ) => {
    creatorAddress = creatorAddress.toLocaleLowerCase();
    // console.log("creatorAddress in new cahce form callback: " + creatorAddress)
    const connectedAddress = connector.accounts[0];
    // console.log("connectorAddress in new cahce form callback: " + connectedAddress)

    if (creatorAddress == connectedAddress && !isLoading && !hasDeployedGeocache) {
      console.log('callback triggered in new cacheform: ' + geocacheName + " id: " + newGeocacheId);
      await getGeocacheMetadata(newGeocacheId)
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
    setIsGeneratingStory(true);
    return new Promise((resolve, reject) => {
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
          prompt: 'Write a mysterious, exciting origin story for a geocache item.',
          temperature: 0.9,
          max_tokens: 1750,
          top_p: 1,
          frequency_penalty: 1,
          presence_penalty: 1,
          best_of: 2,
        }),
      })
        .then(response => {
          return response.json();
        })
        .then(async data => {
          // console.log(data)
          // console.log(typeof data)
          // console.log(Object.keys(data))
          // console.log(data['choices'][0].text)
          const originStory = data['choices'][0].text;
          // await generateGeocacheImage(originStory)
          resolve(originStory);

          // console.log(JSON.stringify(data, null, 2))
        })
        .catch(error => {
          console.log('Something bad happened ' + error);
          setErrorMessage(
            'Something bad happened while generating story, please try again:  ' +
              error,
          );
          setIsGeneratingStory(false);
          setGeocacheOriginStory('');
        });

      // }
    });
  };

  const generateGeocacheImage = async originStory => {
    setIsGeneratingImage(true);
    return new Promise((resolve, reject) => {
      var prompt =
        originStory +
        ' Generate a mysterious image that represents a single item in this cache. Do not include any human fingers in the image. Give the image a mysterious, outdoor background.';
      var url = 'https://api.openai.com/v1/images/generations';
      var bearer = 'Bearer ' + OPENAI_SECRET_KEY;
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
        }),
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          // console.log(data)
          // console.log(typeof data)
          // console.log(Object.keys(data))
          // console.log(JSON.stringify(data, null, 2).substring(0, 199))
          // setImgUrl('data:image/png;base64,' + data['data'][0]['b64_json'])
          if (data)
            resolve('data:image/png;base64,' + data['data'][0]['b64_json']);
          // console.log(data['choices'][0].text)
          // return data['choices'][0].text
        })
        .catch(error => {
          console.log('Something bad happened ' + error);
          setErrorMessage(
            'Something bad happened while generating image, please try again:  ' +
              error,
          );
          setIsGeneratingImage(false);
          setImgUrl('');
        });
    });
  };

  const validateFormData = () => {
    if (name == '' || !name) {
      setErrorMessage('Please set a name for this geocache');
      return false;
    }
    if (radius > 2000 || !radius) {
      setErrorMessage('Please set radius <= 2000');
      return false;
    }
    if (numItems >= 10 || !numItems) {
      setErrorMessage('Please set number of items < 10');
      return false;
    }
    return true;
  };

  const createGeocacheSubmitHandler = async () => {
    // console.log("create geocache")
    resetState();
    //update location
    if (validateFormData()) {
      // if(true) {
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

      await generateGeocacheOriginStory().then(async originStory => {
        // console.log("Story: " + originStory)
        setGeocacheOriginStory(originStory);
        setIsGeneratingStory(false);
        await generateGeocacheImage(originStory).then(async base64url => {
          // console.log("base64: " + base64url.substring(0, 199))
          setImgUrl(base64url);
          setIsGeneratingImage(false);
          if (base64url && originStory) {
            console.log('sending transaction! ' + originStory.trim());
            const createGeocacheTxn = await geocacheContractWithSigner
              .newGeocache(
                Math.abs(Math.round(numItems)),
                'https://gateway.pinata.cloud/ipfs/QmXgkKXsTyW9QJCHWsgrt2BW7p5csfFE21eWtmbd5Gzbjr/',
                date.toString(),
                itemLocations,
                //TODO this context needs to be updated
                currentPosition.latitude.toString(),
                currentPosition.longitude.toString(),
                Math.abs(Math.round(radius)),
                name,
                //Wait to deploy new contracts to include randomly generated originStory
                // 'eeeee',
                //This always runs out of memory
                originStory.trim(),
                // {
                //   gasLimit: 10000000,
                // },
              )
              .then(res => {
                setTransactionHash(res.hash);
                setIsDeployingGeocache(true);
                setTimeout(() => {
                  // console.log("DELAYED")
                  setIsTransactionDelayed(true && !hasDeployedGeocache);
                }, 15000);
                // console.log("Success: " + JSON.stringify(res, null, 2))
              })
              .catch(error => {
                // setHasThrownError(true)
                setErrorMessage(error.message);
                setIsDeployingGeocache(false);
                console.log('Error: ' + error.message);
              });
          }
        }).catch((e) => {
          setErrorMessage(e.message);
          setIsDeployingGeocache(false);
          console.log('Error: ' + e.message);
        });;
      });

      // console.log("out here story: " + originStory)
    }

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

  const resetState = () => {
    setErrorMessage(undefined);
    setIsDeployingGeocache(false);
    setHasDeployedGeocache(false);
    // setImgUrl(undefined)
    // setGeocacheOriginStory(undefined)
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* <ScrollView contentContainerStyle={styles.container}> */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={globalStyles.text}>
              {'Choose a name for this geocache.'}
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeName}
              placeholder="Name"
              blurOnSubmit={true}
              // value={name}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={globalStyles.text}>
              {
                "Set the radius of the geocache's search area. The search area will be centered at your current location."
              }
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeRadius}
              // value={radius}
              placeholder="Radius (Meters)"
              keyboardType="decimal-pad"
            />
          </View>
          {/* TODO make it so a cache can only contain 10 items for now, so transaction doesn't run out of gas */}
          <View style={styles.inputContainer}>
            <Text style={globalStyles.text}>
              {
                "Set the number of items in the geocache. This will randomly generate locations within your geocache's search area for the number of items you set below."
              }{' '}
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeNumItems}
              // value={numItems}
              placeholder="Number of items"
              keyboardType="numeric"
            />
          </View>
          <Button
            // onPress={() => {generateGeocacheOriginStory()}}
            color={global.primaryColor}
            // onPress={() => {generateGeocacheOriginStory()}}
            onPress={() => {
              createGeocacheSubmitHandler();
            }}
            title="Submit"
            // color="#841584"
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
        </View>
        <View style={styles.container}>
          {geocacheOriginStory != undefined && (
            <Text
              style={[globalStyles.centerText, {color: global.secondaryColor}]}>
              {geocacheOriginStory}
            </Text>
          )}
          {imgUrl != undefined && (
            <Image
              style={{
                margin: 20,
                width: 200,
                height: 200,
                borderWidth: 1,
                borderColor: global.secondaryColor,
              }}
              source={{uri: imgUrl}}
            />
          )}
        </View>
        {/* {true && ( */}
        {isGeneratingImage && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Generating Image'}
              isProgress={true}
              resetParentState={resetState}
              body={'Please wait.'}></MessageModal>
          </View>
        )}
        {isGeneratingStory && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Generating Story'}
              isProgress={true}
              resetParentState={resetState}
              body={
                'Please wait.'
              }></MessageModal>
          </View>
        )}
        {isDeployingGeocache && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Deploying your Geocache'}
              isProgress={true}
              resetParentState={resetState}
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
              resetParentState={resetState}
              hasDeployedGeocache={true}
              title={'Success!'}
              body={'Finished deploying.'}></MessageModal>
          </View>
        )}
        {/* {hasThrownError && */}
        {errorMessage && (
          <MessageModal
            title={'Uh-oh!'}
            body={errorMessage}
            resetParentState={resetState}></MessageModal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    marginTop: 12,
    borderBottomWidth: 1,
    padding: 10,
    width: '100%',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 10,
    padding: 5,
  },
  formContainer: {
    // height: "100%",
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    // padding: 15,
    borderRadius: 14,
    margin: 15,
    zIndex: 3,
    borderColor: global.primaryColor,
    borderWidth: 3,
    // alignSelf: "center",
    // backgroundColor: "orange"
  },
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: global.cream,
    // padding: 15,
    // borderRadius: 14,
    // margin: 15,
    // zIndex: 3,
    // borderColor: global.primaryColor,
    // borderWidth: 3
    // alignSelf: "center",
    // backgroundColor: "orange"
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
  },
});

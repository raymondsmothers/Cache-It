import React, {useState, useRef, useContext, useEffect} from 'react';
import {
  RecyclerViewBackedScrollViewComponent,
  Text,
  View,
  Button,
} from "react-native";
// import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
} from "../App";
import randomLocation from "random-location";
const globalStyles = require("../styles");
import "../global";
// import { URL, URLSearchParams } from 'react-native-url-polyfill';
import Geolocation from "react-native-geolocation-service";

//Component Imports
import MessageModal from "./MessageModal";
import { useRoute } from "@react-navigation/native";

// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims";
const {
  hexZeroPad,
} = require("@ethersproject/bytes");// Import the ethers library
import { ethers } from "ethers";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
//OPENAI
// const { Configuration, OpenAIApi } = require("openai");
import { OPENAI_SECRET_KEY, PINATA_KEY, PINATA_JWT, PINATA_SECRET } from "@env";
import axios from "axios";
// import { white } from 'react-native-paper/lib/typescript/styles/colors';
//
// const configuration = new Configuration({
//   apiKey: OPENAI_SECRET_KEY,
// });
// import { create } from 'ipfs-http-client'
// const ipfsClient = require('ipfs-http-client');

import {GOERLI_INFURA_KEY} from '@env';
import PleaseConnect from './PleaseConnect';
import { utils } from 'ethers';
// connect to the default API address http://localhost:5001
const IPFS = require("ipfs-mini");

export default function NewCacheForm({ navigation }) {
  // const client = create()
  // ipfs.add('hello world!').then(console.log).catch(console.log);

  //  const navigation = useNavigation()

  const { currentPosition, setCurrentPosition } = useContext(LocationContext);
  const providers = useContext(Web3ProviderContext);
  const GeocacheContract = useContext(GeocacheContractContext);
  const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext);

  const connector = useWalletConnect();
  //Alert if transaction is delayed
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false);
  const [isDeployingGeocache, setIsDeployingGeocache] = useState(false);
  const [hasDeployedGeocache, setHasDeployedGeocache] = useState(false);
  const [transactionHash, setTransactionHash] = useState();
  const [imgUrl, setImgUrl] = useState('');
  const [geocacheOriginStory, setGeocacheOriginStory] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState();
  const [isGeneratingImage, setIsGeneratingImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizingGeocache, setIsFinalizingGeocache] = useState()
  // const [hasThrownError, setHasThrownError] = useState(false)
  const [errorMessage, setErrorMessage] = useState();
  const [name, onChangeName] = useState();
  const [originAdjective, onChangeOriginAdjective] = useState();
  const [radius, onChangeRadius] = useState();
  const [numItems, onChangeNumItems] = useState();
  let fixedRadius = 0;

  const scrollRef = useRef();

  useEffect(() => {
    //TODO this calls multiple times and breaks sometimes.
    // List all token transfers  *to*  myAddress:
    // const filter = {
    //   address: GeocacheContract.address,
    //   topics: [
    //     // GeocacheCreated(msg.sender, _name, numGeocaches)
    //       utils.id("GeocacheCreated(msg.sender, _name, numGeocaches)"),
    //       // connector.accounts[0],
    //       // hexZeroPad(connector?.accounts[0], 32),
    //       null,
    //       name,
    //       null
    //   ]
    // };
    const filter = GeocacheContract.filters.GeocacheCreated(connector.accounts[0])
    GeocacheContract.on(filter, geocacheCreatedCallback);
    // GeocacheContract.on('GeocacheCreated', geocacheCreatedCallback);
  });

  const getGeocacheMetadata = async (id) => {
    //get data on selected geocache
    // console.log("Getting data for id: " + id)
    setIsLoading(true);
    // setIsLoading(id);
    var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(
      id
    ).catch((e) => {
      alert("OOPS! Error: " + e);
    });
    var selectedGeocacheItemLocations =
      await GeocacheContract.getGeolocationsOfGeocache(id).catch((e) => {
        alert("OOPS! Error: " + e);
      });
    // console.log("selected geocahce: " + JSON.stringify(selectedGeocacheRawData, null, 2))
    // console.log("selected geocache gelocaitons: " + selectedGeocacheItemLocations)
    var itemLocations = [];
    selectedGeocacheItemLocations.map((coordsAsString, index) => {
      var coord = {
        latitude: parseFloat(
          coordsAsString.substring(0, coordsAsString.indexOf(","))
        ),
        longitude: parseFloat(
          coordsAsString.substring(coordsAsString.indexOf(",") + 1)
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
    newGeocacheId
  ) => {
    creatorAddress = creatorAddress.toLocaleLowerCase();
    // console.log("creatorAddress in new cahce form callback: " + creatorAddress)
    const connectedAddress = connector.accounts[0];
    // console.log("connectorAddress in new cahce form callback: " + connectedAddress)

    if (
      creatorAddress == connectedAddress &&
      !isLoading &&
      !hasDeployedGeocache
    ) {
      console.log(
        "callback triggered in new cacheform: " +
          geocacheName +
          " id: " +
          newGeocacheId
      );
      await getGeocacheMetadata(newGeocacheId);
      setIsDeployingGeocache(false);
      setHasDeployedGeocache(true);
    }
  };

  const findInitialCoordinates = async () => {
    await Geolocation.getCurrentPosition(
      (position) => {
        const crd = position.coords;
        setCurrentPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
        });
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 100000 }
    );
  };

  const generateGeocacheOriginStory = async () => {
    setIsGeneratingStory(true);
    return new Promise((resolve, reject) => {
      var url = "https://api.openai.com/v1/completions";
      var bearer = "Bearer " + OPENAI_SECRET_KEY;
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: bearer,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-davinci-002",
          prompt:
            "Write a " +
            originAdjective +
            " origin story for a mysterious hidden item.",
          // 'Write a mysterious, origin story for a geocache item.',
          temperature: 0.9,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 1,
          presence_penalty: 1,
          best_of: 2,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .catch(error => {
          console.log('Something bad happened ' + error);
          setErrorMessage(
            'Something bad happened while generating story, please try again:  ' +
              error.message,
          );
          setIsGeneratingStory(false);
          setGeocacheOriginStory('');
        })
        .then(async data => {
          const originStory = data['choices'][0].text;
          scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
          });
          resolve(originStory);
        })
        .catch((error) => {
          console.log("Something bad happened " + error);
          setErrorMessage(
            "Something bad happened while generating story, please try again:  " +
              error
          );
          setIsGeneratingStory(false);
          setGeocacheOriginStory("");
        });

      // }
    });
  };

  const generateGeocacheImage = async (originStory) => {
    setIsGeneratingImage(true);
    return new Promise((resolve, reject) => {
      var prompt =
        originStory +
        " Generate a mysterious image that represents a single item in this hidden cache. Do not include any human fingers in the image. Give the image a mysterious, outdoor background.";
      var url = "https://api.openai.com/v1/images/generations";
      var bearer = "Bearer " + OPENAI_SECRET_KEY;
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: bearer,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      })
        .then((response) => {
          // console.log('RES');
          // console.log(response);
          return response.json();
        })
        .then((data) => {
          // console.log(data)
          // console.log(typeof data)
          // console.log(Object.keys(data))
          // console.log(JSON.stringify(data, null, 2).substring(0, 199))
          // setImgUrl('data:image/png;base64,' + data['data'][0]['b64_json'])
          if (data['error']) {
            console.log('Something bad happened on line 295');

            setErrorMessage(
              'Something bad happened while generating image, please try again:  ' +
                data['error']['message'],
            );
            setIsGeneratingImage(false);
            setImgUrl('');
            setGeocacheOriginStory('');

          }
          else if (data)
            resolve('data:image/png;base64,' + data['data'][0]['b64_json']);
        })
        .catch((error) => {
          console.log("Something bad happened " + error);
          setErrorMessage(
            "Something bad happened while generating image, please try again:  " +
              error
          );
          setIsGeneratingImage(false);
          setImgUrl('');
          setGeocacheOriginStory('');

        });
    });
  };

  const validateFormData = () => {
    if (name == "" || !name) {
      setErrorMessage("Please set a name for this geocache");
      return false;
    }
    if (radius > 2000 || !radius) {
      setErrorMessage("Please set radius <= 2000");
      return false;
    }
    if (numItems >= 10 || !numItems) {
      setErrorMessage("Please set number of items < 10");
      return false;
    }
    return true;
  };

  const sendGeocacheTransaction = async () => {
    // setIsDeployingGeocache(true)
    setIsFinalizingGeocache(true)
    await findInitialCoordinates();
    const itemLocations = generateItemLocations();
    await providers.walletConnect.enable();
    const ethers_provider = new ethers.providers.Web3Provider(
      providers.walletConnect,
    );

    const signer = await ethers_provider.getSigner();
    const geocacheContractWithSigner = await GeocacheContract.connect(signer);

    const date = new Date(Date.now()).toLocaleString();
    if (imgUrl.length > 0 && geocacheOriginStory.length > 0) {
      // Generating metadata, passing in image
      const tokenURI = await getTokenURIPinata(
        name,
        geocacheOriginStory,
        numItems,
        String(
          currentPosition.latitude.toString() +
            ', ' +
            currentPosition.longitude.toString(),
        ),
        imgUrl,
      );
      setIsFinalizingGeocache(false)


      // console.log('sending transaction! ' + originStory.trim());
      const createGeocacheTxn = await geocacheContractWithSigner
        .newGeocache(
          Math.abs(Math.round(numItems)),
          tokenURI,
          date.toString(),
          itemLocations,
          currentPosition.latitude.toString(),
          currentPosition.longitude.toString(),
          Math.abs(Math.round(radius)),
          name,
          geocacheOriginStory.trim(),
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
          console.log('Error creating geocache: ' + error.message);
        });
      }
  }

  const createGeocacheSubmitHandler = async () => {
    // console.log("create geocache")
    resetState();
    //update location
    if (validateFormData()) {
      setIsDeployingGeocache(false);
      await generateGeocacheOriginStory().then(async originStory => {
        // console.log("Story: " + originStory)
        setGeocacheOriginStory(originStory);
        setIsGeneratingStory(false);
        await generateGeocacheImage(originStory)
          .then(async (base64url) => {
            // console.log("base64: " + base64url.substring(0, 199))
            setImgUrl(base64url);
            setIsGeneratingImage(false);
          })
          .catch((e) => {
            setErrorMessage(e.message);
            setIsDeployingGeocache(false);
            console.log("Error base64 part: " + e.message);
          });
      });
      // console.log("out here story: " + originStory)
    }
    // console.log('done');
  };

  // Generating our metadata and putting on IPFS
  const getTokenURIPinata = async (
    name,
    originStory,
    numItems,
    locationCreated,
    imgURL
  ) => {
    // console.log("pinata secret: " + PINATA_JWT)
    // Creating our metadata
    const metadataObj = {
      image: imgURL,
      name: name,
      description: originStory,
      attributes: [
        {
          trait_type: "Geocache Date Created",
          display_type: "date",
          value: Date.now(),
        },
        { trait_type: "Geocache Size", value: numItems },
        { trait_type: "Location Created", value: locationCreated },
      ],
    };
    const config = {
      method: "POST",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        pinata_api_key: `${PINATA_KEY}`,
        pinata_secret_api_key: `${PINATA_SECRET}`,
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(metadataObj),
    };

    let ipfsURL;
    try {
      const res = await axios(config);
      ipfsURL = `ipfs://${res.data.IpfsHash}`;
      return ipfsURL;
    } catch (error) {
      console.log("Error making request to Pinata API" + error);
    }

    // console.log('Final IPFS URL for metadata is: ' + ipfsURL);
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
        fixedRadius
      );
      randomCoords.push(coord);
    }

    //Formatting item locations to be a list of string tuples
    var itemLocationsFormatted = [];
    randomCoords.map((coord, index) => {
      itemLocationsFormatted[index] = coord.latitude + "," + coord.longitude;
    });
    return itemLocationsFormatted;
  };

  const resetState = () => {
    setErrorMessage(undefined);
    setIsDeployingGeocache(false);
    setHasDeployedGeocache(false);
    setIsFinalizingGeocache(false)
    // setImgUrl(undefined)
    // setGeocacheOriginStory(undefined)
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollRef}>
        {/* <ScrollView contentContainerStyle={styles.container}> */}
        <View style={styles.container} >
          {geocacheOriginStory.length > 0 && (
            <>
              <Text style={[globalStyles.titleText, {paddingBottom: 0}]}>
                {"Origin Story for \"" + name + "\""}
              </Text>
              <Text
                style={[globalStyles.centerText, {paddingTop: 0, color: global.secondaryColor}]}>
                {geocacheOriginStory}
              </Text>
              </>
            )}
            {imgUrl.length > 0 && (
              <>
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
              <Text style={globalStyles.centerText} >
                {"After clicking \"Submit Geocache\", you will be automatically redirected to confirm this transaction with your Wallet Provider."}
              </Text>
              <Text style={globalStyles.centerText} >
                {"If you don't like the story or image, feel free to generate a new one the same way as before using the form below."}
              </Text>
              <Button
                // onPress={() => {generateGeocacheOriginStory()}}
                color={global.primaryColor}
                // onPress={() => {generateGeocacheOriginStory()}}
                onPress={() => {
                  sendGeocacheTransaction();
                }}
                title="Submit Geocache"
                // color="#841584"
                disabled={isDeployingGeocache || !connector.connected}
                accessibilityLabel="Learn more about this purple button"
              />

              </>
            )}
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={globalStyles.text}>
              {"Choose a name for this geocache."}
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
              {"Choose a adjective to describe the geocache's origin story"}
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeOriginAdjective}
              placeholder="Adventurous"
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
              }{" "}
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeNumItems}
              // value={numItems}
              placeholder="Number of items"
              keyboardType="numeric"
            />
          </View>
          <View>
          <Text style={globalStyles.centerText} >
            {"After clicking \"Generate Geocache\", you will have a chance to view the generated Origin Story and Image before finalizing your submission."}
          </Text>
          
        </View>
          <Button
            // onPress={() => {generateGeocacheOriginStory()}}
            color={global.primaryColor}
            // onPress={() => {generateGeocacheOriginStory()}}
            onPress={() => {
              createGeocacheSubmitHandler();
            }}
            title="Generate Geocache"
            // color="#841584"
            disabled={!connector.connected}
            accessibilityLabel="Learn more about this purple button"
          />
          {!connector.connected && (
            <PleaseConnect msg={" create a new geocache"}></PleaseConnect>
          )}
        </View>

        {/* {true && ( */}
        {isGeneratingImage && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={"Generating Image"}
              isProgress={true}
              resetParentState={resetState}
              body={
                "Please wait for AI to finish generating your geocache image. This may take 20 - 30 seconds."
              }
            ></MessageModal>
          </View>
        )}
        {isGeneratingStory && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={"Generating Story"}
              isProgress={true}
              resetParentState={resetState}
              body={
                "Please wait for AI to finish creating your geocache origin story."
              }
            ></MessageModal>
          </View>
        )}
        {isDeployingGeocache && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={"Deploying your Geocache"}
              isProgress={true}
              resetParentState={resetState}
              isTransactionDelayed={isTransactionDelayed}
              transactionHash={transactionHash}
              body={"Please wait for this transaction to complete."}
            ></MessageModal>
          </View>
        )}
        {isFinalizingGeocache && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              title={'Finalizing your Geocache'}
              isProgress={true}
              resetParentState={resetState}
              // isTransactionDelayed={isTransactionDelayed}
              // transactionHash={transactionHash}
              body={
                'You will be redirected to your Wallet Provider soon.'
              }></MessageModal>
          </View>
        )}

        {hasDeployedGeocache && (
          <View style={globalStyles.textContainer}>
            <MessageModal
              resetParentState={resetState}
              hasDeployedGeocache={true}
              title={"Success!"}
              body={"Finished deploying."}
            ></MessageModal>
          </View>
        )}
        {/* {hasThrownError && */}
        {errorMessage != undefined && (
          <MessageModal
            title={"Uh-oh!"}
            body={errorMessage}
            resetParentState={resetState}
          ></MessageModal>
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
    width: "100%",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 10,
    padding: 5,
  },
  formContainer: {
    // height: "100%",
    display: "flex",
    justifyContent: "flex-start",
    backgroundColor: "white",
    // padding: 15,
    borderRadius: 14,
    // marginTop: 0,
    margin: 15,
    zIndex: 3,
    borderColor: global.primaryColor,
    borderWidth: 3,
    // alignSelf: "center",
    // backgroundColor: "orange"
  },
  container: {
    // height: '100%',
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
  // container: {
  //   // height: '100%',
  //   display: 'flex',
  //   justifyContent: 'flex-start',
  //   alignItems: 'center',
  //   // backgroundColor: global.cream,
  //   // padding: 15,
  //   // borderRadius: 14,
  //   // margin: 15,
  //   // zIndex: 3,
  //   // borderColor: global.primaryColor,
  //   // borderWidth: 3
  //   // alignSelf: "center",
  //   // backgroundColor: "orange"
  // },
  text: {
    textAlign: "center",
    fontSize: 24,
  },
});

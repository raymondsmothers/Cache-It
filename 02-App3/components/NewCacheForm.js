import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid, ActivityIndicator, Alert, ScrollView  } from "react-native";
import { CacheMetadataContext, LocationContext, Web3ProviderContext, GeocacheContractContext } from '../App';
import randomLocation from 'random-location';
const globalStyles = require("../styles")
import "../global"
// import { URL, URLSearchParams } from 'react-native-url-polyfill';
import Geolocation from 'react-native-geolocation-service';

//Component Imports
import MessageModal from './MessageModal';
// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims';
// Import the ethers library
import { ethers } from "ethers";
import { useWalletConnect } from '@walletconnect/react-native-dapp';
//OPENAI
// const { Configuration, OpenAIApi } = require("openai");
import {OPENAI_SECRET_KEY} from '@env';
import { white } from 'react-native-paper/lib/typescript/styles/colors';
// 
// const configuration = new Configuration({
//   apiKey: OPENAI_SECRET_KEY,
// });



export default function NewCacheForm() {
    const {currentPosition, setCurrentPosition} = useContext(LocationContext)
    const providers = useContext(Web3ProviderContext)
    const GeocacheContract = useContext(GeocacheContractContext)
    const connector = useWalletConnect();
    //Alert if transaction is delayed
    const [isTransactionDelayed, setIsTransactionDelayed] = useState(false)
    const [isDeployingGeocache, setIsDeployingGeocache] = useState(false)
    const [hasDeployedGeocache, setHasDeployedGeocache] = useState(false)
    const [transactionHash, setTransactionHash] = useState()
    // const [hasThrownError, setHasThrownError] = useState(false)
    const [errorMessage, setErrorMessage] = useState(false)
    const [name, onChangeName] = useState();
    const [radius, onChangeRadius] = useState();
    const [numItems, onChangeNumItems] = useState();
    let fixedRadius = 0;

    useEffect(() => {
      GeocacheContract.on("GeocacheCreated", geocacheCreatedCallback)

    })

    // TODO, send them to their new geocahce after this is completed
    const geocacheCreatedCallback = (creatorAddress, geocacheName, newGeocacheId) => {
      creatorAddress = creatorAddress.toLocaleLowerCase()
      // console.log("creatorAddress in new cahce form callback: " + creatorAddress)
      const connectedAddress = connector.accounts[0];
      // console.log("connectorAddress in new cahce form callback: " + connectedAddress)
      
      if(creatorAddress == connectedAddress) {
        console.log("callback triggered in new cacheform")
        setIsDeployingGeocache(false)
        setHasDeployedGeocache(true)
      }
    }

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
        var url = "https://api.openai.com/v1/completions";
        var bearer = 'Bearer ' + OPENAI_SECRET_KEY;
        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "model": "text-davinci-002",
              "prompt": "Write a mysterious, interesting origin story for a geocache item.",
              "temperature": 0.7,
              "max_tokens": 2263,
              "top_p": 1,
              "frequency_penalty": 0,
              "presence_penalty": 0
            })    
        }).then(response => {
            
            return response.json()
           
        }).then(data=>{
            // console.log(data)
            // console.log(typeof data)
            // console.log(Object.keys(data))
            console.log(data['choices'][0].text)
            return data['choices'][0].text
            // console.log(JSON.stringify(data, null, 2))
            
        })
        .catch(error => {
            console.log('Something bad happened ' + error)
        });
    
    }

    
    // const createGeocacheSubmitHandler = async () => {
    //   // setTransactionHash(res.hash)
    //   setIsDeployingGeocache(true)
    //   setTimeout(() => {
    //     console.log("DELAYED")
    //     // setIsTransactionDelayed(true)
    //     setIsTransactionDelayed(true && !hasDeployedGeocache)
    //   }, 2000)
    // }
    const validateFormData = () => {
      if(name == "" || !name) {
        setErrorMessage("Please set a name for this geocache")
        return false
      }
      if(radius > 2000 || !radius) {
        setErrorMessage("Please set radius <= 2000")
        return false
      }
      if(numItems >= 10 || !numItems) {
        setErrorMessage("Please set number of items <= 10")
        return false
      }
      return true
    }

    const createGeocacheSubmitHandler = async () => {
      // console.log("create geocache")
      //update location
      if(validateFormData()) {
        setIsDeployingGeocache(false)
        await findInitialCoordinates();
        const itemLocations = generateItemLocations();
        await providers.walletConnect.enable();
        const ethers_provider = new ethers.providers.Web3Provider(providers.walletConnect);

        const signer = await ethers_provider.getSigner();
        const geocacheContractWithSigner = await GeocacheContract.connect(signer);

        const date = new Date(Date.now()).toLocaleString();
        // console.log("Date: " + date.toString)

        const originStory = await generateGeocacheOriginStory()
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
            "ppo",
            {
              gasLimit: 1000000,
            }

          )
          .then((res) => {
            setTransactionHash(res.hash)
            setIsDeployingGeocache(true)
            setTimeout(() => {
              // console.log("DELAYED")
              setIsTransactionDelayed(true && !hasDeployedGeocache)
            }, 15000)
            console.log("Success: " + JSON.stringify(res, null, 2))
          })
          .catch(error => {
            // setHasThrownError(true)
            setErrorMessage(error.message)
            setIsDeployingGeocache(false)
            console.log('Error: ' + error.message);
          });
      }
    // console.log('done');
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
    setErrorMessage(undefined)
    setIsDeployingGeocache(false)
  }



    return (
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text  style={globalStyles.text}>{"Choose a name for this geocache."}</Text>
          <TextInput
            style={styles.input}
            onChangeText={onChangeName}
            placeholder="Name"
            blurOnSubmit={true}
            // value={name}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text  style={globalStyles.text}>{"Set the radius of the geocache's search area. The search area will be centered at your current location."}</Text>
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
          <Text  style={globalStyles.text}>{"Set the number of items in the geocache. This will randomly generate locations within your geocache's search area for the number of items you set below."} </Text>
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
          onPress={() => {createGeocacheSubmitHandler()}}
          title="Submit"
          // color="#841584"
          disabled={!connector.connected}
          accessibilityLabel="Learn more about this purple button"
        />
        {!connector.connected && 
        <View style={globalStyles.textContainer}>
        <Text style={globalStyles.centerText}>
          Uh-Oh! Please connect your wallet to create a new Geocache.
        </Text>
        </View>
        }
        {/* {true &&  */}
        {isDeployingGeocache && 
        <View style={globalStyles.textContainer}>
          <MessageModal title={"Deploying your Geocache"} isProgress={true} resetParentState={resetState} isTransactionDelayed={isTransactionDelayed} transactionHash={transactionHash} body={"Please wait for this transaction to complete."}>
          </MessageModal>
         
        </View>
        }
        
        {hasDeployedGeocache &&
        <View style={globalStyles.textContainer}>
          <MessageModal title={"Success!"} body={"Finished deploying."} resetParentState={resetState}></MessageModal>

        </View>
        }
        {/* {hasThrownError && */}
        {errorMessage &&
          <MessageModal title={"Uh-oh!"} body={errorMessage} resetParentState={resetState}></MessageModal>
        }
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
      width: "100%"
    },
    inputContainer: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      margin: 10,
      padding: 5
    },
    formContainer: {
      // height: "100%",
      display: "flex",
      justifyContent: "flex-start",
      backgroundColor: "white",
      // padding: 15,
      borderRadius: 14,
      margin: 15,
      zIndex: 3,
      borderColor: global.primaryColor,
      borderWidth: 3
      // alignSelf: "center",
      // backgroundColor: "orange"
    },
    container: {
      height: "100%",
      display: "flex",
      justifyContent: "flex-start",
      backgroundColor: global.cream
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
      textAlign: "center",
      fontSize: 24,
      
    }
  });
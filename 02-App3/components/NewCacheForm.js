import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid, ActivityIndicator, Alert  } from "react-native";
import { CacheMetadataContext, LocationContext, Web3ProviderContext, GeocacheContractContext } from '../App';
import randomLocation from 'random-location';
const globalStyles = require("../styles")
// import { URL, URLSearchParams } from 'react-native-url-polyfill';

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
// 
// const configuration = new Configuration({
//   apiKey: OPENAI_SECRET_KEY,
// });



export default function NewCacheForm() {
    const locationContext = useContext(LocationContext)
    const providers = useContext(Web3ProviderContext)
    const GeocacheContract = useContext(GeocacheContractContext)
    const connector = useWalletConnect();

    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)
    //Alert if transaction is delayed
    const [isTransactionDelayed, setIsTransactionDelayed] = useState(false)
    const [isDeployingGeocache, setIsDeployingGeocache] = useState(false)
    const [hasDeployedGeocache, setHasDeployedGeocache] = useState(false)
    // const [hasThrownError, setHasThrownError] = useState(false)
    const [errorMessage, setErrorMessage] = useState(false)
    const [name, onChangeName] = useState("Default Name");
    const [radius, onChangeRadius] = useState(1);
    const [numItems, onChangeNumItems] = useState(5);
    let fixedRadius = 0;

    useEffect(() => {
      GeocacheContract.on("GeocacheCreated", geocacheCreatedCallback)
    })

    const geocacheCreatedCallback = (creatorAddress, geocacheName, numItems) => {
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

    const createGeocacheSubmitHandler = async () => {
      // console.log("create geocache")
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
        numItems,
        'https://gateway.pinata.cloud/ipfs/QmXgkKXsTyW9QJCHWsgrt2BW7p5csfFE21eWtmbd5Gzbjr/',
        date.toString(),
        itemLocations,
        locationContext.latitude.toString(),
        locationContext.longitude.toString(),
        // 900393223,
        radius,
        name,
        // originStory,
        {
          gasLimit: 1000000,
        }

      )
      .then((res) => {
        setIsDeployingGeocache(true)
        console.log("Success: " + JSON.stringify(res, null, 2))
      })
      .catch(error => {
        // setHasThrownError(true)
        setErrorMessage(error.message)
        setIsDeployingGeocache(false)
        console.log('Error: ' + error.message);
      });

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
        locationContext,
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
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumItems}
          // value={numItems}
          placeholder="Number of items"
          keyboardType="numeric"
        />
        <Button
          onPress={() => {generateGeocacheOriginStory()}}
          // onPress={() => {createGeocacheSubmitHandler ()}}
          title="Submit"
          color="#841584"
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
        {isDeployingGeocache && 
        <View style={globalStyles.textContainer}>
          <ActivityIndicator></ActivityIndicator>
          <Text style={globalStyles.centerText}>
            Deploying ...
          </Text>
        </View>
        }
        {hasDeployedGeocache &&
        <View style={globalStyles.textContainer}>
          <MessageModal title={"Success!"} body={"Finished deploying."}></MessageModal>

        </View>
        }
        {/* {hasThrownError && */}
        {errorMessage &&
          <MessageModal title={"Error!"} body={errorMessage}></MessageModal>
        }
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
      display: "flex",
      justifyContent: "center",
    },
    text: {
      textAlign: "center",
      fontSize: 24
    }
  });
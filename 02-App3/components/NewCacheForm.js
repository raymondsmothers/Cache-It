import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid, ActivityIndicator  } from "react-native";
import { CacheMetadataContext, LocationContext, Web3ProviderContext, GeocacheContractContext } from '../App';
import randomLocation from 'random-location';
const globalStyles = require("../styles")
// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims';
// Import the ethers library
import { ethers } from "ethers";
import { useWalletConnect } from '@walletconnect/react-native-dapp';

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
    const [name, onChangeName] = useState("Default Name");
    const [radius, onChangeRadius] = useState(1);
    const [numItems, onChangeNumItems] = useState(5);
    let fixedRadius = 0;

    useEffect(() => {
      GeocacheContract.on("GeocacheCreated", geocacheCreatedCallback)
      console.log("is connected: " + connector.connected)
    })

    const geocacheCreatedCallback = (creatorAddress, geocacheName, numItems) => {
      console.log("creatorAddress: " + creatorAddress)
      if(creatorAddress == connector.accounts[0]) {
        console.log("callback triggered")
        setIsDeployingGeocache(false)
        setHasDeployedGeocache(true)
      }
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
        {
          gasLimit: 1000000,
        }

      )
      .then((res) => {
        setIsDeployingGeocache(true)
        console.log("Success: " + JSON.stringify(res, null, 2))
      })
      .catch(error => {
        alert('Create Cache error: ' + error.message);
        console.log('Error: ' + error.message);
      });

    console.log('done');
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
    // console.log(itemLocationsFormatted)
    // for (let i = 0; i < numItems; i++) {
    //   console.log("randomLocaiton[" + i + "]....." + JSON.stringify(randomCoords[i]));
    // }
    // console.log(itemLocationsFormatted)
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
          onPress={() => {createGeocacheSubmitHandler()}}
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

          <Text style={globalStyles.centerText}>
            Finished Deploying!
          </Text> 
        </View>
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
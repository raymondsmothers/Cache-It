import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid  } from "react-native";
import { CacheMetadataContext, LocationContext, WalletConnectProviderContext, GeocacheContractContext } from '../App';
// import * as Location from 'expo-location';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import randomLocation from 'random-location';
import { json } from 'express';

// Web3 Imports
// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"

// Import the ethers library
import { ethers } from "ethers";




export default function NewCacheForm() {
    const navigation = useNavigation();
    const locationContext = useContext(LocationContext)
    const provider = useContext(WalletConnectProviderContext)
    const GeocacheContract = useContext(GeocacheContractContext)
    const [name, onChangeName] = useState("Default Name");
    const [radius, onChangeRadius] = useState(1);
    const [numItems, onChangeNumItems] = useState(5);
    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)
    let fixedRadius = 0;

    useEffect(() => {
      createGeocache()
    })

    const createGeocache = async () => {
      const ethers_provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = ethers_provider.getSigner();
      const creator = await GeocacheContract.creatorContract();
      console.log("Creator: " + creator)
      console.log("Singer: " + signer)


    }

    const generateItemLocations = () => {
        //generate numItems coordinate pairs within radius
        console.log("locationContext: " + JSON.stringify(locationContext));
        const randomCoords = Array();
        // findCoordinates();
        fixedRadius = radius * 1; //* 1609.34;
        for (let i = 0; i < numItems; i++)
        {
          let coord = randomLocation.randomCirclePoint(locationContext, fixedRadius);
          randomCoords.push(coord);        
        }

        for (let i = 0; i < numItems; i++) {
          console.log("randomLocaiton[" + i + "]....." + JSON.stringify(randomCoords[i]));
        }

        return randomCoords;
    };

    const submitHandler = async () => {
      fixedRadius = radius * 1; //* 1609.34;

      console.log("fixedRadius: " + fixedRadius);
      console.log("name: " + name);
      console.log("numItems: " + numItems);
      console.log("radius: " + radius);

      const itemLocations = generateItemLocations();
      // navigation.navigate("CacheMap", {
      //   cacheName: {name},
      //   numberOfItems: {numItems},
      //   cacheRadius: {fixedRadius},
      //   cacheLocations: {itemLocations}
      // });
      setCacheMetadata({
        "name": name,
        "numberOfItems": numItems,
        "radius": fixedRadius,
        "geolocations": itemLocations
      })
    };

    return (
      <SafeAreaView>
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
          onPress={() => {submitHandler()}}
          title="Submit"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
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
  });
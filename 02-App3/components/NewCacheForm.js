import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid  } from "react-native";
import { CacheMetadataContext, LocationContext, Web3ProviderContext, GeocacheContractContext } from '../App';
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
import * as CONTRACT_ADDRESSES from '../contract_info/contractAddressesGoerli';
import  GeocacheJSON from '../contract_info/goerliAbis/Geocache.json';


export default function NewCacheForm() {
    const navigation = useNavigation();
    const locationContext = useContext(LocationContext)
    const providers = useContext(Web3ProviderContext)
    const GeocacheContract = useContext(GeocacheContractContext)
    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)

    const [name, onChangeName] = useState("Default Name");
    const [radius, onChangeRadius] = useState(1);
    const [numItems, onChangeNumItems] = useState(5);
    let fixedRadius = 0;

    useEffect(() => {
      // console.log("providers: " + providers.walletConnect)
      // createGeocache()
      // generateItemLocations()
      const getData = async () => {
        
        var firstGeocache = await GeocacheContract.tokenIdToGeocache(1);
        var firstGeocacheLocations = await GeocacheContract.getGeolocationsOfGeocache(1);
        console.log("first geocache: " + JSON.stringify(firstGeocache, null, 2))
        console.log("first geocache gelocaitons: " + firstGeocacheLocations)
      }
      getData()
    })

    const createGeocacheSubmitHandler = async () => {
      console.log("create geocache")
      const itemLocations = generateItemLocations();
      await providers.walletConnect.enable();
      const ethers_provider = new ethers.providers.Web3Provider(providers.walletConnect);

      const signer = await ethers_provider.getSigner();
      console.log("Signer: " + signer)
      // const GeocacheContract = new ethers.Contract(
      //   CONTRACT_ADDRESSES.Geocache,
      //   GeocacheJSON.abi,
      //   signer
      // );

      const geocacheContractWithSigner = await GeocacheContract.connect(signer);


      var creator = await GeocacheContract.creatorContract();
      console.log("Creator: " + creator)



      const date = new Date(Date.now()).toLocaleString()
      // console.log("Date: " + date.toString)

      const createGeocacheTxn = await geocacheContractWithSigner.newGeocache(
        numItems,
        "https://gateway.pinata.cloud/ipfs/QmXgkKXsTyW9QJCHWsgrt2BW7p5csfFE21eWtmbd5Gzbjr/",
        date.toString(),
        itemLocations,
        locationContext.latitude.toString(),
        locationContext.longitude.toString(),
        // 900393223,
        radius,
        name,   
        {
          gasLimit: 10000000,
        }

      )
      .then((res) => {
        console.log("Success: " + JSON.stringify(res, null, 2))
      })
      .catch((error) => {
        alert("Create Cache error: " + error.message);
        console.log("Error: " + error.message)
      });

      console.log("done")




    }

    const generateItemLocations = () => {
        //generate numItems coordinate pairs within radius
        // console.log("locationContext: " + JSON.stringify(locationContext));
        const randomCoords = Array();
        // findCoordinates();
        fixedRadius = radius * 1; //* 1609.34;
        for (let i = 0; i < numItems; i++)
        {
          let coord = randomLocation.randomCirclePoint(locationContext, fixedRadius);
          randomCoords.push(coord);        
        }

        //Formatting item locations to be a list of string tuples
        var itemLocationsFormatted = [];
        randomCoords.map((coord, index) => {
          itemLocationsFormatted[index] = coord.latitude + "," + coord.longitude
        })
        // console.log(itemLocationsFormatted)
        // for (let i = 0; i < numItems; i++) {
        //   console.log("randomLocaiton[" + i + "]....." + JSON.stringify(randomCoords[i]));
        // }
        // console.log(itemLocationsFormatted)
        return itemLocationsFormatted;
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
        "geolocations": itemLocations,

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
          onPress={() => {createGeocacheSubmitHandler()}}
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
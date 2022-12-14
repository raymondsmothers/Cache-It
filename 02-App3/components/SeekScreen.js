import React, {useContext, useState, useMemo, useEffect, useCallback} from 'react';
import {Text, StyleSheet, View, ActivityIndicator} from 'react-native';
import ARvision from './ARvision';
import Geolocation from 'react-native-geolocation-service';
const globalStyles = require("../styles");

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {CacheMetadataContext, Web3ProviderContext, LocationContext} from '../App';
import {CACHEIT_PRIVATE_KEY} from '@env';
import {ethers} from 'ethers';
import { ConnectorEvents, useWalletConnect } from '@walletconnect/react-native-dapp';
// import { useWalletConnect } from '@walletconnect/react-native-dapp';
import "../global";
const DISTANCE_THRESHOLD = 40
//Component imports
import  AnimatedRings from "./AnimatedRing"
// import TriviaModal from './TriviaModal';
import SelectGeocache from './SelectGeocache';
import PleaseConnect from './PleaseConnect';

// export const PulseRateContext = React.createContext({});
export const PulseRateContext = React.createContext({
  pulseStrength: {},
  setPulseStrength: () => {},
});




const AnimatedRing = React.memo(AnimatedRings)

export default function SeekScreen() {
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);
  
  const {currentPosition, setCurrentPosition} = useContext(LocationContext);
  const connector = useWalletConnect();

  //Coordinates of the nearest geocache item
  const [nearestItemCoords, setNearestItemCoords] = useState([]);
  //Bool of if the user has succesfully come within proximity of geocache item to trigger AR vision
  // this is to stop the bug of the SeekScreen flipping too quickly back and forth AR Vision of pulse indicator and causing app to crash
  const [hasTriggeredARVision, setHasTriggeredARVision] = useState();
  //Distance in degrees to nearest item
  // I don't think you need to update this in state? it causes a rerender too frequently
  const [distanceToNearestItem, setDistancetoNearestItem] = useState(undefined);
  //sets pulse duration, 1 is strongest, 20 is weakest
  const [pulseStrength, setPulseStrength] = useState(20);
  PulseRateContextValue = {pulseStrength, setPulseStrength};


  //Test useEffect
  // useEffect(() => {
  // for(i = 0; i < 10; i++) {
  //   const interval1 = setInterval( async () => {
  //     setPulseStrength(Math.random() * 20)
  //   }, 10000);
  //   const interval = setInterval( async () => {
  //     setDistancetoNearestItem(Math.random() + 200)
  //   }, 1000);
  // }
  // }, [])

  //Every second check
  useEffect(() => {
    findInitialCoordinates();
    updateCoordinates();
  }, []);

  useEffect(() => {
    calculateShortestDistance({
      latitude: currentPosition.latitude,
      longitude: currentPosition.longitude,
      latitudeDelta: global.latDelta,
      longitudeDelta: global.longDelta,
    });
  }, [currentPosition]);

  const calculateShortestDistance = async currentPosition => {
    //get coords
    // console.log("metadata in seek: " + JSON.stringify(cacheMetadata, null, 2))
    // const coords = getItemCoords()
    //reset during every check
    var shortestHyp = 1000000;
    var shortestHypCoords = {};
    await cacheMetadata?.geolocations.forEach(crd => {
      //for each coords
      //calculate hypotenuse
      const latDelta = Math.abs(currentPosition?.latitude - crd.latitude);
      const longDelta = Math.abs(currentPosition?.longitude - crd.longitude);
      const hyp = Math.sqrt(latDelta * latDelta + longDelta * longDelta);
      //set new coords and nearestItem if shorter than current shortestCoord
      if (hyp < shortestHyp) {
        shortestHyp = hyp;
        shortestHypCoords = crd;
      }
    });
    const shortestHypInMeters = shortestHyp * 111 * 1000;
    var newPulseStrength = Math.ceil(
      Math.min(shortestHypInMeters / 25, 20),
    );
    //Only update pulsestrength if it changes, to avoid rerendering circle2
    if(newPulseStrength != pulseStrength)
      setPulseStrength(newPulseStrength);

    setNearestItemCoords(shortestHypCoords);
    setDistancetoNearestItem(shortestHypInMeters);
    if(shortestHypInMeters <= DISTANCE_THRESHOLD)
        setHasTriggeredARVision(true);
  };

  // //Grabs Location
  // TODO we really should have a useContext hook that updates the LocationContext across the whole app, can change later
  const updateCoordinates = async () => {
    //May be able to use watchPosition here instead
    const watcher = await Geolocation.watchPosition(
      position => {
        const crd = position.coords;
        setCurrentPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
        });
        // calculateShortestDistance({
        //   latitude: crd.latitude,
        //   longitude: crd.longitude,
        //   latitudeDelta: global.latDelta,
        //   longitudeDelta: global.longDelta,
        // });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      //Will only update location if the user moves more than 3 meters
      {
        interval: 1500,
        distanceFilter: 2,
        enableHighAccuracy: true,
        timeout: 150000,
        maximumAge: 0,
      },
    );
  };

  const findInitialCoordinates = async () => {
    await Geolocation.getCurrentPosition(
      position => {
        const crd = position.coords;
        // console.log(position);
        setCurrentPosition({
          latitude: crd.latitude,
          longitude: crd.longitude,
        });
        // calculateShortestDistance({
        //   latitude: crd.latitude,
        //   longitude: crd.longitude,
        //   latitudeDelta: global.latDelta,
        //   longitudeDelta: global.longDelta,
        // });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 100000},
    );
  };

  return connector.connected ? (
    cacheMetadata == undefined || cacheMetadata?.imgUrl == "" ? (
      // true ? (
        <View style={styles.container}>
        <Text style={globalStyles.titleText}>Please select a geocache to use Seek!</Text>
        <SelectGeocache style={{position: 'absolute', bottom: 95}} />

      </View>

    ) : (
      distanceToNearestItem ? (
        // true ? (
        distanceToNearestItem <= DISTANCE_THRESHOLD || hasTriggeredARVision ? (
              //Maybe we show AR Vision when they are within 0.01, then only allow dragging of ar object when they are within 0.001? So they can move closer to a visible AR object?
              <ARvision coord={nearestItemCoords}></ARvision>         
        ) : (
          <View style={styles.container}>

              <View style={styles.cacheNameContainer}>
                <Text style={styles.cacheNameText}>{"Searching: \"" + cacheMetadata?.name + "\""}</Text>
              </View>
            <View style={styles.textContainer}>
              <Text style={[globalStyles.centerText, {fontWeight: "bold"}]}>
                {'Created by:'}
              </Text>
              <Text style={globalStyles.centerText}>
                {global.shortenAddress(cacheMetadata?.creator)}
              </Text>
            </View>
            <View style={styles.textContainer}>
            <Text style={[globalStyles.centerText, {fontWeight: "bold"}]}>
                {'Created On:'}
              </Text>
              <Text style={globalStyles.centerText}>
                {cacheMetadata?.date}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[globalStyles.centerText, {fontWeight: "bold"}]}>
                {'Number of item locations:'}
              </Text>
              <Text style={globalStyles.centerText}>
                {cacheMetadata?.numberOfItems}
              </Text>

            </View>
            {/* <View style={styles.textContainer}> */}
            <View >
              <Text style={[globalStyles.centerText, {fontWeight: "bold"}]}>
                {'Radar:'}
              </Text>
            </View>

            {/* <Text style={globalStyles.titleText}>
              {' '}
              {'Pulse Strength: \n' + pulseStrength}{' '}
            </Text> */}
            <AnimatedRing pulseStrength={pulseStrength}></AnimatedRing>
        
            <Text style={globalStyles.titleText}>
              {' '}
              {'Distance to nearest item: \n' + distanceToNearestItem.toFixed(2) + ' Meters'}{' '}
            </Text>
          </View>
        )
      ) : (
        <View style={styles.container}>
          <Text style={styles.text}>Finding Nearest Item...</Text>
        </View>
      )
    )
  ) : (
    <View style={styles.container}>
      <PleaseConnect msg={" search a geocache. "}></PleaseConnect>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    textAlign: 'center',
    padding: 20,
  },
  textContainer: {
    width: "80%",
    padding: 5,
    marginBottom: 5,
    borderBottomWidth: 1,
    // borderTopWidth: 1,
    borderBottomColor: global.primaryColor
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: global.cream
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: 'tomato',
    borderWidth: 10,
  },
  cacheNameContainer: {
    // position: "absolute", 
    // flex: 1,
    // justifyContent: "center",
    // top: 10, 
    // left: "25%",
    // opacity: 2, 
    // zIndex: 4
  },
  cacheNameText: {
    color: global.cream,
    fontSize: 20, 
    backgroundColor: global.secondaryColor, 
    textAlign: "center", 
    padding: 10, 
    borderRadius: 5
  }
});

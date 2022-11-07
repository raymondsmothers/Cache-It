import React, {useContext, useState, useEffect} from 'react';
import {Text, StyleSheet, View} from 'react-native';
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
import {CacheMetadataContext, Web3ProviderContext} from '../App';
import {CACHEIT_PRIVATE_KEY} from '@env';
import {ethers} from 'ethers';

export default function SeekScreen() {
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);

  //Coordinates of the nearest geocache item
  const [nearestItemCoords, setNearestItemCoords] = useState([]);
  //Bool of if the user has succesfully come within proximity of geocache item to trigger AR vision
  // this is to stop the bug of the SeekScreen flipping too quickly back and forth AR Vision of pulse indicator and causing app to crash
  const [hasTriggeredARVision, setHasTriggeredARVision] = useState(false);
  //Distance in degrees to nearest item
  const [distanceToNearestItem, setDistancetoNearestItem] = useState(undefined);
  //sets pulse duration, 1 is strongest, 20 is weakest
  const [pulseStrength, setPulseStrength] = useState(20);
  // Signer to pass into ARVision
  const [signer, setSigner] = useState(null);
  // Provider context
  const providers = useContext(Web3ProviderContext);

  const Ring = ({delay, duration}) => {
    const ring = useSharedValue(0);

    const ringStyle = useAnimatedStyle(() => {
      return {
        opacity: 0.8 - ring.value,
        transform: [
          {
            scale: interpolate(ring.value, [0, 1], [0, 4]),
          },
        ],
      };
    });
    useEffect(() => {
      ring.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: duration,
          }),
          -1,
          false,
        ),
      );
    }, []);
    return <Animated.View style={[styles.ring, ringStyle]} />;
  };

  //Every second check
  useEffect(() => {
    findInitialCoordinates();
    // const interval = setInterval( async () => {
    updateCoordinates();
    // calculateShortestDistance()
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cacheMetadata) {
    }
  }, [cacheMetadata]);

  // Setting our signer for ARVision (CacheIt wallet)
  useEffect(() => {
    const createSigner = async () => {
      await providers.walletConnect.enable();
      const ethers_provider = new ethers.providers.Web3Provider(
        providers.walletConnect,
      );

      const cacheitSigner = new ethers.Wallet(
        //not the actual key
        "8c900f09ea421767b2cdb2b44750c51b67d55ec086a7d5ae3bbcfa442dd00000",
        // CACHEIT_PRIVATE_KEY,
        ethers_provider,
      );

      setSigner(cacheitSigner);
    };
    createSigner();
  }, []);

  const getItemCoords = () => {
    var coords = [];
    coords.push({latitude: 39.6519, longitude: -90.2934});
    coords.push({latitude: 38.6483634, longitude: -90.3118004});
    coords.push({latitude: 38.6480908, longitude: -90.3118779});
    coords.push({latitude: 38.6486215, longitude: -90.3112989});
    return coords;
  };

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

        //convert distance to meters
        // 111 kms is ~ 1 arc of longitude or lat
        const shortestHypInMeters = shortestHyp * 111 * 1000;
        // console.log("shortesthypinmetesr " + shortestHypInMeters)
        //If user is within 50 meters, pulse we be at max
        //If user is more than 1 km away, pulse will be at min
        // A change of 25 meters closer will increase the pulseStrength
        // const newPulseStrength = Math.ceil(Math.min(1000 / shortestHypInMeters, 20))
        const newPulseStrength = Math.ceil(
          Math.min(shortestHypInMeters / 25, 20),
        );
        setPulseStrength(newPulseStrength);

        setNearestItemCoords(shortestHypCoords);
        setDistancetoNearestItem(shortestHypInMeters);
        setHasTriggeredARVision(shortestHypInMeters <= 10);
      }
    });
  };

  // //Grabs Location
  // TODO we really should have a useContext hook that updates the LocationContext across the whole app, can change later
  const updateCoordinates = async () => {
    //May be able to use watchPosition here instead
    const watcher = await Geolocation.watchPosition(
      position => {
        const crd = position.coords;
        calculateShortestDistance({
          latitude: crd.latitude,
          longitude: crd.longitude,
          latitudeDelta: global.latDelta,
          longitudeDelta: global.longDelta,
        });
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
        calculateShortestDistance({
          latitude: crd.latitude,
          longitude: crd.longitude,
          latitudeDelta: global.latDelta,
          longitudeDelta: global.longDelta,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 100000},
    );
  };

  return cacheMetadata ? (
    distanceToNearestItem ? (
      distanceToNearestItem > 10 && !hasTriggeredARVision ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.text}>
            {' '}
            {'Searching "' + cacheMetadata.name + '"'}{' '}
          </Text>
          <Text style={styles.subtitle}>
            {' '}
            {'Created by:  "' + cacheMetadata.creator + '"'}{' '}
          </Text>
          <Text style={styles.subtitle}>
            {' '}
            {'Created On:  "' + cacheMetadata.date + '"'}{' '}
          </Text>

          <Text style={styles.text}>
            {' '}
            {'Pulse Strength: \n' + pulseStrength}{' '}
          </Text>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Ring duration={1000 * pulseStrength} delay={0} />
            <Ring duration={1000 * pulseStrength} delay={500 * pulseStrength} />
            <Ring duration={1000 * pulseStrength} delay={250 * pulseStrength} />
            <Ring duration={1000 * pulseStrength} delay={750 * pulseStrength} />
          </View>
          <Text style={styles.text}>
            {' '}
            {'Distance: \n' + distanceToNearestItem.toFixed(2) + ' Meters'}{' '}
          </Text>
        </View>
      ) : (
        //Maybe we show AR Vision when they are within 0.01, then only allow dragging of ar object when they are within 0.001? So they can move closer to a visible AR object?
        <ARvision></ARvision>
      )
    ) : (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.text}>Grabbing Location...</Text>
      </View>
    )
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={styles.text}>Please select a geocache to use Seek!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    textAlign: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    padding: 20,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: 'tomato',
    borderWidth: 10,
  },
});

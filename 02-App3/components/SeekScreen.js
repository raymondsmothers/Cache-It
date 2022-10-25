import React, {useContext, useState, useEffect} from 'react';
import { Text, StyleSheet, View } from 'react-native';
import ARvision from './ARvision';
import Geolocation from 'react-native-geolocation-service';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LocationContext } from '../App';




export default function SeekScreen() {
    const [nearestItemCoords, setNearestItemCoords] = useState([])
    const locationContext = useContext(LocationContext)

    //Distance in degrees to nearest item
    const [distanceToNearestItem, setDistancetoNearestItem] = useState(undefined)
    //sets pulse duration, 1 is strongest, 20 is weakest
    const [pulseStrength, setPulseStrength] = useState(20)


    const Ring = ({ delay, duration }) => {
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
            false
          )
        );
      }, []);
      return <Animated.View style={[styles.ring, ringStyle]} />;
    };

    const getItemCoords = () => {
        var coords = []
        coords.push({"latitude":38.6519000,"longitude":-90.293400})
        coords.push({"latitude":38.6490389,"longitude": -90.3035856})
        coords.push({"latitude":38.6485423,"longitude": -90.3056161})
        coords.push({"latitude":38.6485022,"longitude": -90.3136965})
        coords.push({"latitude":39.0889472,"longitude": -77.0768896})
        coords.push({"latitude":39.1168605,"longitude": -77.2045929})
        coords.push({"latitude":39.1140253,"longitude": -77.2006334})
        // coords.push({"latitude":39.1141380,"longitude": -77.1991250})

        // coords.push({"latitude":38.6519515,"longitude":-90.2934257})
        // coords.push({"latitude":38.6519594,"longitude":-90.2934463})
        return coords
    }


    const calculateShortestDistance = async (currentPosition) => {
        //get coords
        const coords = getItemCoords()
        //reset during every check
        var shortestHyp = 1000000
        var shortestHypCoords = {}
        await coords.forEach(crd => {
            //for each coords
            //calculate hypotenuse
            const latDelta = Math.abs(currentPosition?.latitude - crd.latitude)
            const longDelta = Math.abs(currentPosition?.longitude - crd.longitude)
            const hyp = Math.sqrt(latDelta * latDelta + longDelta * longDelta)
            //set new coords and nearestItem if shorter than current shortestCoord
            if(hyp < shortestHyp) {
                shortestHyp = hyp
                shortestHypCoords = crd
                
                //convert distance to meters
                // 111 kms is ~ 1 arc of longitude or lat
                const shortestHypInMeters = shortestHyp * 111 * 1000;
                console.log("shortesthypinmetesr " + shortestHypInMeters)
                //If user is within 50 meters, pulse we be at max
                //If user is more than 1 km away, pulse will be at min 
                // A change of 25 meters closer will increase the pulseStrength
                // const newPulseStrength = Math.ceil(Math.min(1000 / shortestHypInMeters, 20))
                const newPulseStrength = Math.ceil(Math.min(shortestHypInMeters / 25, 20))
                setPulseStrength(newPulseStrength)
                
                setNearestItemCoords(shortestHypCoords)
                setDistancetoNearestItem(shortestHypInMeters)
            }
        });
    }

    //Immediately calculate initial shortest distance using location context
    useEffect(() => {
      calculateShortestDistance(locationContext)
    }, [])

    //Every second check
    useEffect(() => {
        // const interval = setInterval( async () => {
            findCoordinates()
            // calculateShortestDistance()
        // }, 1000);

        // return () => clearInterval(interval); 
      }, [])


    // //Grabs Location
    const findCoordinates = async () => {
        //May be able to use watchPosition here instead 
        const watcher = await Geolocation.watchPosition(
            (position) => {
              const crd = position.coords;
              calculateShortestDistance({
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: global.latDelta,
                longitudeDelta: global.longDelta,
              })

            },
            (error) => {
              // See error code charts below.
              console.log(error.code, error.message);
            },
            //Will only update location if the user moves more than 3 meters
            { interval: 1000, distanceFilter: 3, enableHighAccuracy: true, timeout: 150000, maximumAge: 0 }
        );
  };

    return (
        // (true) ? (
        (distanceToNearestItem > 20 && distanceToNearestItem) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.text}>Seek Screen </Text>
              <Text style={styles.text}> {"pulseStrength: \n" + pulseStrength}  </Text>
              {/* <Text style={styles.text}> {"Closest Coordinate: \n" + JSON.stringify(nearestItemCoords, null, 2)}  </Text> */}
              {/* <View style={styles.container}> */}
              {/* <Pulse color={'#bbb'} numPulses={Math.ceil(Math.min(10 / distanceToNearestItem, 10))} /> */}
              {/* </View> */}
              {/* <AnimatedRingExample pulseRate={Math.ceil(Math.min(10 / distanceToNearestItem, 10))}></AnimatedRingExample> */}
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Ring duration={1000 * pulseStrength} delay={0} />
                <Ring duration={1000 * pulseStrength} delay={500 * pulseStrength} />
                <Ring duration={1000 * pulseStrength} delay={250 * pulseStrength} />
                <Ring duration={1000 * pulseStrength} delay={750 * pulseStrength} />
              </View>
              <Text style={styles.text}> {"Distance: \n" + distanceToNearestItem + " Meters"}  </Text>
          </View>
        ) : (
            //Maybe we show AR Vision when they are within 0.01, then only allow dragging of ar object when they are within 0.001? So they can move closer to a visible AR object?

            <ARvision></ARvision>
        )
    );
  }

  const styles = StyleSheet.create({
    text: {
      fontSize: 20,
      textAlign: 'center',
      padding: 20
    },
    ring: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      borderColor: "tomato",
      borderWidth: 10,
    },
  });
  
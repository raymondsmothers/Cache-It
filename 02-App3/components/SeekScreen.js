import { useFocusEffect } from '@react-navigation/native';
import React, {useContext, useState, useEffect} from 'react';
import { Text, StyleSheet, View } from 'react-native';
import ARvision from './ARvision';
// import { LocationContext } from '../App';
import Geolocation from 'react-native-geolocation-service';
import { LocationContext } from '../App';

export default function SeekScreen() {
    // const locationContext = useContext(LocationContext)
    const [nearestItemCoords, setNearestItemCoords] = useState([])
    const [distanceToNearestItem, setDistancetoNearestItem] = useState(10000000000)
    // const [currentPosition, setCurrentPosition] = useState(useContext(LocationContext));
    // const [currentPosition, setCurrentPosition] = useState({
    //     'latitude': 0,
    //     'longitude': 0,
    // });

    const getItemCoords = () => {
        var coords = []
        coords.push({"latitude":38.6519000,"longitude":-90.293400})
        // coords.push({"latitude":38.6519515,"longitude":-90.2934257})
        // coords.push({"latitude":38.6519594,"longitude":-90.2934463})
        return coords
    }


    const calculateShortestDistance = async (currentPosition) => {
        //get coords
        console.log("printing distance")
        const coords = getItemCoords()
        //reset during every check
        // setDistancetoNearestItem(100000000)
        var shortestHyp = 1000000
        var shortestHypCoords = {}
        await coords.forEach(crd => {
            //for each coords
            //calculate hypotenuse
            const latDelta = Math.abs(currentPosition?.latitude - crd.latitude)
            const longDelta = Math.abs(currentPosition?.longitude - crd.longitude)
            const hyp = Math.sqrt(latDelta * latDelta + longDelta * longDelta)
            console.log("hyp: " + hyp)
            //set new coords and nearestItem if shorter than current shortestCoord
            if(hyp < shortestHyp) {
                console.log("in here")
                shortestHyp = hyp
                shortestHypCoords = crd
                
                setNearestItemCoords(shortestHypCoords)
                setDistancetoNearestItem(shortestHyp)
                // setDistancetoNearestItem(hyp)
                // setNearestItemCoords(crd)
            }
        });
        // setDistancetoNearestItem(shortestHyp)
        // setNearestItemCoords(shortestHypCoords)
        // console.log("Nearest point: " + JSON.stringify(nearestItemCoords))
        // console.log("distance to nearest point: " + distanceToNearestItem)
    }

    //calculateShortestDiatance every 1 seconds
    // useEffect(() => {
    //     refreshDistanceCalculation()
    // })

    const MINUTE_MS = 60000;

    useEffect(() => {
        const interval = setInterval( async () => {
            // console.log('Logs every few seconds');
            await findCoordinates()
            calculateShortestDistance()
        }, 1000);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])


    // //Grabs Location
    const findCoordinates = async () => {
        //May be able to use watchPosition here instead 
        await Geolocation.getCurrentPosition(
            (position) => {
              const crd = position.coords;
                // console.log(position);
                //   setCurrentPosition({
                //     latitude: crd.latitude,
                //     longitude: crd.longitude,
                //     latitudeDelta: global.latDelta,
                //     longitudeDelta: global.longDelta,
                //   });
              calculateShortestDistance({
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: global.latDelta,
                longitudeDelta: global.longDelta,
              })
            //   console.log("current location: " +  JSON.stringify(currentPosition, null, 2) )

            },
            (error) => {
              // See error code charts below.
              console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 150000, maximumAge: 0 }
        );
  };

    return (
        //TODO this logic doesn't work, we may need a isLoading 
        (distanceToNearestItem > 0.000085 && distanceToNearestItem != 100000000) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.text}>Seek Screen </Text>
            <Text style={styles.text}> {"Closest Coordinate: \n" + JSON.stringify(nearestItemCoords, null, 2)}  </Text>
            <Text style={styles.text}> {"Distance: \n" + distanceToNearestItem}  </Text>
            {/* <Text style={styles.text}> {"Current Location: \n" + JSON.stringify(currentPosition, null, 2)}  </Text> */}
          </View>
        ) : (
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
  });
  
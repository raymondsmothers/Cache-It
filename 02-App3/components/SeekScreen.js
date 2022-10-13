import React, {useContext, useState, useEffect} from 'react';
import { Text, StyleSheet, View } from 'react-native';
import ARvision from './ARvision';
import Geolocation from 'react-native-geolocation-service';

export default function SeekScreen() {
    const [nearestItemCoords, setNearestItemCoords] = useState([])
    const [distanceToNearestItem, setDistancetoNearestItem] = useState(10000000000)


    const getItemCoords = () => {
        var coords = []
        coords.push({"latitude":38.6519000,"longitude":-90.293400})
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
                
                setNearestItemCoords(shortestHypCoords)
                setDistancetoNearestItem(shortestHyp)
            }
        });
    }

    useEffect(() => {
        const interval = setInterval( async () => {
            await findCoordinates()
            calculateShortestDistance()
        }, 1000);

        return () => clearInterval(interval); 
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
            { interval: 1000, distanceFilter: 3, enableHighAccuracy: true, timeout: 150000, maximumAge: 0 }
        );
  };

    return (
        (distanceToNearestItem > 0.0001 && distanceToNearestItem != 100000000) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.text}>Seek Screen </Text>
            <Text style={styles.text}> {"Closest Coordinate: \n" + JSON.stringify(nearestItemCoords, null, 2)}  </Text>
            <Text style={styles.text}> {"Distance: \n" + distanceToNearestItem}  </Text>
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
  });
  
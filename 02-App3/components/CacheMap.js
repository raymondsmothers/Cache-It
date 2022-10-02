import React, {useState, useEffect} from 'react';
import { View, Text, PermissionsAndroid, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE }  from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function CacheMap() {
    const [mapRef, setMapRef] = useState();
  // const [initialPosition, setInitialPosition] = useState({})
    const [hasLocationPermission, setHasLocationPermission] = useState(false)
    const [initialPosition, setInitialPosition] = useState({
      latitude: 10,
      longitude: 10,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  
    useEffect(() => {
      if (hasLocationPermission) {
        console.log("has permmision")
        // requestLocationPermission()
        Geolocation.getCurrentPosition(
          (position) => {
            const crd = position.coords;
            // console.log(position);
            setInitialPosition({
              latitude: crd.latitude,
              longitude: crd.longitude,
              latitudeDelta: 0.421,
              longitudeDelta: 0.421,
            });
            mapRef.setCamera({
              center: {
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: 0.421,
                longitudeDelta: 0.421,
              },
              zoom: 15,
          }, {duration: 2000});

          },
          (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );


      }
      else {
        requestLocationPermission();
      }
    }, [hasLocationPermission]);


      async function requestLocationPermission() 
      {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              'title': 'Example App',
              'message': 'Example App access to your location '
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the location")
            // alert("You can use the location");
            setHasLocationPermission(true)
          } else {
            console.log("location permission denied")
            // alert("Location permission denied");
          }
        } catch (err) {
          console.warn(err)
        }
      }
      


    const styles = StyleSheet.create({
        container: {
          ...StyleSheet.absoluteFillObject,
        //   height: 400,
          width: 400,
          justifyContent: 'flex-end',
          alignItems: 'center',
        },
        map: {
          ...StyleSheet.absoluteFillObject,
        },
       });

    return (
        <View style={styles.container}>

            <MapView
              ref={map => {setMapRef(map)}}
             provider={PROVIDER_GOOGLE} // remove if not using Google Maps
             style={styles.map}
             followsUserLocation={true}
             showsUserLocation={true}
             showsMyLocationButton={true}
            />
           </View>

    );
  }
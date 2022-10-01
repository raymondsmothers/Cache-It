import React, {useState, useEffect} from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid  } from "react-native";
// import * as Location from 'expo-location';
import Geolocation from 'react-native-geolocation-service';


const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});


export default function NewCacheForm() {
    const [name, onChangeName] = useState("Default Name");
    const [radius, onChangeRadius] = useState(1);
    const [numItems, onChangeNumItems] = useState(5);
  
    useEffect(() => {
        // Update the document title using the browser API
        requestLocationPermission()
        findCoordinates();
    });


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
        } else {
          console.log("location permission denied")
          // alert("Location permission denied");
        }
      } catch (err) {
        console.warn(err)
      }
    }
    
    // //Grabs Location
    const findCoordinates = async () => {
          Geolocation.getCurrentPosition(
              (position) => {
                console.log(position);
              },
              (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
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
          placeholder="Radius (Miles)"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumItems}
          // value={numItems}
          placeholder="Number of items"
          keyboardType="numeric"
        />
      </SafeAreaView>
    );
  }
  
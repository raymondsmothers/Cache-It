import React, {useState, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
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
    const [currentPosition, setCurrentPosition] = useState();


    useEffect(() => {
        // Update the document title using the browser API
        requestLocationPermission()
        findCoordinates();
        // generateItemLocations();
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
          // console.log("You can use the location")
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
          await Geolocation.getCurrentPosition(
              (position) => {
                const crd = position.coords;
            // console.log(position);
                setCurrentPosition({
                  latitude: crd.latitude,
                  longitude: crd.longitude,
                  latitudeDelta: 0.421,
                  longitudeDelta: 0.421,
                });
              },
              (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
    };

    const generateItemLocations = async () => {
        //generate numItems coordinate pairs within radius
        // const currentPosition =  await findCoordinates;
        console.log("currentPosition: " + JSON.stringify(currentPosition));
        var randomCoords = [];
        for(var i = 0; i < numItems; i++) {
          //generate rannum * radius for delta lat and delta long

          var latDelta = (Math.random() - 0.5) * radius * (1 / 60); //1 / 60 of a degree = 1 mile
          var longDelta = (Math.random() - 0.5) * radius * (1 / 60);
          console.log("latd: " + latDelta)
          //ensure hypotenuse is less than radius, otherwise generate again
          if(Math.sqrt(latDelta * latDelta + longDelta * longDelta) > radius) {
            i--;
          }
          else {
              randomCoords[i] = [currentPosition.latitude + latDelta, currentPosition.longitude + longDelta];
              console.log("Coords " + i + ": " + randomCoords[i]);
          }
        }
        return randomCoords;
    }

    const submitHandler = async () => {
      console.log("name: " + name);
      console.log("numItems: " + numItems);
      console.log("radius: " + radius);
      const birthdate = Date.now();
      console.log("Birthday: " + birthdate);
      const itemLocations = generateItemLocations();


    }


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
        <Button
          onPress={() => {submitHandler()}}
          title="Submit"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </SafeAreaView>
    );
  }
  
import React, {useState, useContext, useEffect} from 'react';
import { RecyclerViewBackedScrollViewComponent, Text, View, Button } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput, PermissionsAndroid  } from "react-native";
import { LocationContext } from '../App';
// import * as Location from 'expo-location';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import randomLocation from 'random-location';


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
    let fixedRadius = 0;

    const navigation = useNavigation();
    // const [currentPosition, setCurrentPosition] = useState();
    const locationContext = useContext(LocationContext)




    const generateItemLocations = async () => {
        //generate numItems coordinate pairs within radius
        // const currentPosition =  await findCoordinates;
        console.log("currentPosition: " + JSON.stringify(locationContext));
        const randomCoords = Array();
        // findCoordinates();
        fixedRadius = radius * 1609.34;
        for (let i = 0; i < numItems; i++)
        {
          let coord = randomLocation.randomCirclePoint(locationContext, fixedRadius);
          randomCoords.push(coord);        
        }

        return randomCoords;
    };

    const submitHandler = async () => {
      console.log("name: " + name);
      console.log("numItems: " + numItems);
      console.log("radius: " + radius);
      const birthdate = Date.now();
      console.log("Birthday: " + birthdate);
      const itemLocations = generateItemLocations();
      fixedRadius = radius * 1609.34;
      console.log("fixedRadius: " + fixedRadius);
      navigation.navigate("CacheMap", {
        cacheName: {name},
        numberOfItems: {numItems},
        cacheRadius: {fixedRadius},
        cacheLocations: {itemLocations}
      });
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
        <Button
          onPress={() => {submitHandler()}}
          title="Submit"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </SafeAreaView>
    );
  }
  
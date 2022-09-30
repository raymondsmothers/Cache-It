import React, {useState, useEffect} from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
// import * as Location from 'expo-location';


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
  
    // useEffect(() => {
    //     // Update the document title using the browser API
    //     this.findCoordinates();
    // });
    
    // //Grabs Location
    // findCoordinates = async () => {
    //     //Are the coordinates always gonna be where the person is?
    //     //Maybe they drag a pin where it will be?
    //     await Location.getCurrentPositionAsync({
    //         accuracy: 4
    //     }).then(	position => {
    //         //const currentLocation = JSON.stringify(position);
    //         this.setState({ location : position});
    //     });
    // };
    return (
      <SafeAreaView>
        <TextInput
          style={styles.input}
          onChangeText={onChangeName}
          placeholder="Name"
          value={name}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeRadius}
          value={radius}
          placeholder="Radius (Miles)"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumItems}
          value={numItems}
          placeholder="Number of items"
          keyboardType="numeric"
        />
      </SafeAreaView>
    );
  }
  
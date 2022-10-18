import * as React from 'react';
import { Text, View , Button, StyleSheet} from 'react-native';
import ARvision from './ARvision';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const introtab = createMaterialTopTabNavigator();


const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 20,
  },
});

function Intropage1 () {
  return (
    <View style={{ flex: 2}}>
          <Text>Step1</Text>
          </View>
  )
}
function Intropage2 () {
  return (
    <View style={{ flex: 2}}>
          <Text>Step2</Text>
          </View>
  )
}
function Intropage3 () {
  return (
    <View style={{ flex: 2}}>
          <Text>Step3</Text>
          </View>
  )
}
function Intropage4 () {
  return (
    <View style={{ flex: 2}}>
          <Text>Step4</Text>
          </View>
  )
}
export default function IntroductionPage() {
    return (
      // <View style={[styles.container, {
      //   flexDirection: "column"
      // }]}>
      //   <View style={{ flex: 2}}>
      // <Text>Profile</Text>
      // </View>
      // <View style={{ flex: 2}}>
      //     <Text>Settings</Text>

      // </View>

              
      // </View>
      <introtab.Navigator>
        <introtab.Screen name="Step 1" component={Intropage1} />
        <introtab.Screen name="Step 2" component={Intropage2} />
        <introtab.Screen name="Step 3" component={Intropage3} />
        <introtab.Screen name="Step 4" component={Intropage4} />
      </introtab.Navigator>
      


    );
  }


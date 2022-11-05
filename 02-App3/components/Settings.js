import * as React from 'react';
import { Text, View , Button, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 20,
  },
});


export default function SettingsScreen({navigation}) {
  return (
    <View style={[styles.container, {
      flexDirection: "column"
    }]}>
      <View style={{ flex: 2}}>
    <Text>Profile</Text>
    </View>
    <View style={{ flex: 2}}>
        <Text>Settings</Text>
        <Button
        title="How to Play"
        onPress={() => navigation.navigate('Introduction')}
      />
    </View>

            
    </View>
        
    


  );
}
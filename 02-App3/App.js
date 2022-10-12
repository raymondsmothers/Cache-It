import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, {useEffect, useState, useContext} from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import SeekScreen from './components/SeekScreen';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';

const Tab = createBottomTabNavigator();
export const LocationContext = React.createContext({}) ;


export default function App() {
    const [currentPosition, setCurrentPosition] = useState();
    const [hasLocationPermission, setHasLocationPermission] = useState(false)

    useEffect(() => {
        if (hasLocationPermission) {
          findCoordinates();
        }
        else {
          requestLocationPermission()
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
            setHasLocationPermission(true)
          } else {
            console.log("location permission denied")
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
                  latitudeDelta: global.latDelta,
                  longitudeDelta: global.longDelta,
                });
              },
              (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
    };


  return (
    <LocationContext.Provider value={currentPosition}>

    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          lazy: true,
          unmountOnBlur: true,
        }}
      >
          <Tab.Screen name="CacheMap" component={CacheMap} />
          <Tab.Screen name="NewCacheForm" component={NewCacheForm} />
          <Tab.Screen lazy={true} name="Seek" component={SeekScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    </LocationContext.Provider>

  );
}
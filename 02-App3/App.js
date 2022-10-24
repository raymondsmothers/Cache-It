import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useEffect, useState, useContext} from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import SeekScreen from './components/SeekScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer, StackActions} from '@react-navigation/native';

import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';
import IntroductionPage from './components/introduction';

import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogBox } from 'react-native';

// The following disables the warning messages for the 'Require cycle' issue
// TODO: Fix this issue
LogBox.ignoreLogs(["Require cycle: node_modules\react-native-crypto\index.js -> node_modules\react-native-randombytes\index.js -> node_modules\sjcl\sjcl.js -> node_modules\react-native-crypto\index.js"]);
console.disableYellowBox = true;

const Tab = createBottomTabNavigator();
export const LocationContext = React.createContext({}) ;
const Stack = createNativeStackNavigator();

function HomeTab () {
  return (
    <Tab.Navigator
    screenOptions={{
      lazy: true,
      unmountOnBlur: true,
    }}>
    {/* <Tab.Navigator tabBarPosition='bottom'> */}
    <Tab.Screen
      name="CacheMap"
      component={CacheMap}
      
    />
    <Tab.Screen name="NewCacheForm" component={NewCacheForm} />
    <Tab.Screen name="Seek" component={SeekScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} 
    options={{
      headerRight: () => <ConnectWalletButton />,
    }}/>
    
  </Tab.Navigator>
  )

}



export default function App() {
    const [currentPosition, setCurrentPosition] = useState();
    const [hasLocationPermission, setHasLocationPermission] = useState(false)

    useEffect(() => {
        if (hasLocationPermission) {
          findCoordinates()
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
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 100000 }
          );
    };


  return (
    <WalletConnectProvider
      bridge="https://bridge.walletconnect.org"
      clientMeta={{
        description: 'Connect with WalletConnect',
        url: 'https://walletconnect.org',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'WalletConnect',
      }}
      redirectUrl={
        Platform.OS === 'web' ? window.location.origin : 'yourappscheme://'
      }
      storageOptions={{
        asyncStorage: AsyncStorage,
      }}>
      <LocationContext.Provider value={currentPosition}>

      <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen options={{headerShown: false}} name="Home" component={HomeTab} />
        <Stack.Screen name = "Introduction" component={IntroductionPage}/>
      </Stack.Navigator>
      </NavigationContainer>
      </LocationContext.Provider>

    </WalletConnectProvider>
  );
}

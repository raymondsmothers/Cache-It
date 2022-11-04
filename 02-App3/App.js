//native imports
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useEffect, useState, useContext} from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { LogBox } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer, StackActions} from '@react-navigation/native';
//Components imports
import SeekScreen from './components/SeekScreen';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';
import IntroductionPage from './components/introduction';

//Web3 imports
import { withWalletConnect, useWalletConnect }  from '@walletconnect/react-native-dapp' ;
import WalletConnectProvider from "@walletconnect/web3-provider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CONTRACT_ADDRESSES from './contract_info/contractAddressesGoerli';
import  GeocacheJSON from './contract_info/goerliAbis/Geocache.json';
// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"
// Import the ethers library
import { ethers } from "ethers";



// The following disables the warning messages for the 'Require cycle' issue

// TODO: Fix this issue
LogBox.ignoreLogs(["Require cycle: node_modules\react-native-crypto\index.js -> node_modules\react-native-randombytes\index.js -> node_modules\sjcl\sjcl.js -> node_modules\react-native-crypto\index.js"]);
console.disableYellowBox = true;

const Tab = createBottomTabNavigator();
export const LocationContext = React.createContext({});
export const CacheMetadataContext = React.createContext({
  cacheMetadata: {},
  setCacheMetadata: () => {},
});
export const Web3ProviderContext = React.createContext({});
export const GeocacheContractContext = React.createContext({});


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
      options={{
        headerRight: () => <ConnectWalletButton />,
      }}
    />
    <Tab.Screen name="NewCacheForm" component={NewCacheForm} />
    <Tab.Screen name="Seek" component={SeekScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
    
  </Tab.Navigator>
  )

}



function App() {

    const [currentPosition, setCurrentPosition] = useState();
    const [hasLocationPermission, setHasLocationPermission] = useState(false)
    const [cacheMetadata, setCacheMetadata] = useState()
    // const [geocacheContract, setGeocacheContract] = useState({});
    //This state hook gets passed down to consumers of the context, to allow them to update the state of the context 
    cacheMetadataContextValue = { cacheMetadata, setCacheMetadata }

    //  Create WalletConnect Provider for gettingSigner for state changing transactions
    const connector = useWalletConnect();
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "1b9467bd46a7430faf4e825d24c63122", // Required //idk why process.env isn't working
      connector: connector,
      qrcode: false,
      chainId: 5,
    });

    // Create default Provider for signing read only transactions (getters)
    const defaultProvider = new ethers.getDefaultProvider(
      "goerli",
      {
        "alchemy": process.env.GOERLI_ALCHEMY_KEY,
        "infura": "1b9467bd46a7430faf4e825d24c63122"
      }
    );

    // globally available context
    Web3ProviderContextValue = {
      "walletConnect": walletConnectProvider,
      "default": defaultProvider
    }

    //Construct globally available contract context
    const GeocacheContract = new ethers.Contract(
      CONTRACT_ADDRESSES.Geocache,
      GeocacheJSON.abi,
      defaultProvider
    );


    useEffect(() => {

        const setupProvider = async () => {
          console.log("env: " + process.env.GOERLI_INFURA_KEY)

          // Subscribe to accounts change
          walletConnectProvider.on("accountsChanged", (accounts) => {
            console.log(accounts);
          });
  
          // Subscribe to chainId change
          walletConnectProvider.on("chainChanged", (chainId) => {
            console.log(chainId);
          });
  
          // Subscribe to session disconnection
          walletConnectProvider.on("disconnect", (code, reason) => {
            console.log(code, reason);
          });
          //  Enable session (triggers QR Code modal)
          await walletConnectProvider.enable();
  

          // setGeocacheContract(GeocacheContract)
        }
        setupProvider()
       
    }, [])

   
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
            // console.log("You can use the location")
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
      <LocationContext.Provider value={currentPosition}>
      <Web3ProviderContext.Provider value={Web3ProviderContextValue}>
      <CacheMetadataContext.Provider value={cacheMetadataContextValue}>
      <GeocacheContractContext.Provider value={GeocacheContract}>
        <NavigationContainer>
        <Stack.Navigator >
          <Stack.Screen options={{headerShown: false}} name="Home" component={HomeTab} />
          <Stack.Screen name = "Introduction" component={IntroductionPage}/>
        </Stack.Navigator>
        </NavigationContainer>
      </GeocacheContractContext.Provider>
      </CacheMetadataContext.Provider>
      </Web3ProviderContext.Provider>
      </LocationContext.Provider>
  );
}

export default withWalletConnect(App, {
  bridge: "https://bridge.walletconnect.org",
  clientMeta: {
    description: 'Connect with WalletConnect',
    url: 'https://walletconnect.org',
    icons: ['https://walletconnect.org/walletconnect-logo.png'],
    name: 'WalletConnect',
  },
  redirectUrl:  Platform.OS === 'web' ? window.location.origin : 'yourappscheme://',
  storageOptions: {
    asyncStorage: AsyncStorage,
  }
});

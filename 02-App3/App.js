//native imports
require('node-libs-react-native/globals');

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect, useState, useContext} from 'react';
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {LogBox} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, StackActions} from '@react-navigation/native';
//Components imports
import SeekScreen from './components/SeekScreen';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';
import IntroductionPage from './components/introduction';

//Web3 imports
import {
  withWalletConnect,
  useWalletConnect,
} from '@walletconnect/react-native-dapp';
import WalletConnectProvider from '@walletconnect/web3-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CONTRACT_ADDRESSES from './contract_info/contractAddressesGoerli';
import GeocacheJSON from './contract_info/goerliAbis/Geocache.json';
// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims';
// Import the ethers library
import {ethers} from 'ethers';
import {CACHEIT_PRIVATE_KEY} from '@env';
import "./global"
// The following disables the warning messages for the 'Require cycle' issue

// TODO: Fix this issue
LogBox.ignoreLogs([
  'Require cycle: node_modules\react-native-cryptoindex.js -> node_modules\react-native-randombytesindex.js -> node_modulessjclsjcl.js -> node_modules\react-native-cryptoindex.js',
]);
console.disableYellowBox = true;

const Tab = createBottomTabNavigator();
export const LocationContext = React.createContext({});
export const CacheMetadataContext = React.createContext({
  cacheMetadata: {},
  setCacheMetadata: () => {},
});
export const Web3ProviderContext = React.createContext({});
export const GeocacheContractContext = React.createContext({});
export const AllGeocacheDataContext = React.createContext({});

const Stack = createNativeStackNavigator();

function HomeTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        unmountOnBlur: true,
        tabBarActiveTintColor: global.secondaryColor,
        headerTintColor: global.secondaryColor,
        tabBarStyle: { backgroundColor: global.cream },
        headerStyle: { backgroundColor: global.cream, fontWeight: "bold", fontColor: global.primaryColor},
      }}>
      {/* <Tab.Navigator tabBarPosition='bottom'> */}
      <Tab.Screen
        name="Cache Map"
        component={CacheMap}
        options={{
          headerRight: () => <ConnectWalletButton />,
        }}
      />
      <Tab.Screen name="New Cache Form" component={NewCacheForm} />
      <Tab.Screen name="Seek" component={SeekScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [currentPosition, setCurrentPosition] = useState();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [cacheMetadata, setCacheMetadata] = useState();
  const [activeGeocacheIds, setActiveGeocacheIds] = useState([]);
  const [activeGeocacheNames, setActiveGeocacheNames] = useState([]);
  const [isLoading, setIsLoading] = useState();
  // const [geocacheContract, setGeocacheContract] = useState({});
  //This state hook gets passed down to consumers of the context, to allow them to update the state of the context
  cacheMetadataContextValue = {cacheMetadata, setCacheMetadata};

  //  Create WalletConnect Provider for gettingSigner for state changing transactions
  const connector = useWalletConnect();
  const walletConnectProvider = new WalletConnectProvider({
    infuraId: '1b9467bd46a7430faf4e825d24c63122', // Required //idk why process.env isn't working
    connector: connector,
    qrcode: false,
    chainId: 5,
  });

  // Create default Provider for signing read only transactions (getters)
  const defaultProvider = new ethers.getDefaultProvider('goerli', {
    infura: process.env.GOERLI_INFURA_KEY,
    alchemy: process.env.GOERLI_ALCHEMY_KEY,
  });

  // Create our CacheIt signer for onlyOwner functions (minting item in Geocache)
  const cacheItSigner = new ethers.Wallet(CACHEIT_PRIVATE_KEY, defaultProvider);
  // const cacheItSigner = new ethers.Wallet(CACHEIT_PRIVATE_KEY, defaultProvider);

  // globally available context
  Web3ProviderContextValue = {
    walletConnect: walletConnectProvider,
    default: defaultProvider,
    cacheItSigner: cacheItSigner,
  };

  AllGeocacheDataContextValue = {
    activeGeocacheIds: activeGeocacheIds,
    setActiveGeocacheIds: setActiveGeocacheIds,
    activeGeocacheNames: activeGeocacheNames,
    setActiveGeocacheNames: setActiveGeocacheNames,
    isLoadingContractData: isLoading
  }

  LocationContextValue = {
    currentPosition: currentPosition,
    setCurrentPosition: setCurrentPosition
  }

  //Construct globally available contract context
  const GeocacheContract = new ethers.Contract(
    CONTRACT_ADDRESSES.Geocache,
    GeocacheJSON.abi,
    defaultProvider,
  );

  const delay = ms => new Promise(res => setTimeout(res, ms));



  const getAllGeocacheData = async () => {
    if(!isLoading) {
      setIsLoading(true)
      const getIDs = async () => {
        const ids = await GeocacheContract.getAllActiveGeocacheIDs().catch((e) => {alert("OOPS! Error: " + e)});
        const formattedIds = ids.map((id, index) => Number(id));
        // console.log('ids: ' + ids);
        const names = await getGeocacheNames(ids)

        // await getGeocacheNames(ids).then(() => {
        //   console.log("data got")
        //   setIsLoading(false)
        // });
        setActiveGeocacheIds([...formattedIds]);
        setActiveGeocacheNames(names);
        delay(1000)
        setIsLoading(false)
        // return;
      };
      await getIDs()
      // await getIDs().then(() => {
      //   console.log("data got")
      //   setIsLoading(false)
      // })
      // console.log("after getIds")
      // setIsLoading(false)
    }
    // return
  }

  useEffect(() => {
    // conso  le.log("useEffect")
    //This event is firing many times
    GeocacheContract.once("GeocacheCreated", getAllGeocacheData)
    
    getAllGeocacheData()
    // getAllGeocacheData().then(() => {
    //   console.log("data got")
    //   setIsLoading(false)
    // })
  }, []);

  //Make this into a useContext
  // TODO this doesn't feel efficient
  const getGeocacheNames = async (ids) => {
        const geocacheNames = [];
        await ids.map(async (geocacheID, index) => {
        // console.log('getting name for : ' + geocacheID);
          const selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(
            geocacheID,
          );
          // console.log("raw: " + selectedGeocacheRawData)
          geocacheNames[geocacheID] = selectedGeocacheRawData[7];
          // console.log("geonames: " + geocacheNames)
          // setActiveGeocacheNames(geocacheNames);
      });
      return geocacheNames
  };

  useEffect(() => {
    // console.log('env: ' + process.env.CACHEIT_PRIVATE_KEY);

    const setupProvider = async () => {
      // Subscribe to accounts change
      walletConnectProvider.on('accountsChanged', accounts => {
        console.log(accounts);
      });

      // Subscribe to chainId change
      walletConnectProvider.on('chainChanged', chainId => {
        console.log(chainId);
      });

      // Subscribe to session disconnection
      walletConnectProvider.on('disconnect', (code, reason) => {
        console.log(code, reason);
      });
      //  Enable session (triggers QR Code modal)
      await walletConnectProvider.enable();

      // setGeocacheContract(GeocacheContract)
    };
    setupProvider();
  }, []);

  useEffect(() => {
    // console.log('env: ' + process.env.CACHEIT_PRIVATE_KEY);

    if (hasLocationPermission) {
      findCoordinates();
    } else {
      requestLocationPermission();
    }
  }, [hasLocationPermission]);

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Example App',
          message: 'Example App access to your location ',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log("You can use the location")
        setHasLocationPermission(true);
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // //Grabs Location
  const findCoordinates = async () => {
    await Geolocation.getCurrentPosition(
      position => {
        const crd = position.coords;
        // console.log(position);
        setCurrentPosition({
          latitude: crd.latitude,
          longitude: crd.longitude
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 100000},
    );
  };

  return (
    <LocationContext.Provider value={LocationContextValue}>
      <Web3ProviderContext.Provider value={Web3ProviderContextValue}>
        <CacheMetadataContext.Provider value={cacheMetadataContextValue}>
          <GeocacheContractContext.Provider value={GeocacheContract}>
            <AllGeocacheDataContext.Provider value={AllGeocacheDataContextValue}>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  options={{headerShown: false}}
                  name="Home"
                  component={HomeTab}
                />
                <Stack.Screen
                  name="Introduction"
                  component={IntroductionPage}
                />
              </Stack.Navigator>
            </NavigationContainer>
            </AllGeocacheDataContext.Provider>
          </GeocacheContractContext.Provider>
        </CacheMetadataContext.Provider>
      </Web3ProviderContext.Provider>
    </LocationContext.Provider>
  );
}

export default withWalletConnect(App, {
  bridge: 'https://bridge.walletconnect.org',
  clientMeta: {
    description: 'Connect with WalletConnect',
    url: 'https://walletconnect.org',
    icons: ['https://walletconnect.org/walletconnect-logo.png'],
    name: 'WalletConnect',
  },
  redirectUrl:
    Platform.OS === 'web' ? window.location.origin : 'yourappscheme://',
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
});

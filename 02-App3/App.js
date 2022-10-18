import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import * as React from 'react';
import ARvision from './components/ARvision';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';
import IntroductionPage from './components/introduction';

import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
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
    <Tab.Screen name="ARVision" component={ARvision} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
    
  </Tab.Navigator>
  )

}



export default function App() {
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
      <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen options={{headerShown: false}} name="Home" component={HomeTab} />
        <Stack.Screen name = "Introduction" component={IntroductionPage}/>
      </Stack.Navigator>
      </NavigationContainer>
    </WalletConnectProvider>
  );
}

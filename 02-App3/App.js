import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import * as React from 'react';
import ARvision from './components/ARvision';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';

import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogBox } from 'react-native';

// The following disables the warning messages for the 'Require cycle' issue
// TODO: Fix this issue
LogBox.ignoreLogs(["Require cycle: node_modules\react-native-crypto\index.js -> node_modules\react-native-randombytes\index.js -> node_modules\sjcl\sjcl.js -> node_modules\react-native-crypto\index.js"]);
console.disableYellowBox = true;

const Tab = createBottomTabNavigator();

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
      </NavigationContainer>
    </WalletConnectProvider>
  );
}

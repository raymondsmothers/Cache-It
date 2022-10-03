import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {Button} from 'react-native';
import * as React from 'react';
import ARvision from './components/ARvision';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';
import ConnectWalletButton from './components/ConnectWalletButton';

import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
              // headerTitle: props => <LogoTitle {...props} />,
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

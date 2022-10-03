import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import ARvision from './components/ARvision';
import SettingsScreen from './components/Settings';
import NewCacheForm from './components/NewCacheForm';
import CacheMap from './components/CacheMap';

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          lazy: true,
          unmountOnBlur: true,
        }}
      >
      {/* <Tab.Navigator tabBarPosition='bottom'> */}
        <Tab.Screen name="CacheMap" component={CacheMap} />
        <Tab.Screen name="NewCacheForm" component={NewCacheForm} />
        <Tab.Screen lazy={true} name="ARVision" component={ARvision} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
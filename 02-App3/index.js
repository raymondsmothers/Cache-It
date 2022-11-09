/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name} from './app.json';
import './shim.js';

AppRegistry.registerComponent(name, () => App);

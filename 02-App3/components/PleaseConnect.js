// Component that's going to show if wallet isn't connected
import React from 'react';

import {
  RecyclerViewBackedScrollViewComponent,
  Text,
  View,
  Button,
} from 'react-native';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
} from 'react-native';

const globalStyles = require("../styles")
import ConnectWalletButton from './ConnectWalletButton';


export default function PleaseConnect({msg}) {


  return (
    <View style={styles.container}>
      <Text style={globalStyles.centerText}>
        {"Uh-Oh! Please connect your wallet to " + msg}
      </Text>
      <ConnectWalletButton/>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    padding: 10,
  },
});

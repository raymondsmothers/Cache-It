import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useWalletConnect,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import {Button} from 'react-native';
import * as React from 'react';
import "../global"

export default function ConnectWalletButton() {
 
  const connector = useWalletConnect();
  if (!connector.connected) {
    /**
     *  Connect!
     */

    return (
      <Button title="Connect Wallet" onPress={() => connector.connect().catch((e) => {alert("OOPS! Error: " + e)})} />
    );
  }
  else {
    // console.log("Account: " + connector.accounts[0])
    return (
      <Button
        // title="Disconnect Wallet"
        title={"Disconnect " + global.shortenAddress(connector.accounts[0])}
        onPress={() => connector.killSession().catch((e) => {alert("OOPS! Error: " + e)})}
      />
    );
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useWalletConnect,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import {Button} from 'react-native';
import * as React from 'react';

export default function ConnectWalletButton() {
  const connector = useWalletConnect();
  if (!connector.connected) {
    /**
     *  Connect!
     */

    return (
      <Button title="Connect Wallet" onPress={() => connector.connect()} />
    );
  }
  else {
    // console.log("Account: " + connector.accounts[0])
    return (
      <Button
        title="Disconnect Wallet"
        onPress={() => connector.killSession()}
      />
    );
  }
}

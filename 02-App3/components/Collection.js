import React, {useState, useContext, useEffect} from 'react';
import {
  RecyclerViewBackedScrollViewComponent,
  Text,
  View,
  Button,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Grid from 'react-native-grid-component';

import '@ethersproject/shims';
// // Import the ethers library
import {ethers} from 'ethers';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
// //OPENAI
// // const { Configuration, OpenAIApi } = require("openai");
// import {OPENAI_SECRET_KEY, PINATA_KEY, PINATA_SECRET, PINATA_JWT} from '@env';
// import axios from 'axios';

export default function Collection() {
  const [data, setData] = useState(null);
  const connector = useWalletConnect();

  // Fetching our real geocache data
  // Getting the IDs by the user
  // Then getting the geocaches from that, and setting the state
  useEffect(() => {}, []);

  // Delete later
  const dummyData = [
    {
      name: 'Test Geocache',
      image:
        'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

      location_found: '12783.3, 3920.201',
    },
    {
      name: 'Test Geocache 2',
      image:
        'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

      location_found: '127833.3, -392220.201',
    },
    {
      name: 'Test Geocache 3',
      image:
        'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

      location_found: '127833.3, -392220.201',
    },
    {
      name: 'Test Geocache 4',
      image:
        'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

      location_found: '127833.3, -392220.201',
    },
  ];

  const renderItem = (data, i) => (
    <TouchableOpacity style={{width: '50%', alignItems: 'center'}}>
      <View style={styles.container} key={i}>
        <Image
          style={styles.img}
          source={{
            uri: data.image,
          }}
        />
        <Text style={styles.viewText}>{data.name}</Text>
        <Text style={styles.viewText}>Location Found: </Text>
        <Text>{data.location_found}</Text>
      </View>
    </TouchableOpacity>
  );

  return connector.connected ? (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.text}>
            {'\n'}View Your Collected Geocache Items
          </Text>
          {data && (
            <Grid
              style={styles.list}
              renderItem={renderItem}
              data={dummyData}
              numColumns={2}
            />
          )}
          {/* TODO ADD ACTUAL LOADING ICON*/}
          {!data && <Text style={styles.text}>Loading...</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  ) : (
    <SafeAreaView>
      <Text style={styles.text}>
        Please connect your wallet to view your geocache items.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: 10,
    margin: 5,
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
    margin: 10,
  },
  viewText: {
    fontWeight: 'bold',
  },
  item: {
    flex: 1,
    height: 160,
    margin: 1,
  },
  list: {
    flex: 1,
  },
  img: {
    // Can change this if img is messed up
    width: 110,
    height: 115,
  },
});

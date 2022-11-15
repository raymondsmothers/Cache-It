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
import {Web3ProviderContext, GeocacheContractContext} from '../App';

import '@ethersproject/shims';
// // Import the ethers library
import {ethers} from 'ethers';
import {useWalletConnect} from '@walletconnect/react-native-dapp';

export default function Collection() {
  const [geocacheData, setGeocacheData] = useState(null);
  const connector = useWalletConnect();
  const GeocacheContract = useContext(GeocacheContractContext);
  const providers = useContext(Web3ProviderContext);

  // Getting the IDs by the user
  // Then getting the geocaches from that, and setting the state
  useEffect(() => {
    async function getUsersItems() {
      if (connector.connected) {
        console.log('Fetching items!');
        // User must have wallet connected for this screen (otherwise msg will appear)
        // Connecting contract to wallet connect signer
        await providers.walletConnect.enable();
        const ethers_provider = new ethers.providers.Web3Provider(
          providers.walletConnect,
        );
        const signer = await ethers_provider.getSigner();
        const GeocacheContractWithSigner = GeocacheContract.connect(signer);

        let geocaches = [];
        try {
          const itemIDs = await GeocacheContractWithSigner.getUsersGeocaches(
            connector.accounts[0],
          );
          const mappedIDs = itemIDs.map(id => Number(id));

          for (let i = 0; i < mappedIDs.length; i++) {
            let currCache = await GeocacheContractWithSigner.tokenIdToGeocache(
              itemIDs[i],
            ).catch((e) => {alert("OOPS! Error: " + e)});;
            console.log(currCache);
            const cacheObj = {
              name: String(currCache[7]),
              location_found: String(currCache[5] + ', ' + currCache[6]),
              image:
                'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',
            };
            geocaches.push(cacheObj);
          }
          console.log('Geocaches is ');
          console.log(geocaches);
          setGeocacheData(geocaches);
        } catch (error) {
          console.log('Error getting IDs', error.message);
        }
      }
    }

    getUsersItems();
  }, [connector.connected]);

  // TODO: Delete hardcoded data later
  // const dummyData = [
  //   {
  //     name: 'Test Geocache',
  //     image:
  //       'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

  //     location_found: '12783.3, 3920.201',
  //   },
  //   {
  //     name: 'Test Geocache 2',
  //     image:
  //       'https://www.mariowiki.com/images/thumb/f/fc/ItemBoxMK8.png/1200px-ItemBoxMK8.png',

  //     location_found: '127833.3, -392220.201',
  //   },
  // ];

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
          {geocacheData && geocacheData.length > 0 && (
            <Grid
              style={styles.list}
              renderItem={renderItem}
              data={geocacheData}
              numColumns={3}
            />
          )}
          {geocacheData && geocacheData.length === 0 && (
            <Text
              style={
                (styles.text,
                {
                  marginTop: '50%',
                  marginBottom: '40%',
                  marginLeft: '10%',
                  marginRight: '10%',
                  textAlign: 'center',
                  fontSize: 24,
                })
              }>
              No geocache items found yet... Time to collect!
            </Text>
          )}
          {/* TODO ADD ACTUAL LOADING ICON*/}
          {!geocacheData && <Text style={styles.text}>Loading...</Text>}
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

import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
  AllGeocacheDataContext,
} from '../App';

import {useWalletConnect} from '@walletconnect/react-native-dapp';

const globalStyles = require('../styles');
import '../global';

export default function SelectGeocache() {
  const [modalVisible, setModalVisible] = useState(false);
  const GeocacheContract = useContext(GeocacheContractContext);
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);
  const [isLoading, setIsLoading] = useState(false);
  const {
    activeGeocacheIds,
    setActiveGeocacheIds,
    activeGeocacheNames,
    setActiveGeocacheNames,
    isLoadingContractData,
  } = useContext(AllGeocacheDataContext);
  const [errorMessage, setErrorMessage] = useState();
  const connector = useWalletConnect();

  // useEffect(() => {
  //   GeocacheContract.on('GeocacheCreated', geocacheCreatedCallback);
  //   // getAllGeocacheData();
  // }, []);

  // const geocacheCreatedCallback = async (
  //   creatorAddress,
  //   geocacheName,
  //   newGeocacheId,
  // ) => {
  //   creatorAddress = creatorAddress.toLocaleLowerCase();
  //   const connectedAddress = connector.accounts[0];
  //   if (creatorAddress == connectedAddress) {
  //     console.log('callback triggered in new selectgeo: ' + geocacheName + " id: " + newGeocacheId);
  //     await getData(newGeocacheId)
  //   }
  // };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const getGeocacheMetadata = async id => {
    //get data on selected geocache
    // console.log("Getting data for id: " + id)
    setIsLoading(true);
    // setIsLoading(id);
    var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(
      id,
    ).catch(e => {
      alert('OOPS! Error: ' + e);
    });
    var selectedGeocacheItemLocations =
      await GeocacheContract.getGeolocationsOfGeocache(id).catch(e => {
        alert('OOPS! Error: ' + e);
      });
    // console.log("selected geocahce: " + JSON.stringify(selectedGeocacheRawData, null, 2))
    // console.log("selected geocache gelocaitons: " + selectedGeocacheItemLocations)
    var itemLocations = [];
    selectedGeocacheItemLocations.map((coordsAsString, index) => {
      var coord = {
        latitude: parseFloat(
          coordsAsString.substring(0, coordsAsString.indexOf(',')),
        ),
        longitude: parseFloat(
          coordsAsString.substring(coordsAsString.indexOf(',') + 1),
        ),
      };
      itemLocations.push(coord);
    });
    setCacheMetadata({
      creator: selectedGeocacheRawData[0],
      imgUrl: selectedGeocacheRawData[1],
      date: selectedGeocacheRawData[2],
      numberOfItems: parseInt(selectedGeocacheRawData[3]),
      isActive: selectedGeocacheRawData[4],
      epicenterLat: parseFloat(selectedGeocacheRawData[5]),
      epicenterLong: parseFloat(selectedGeocacheRawData[6]),
      name: selectedGeocacheRawData[7],
      radius: parseInt(selectedGeocacheRawData[8]),
      geolocations: itemLocations,
      geocacheId: id,
    });
    setIsLoading(false);
    await delay(1000);
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <>
        <Pressable
          style={globalStyles.button}
          // buttonStyle={styles.button}
          onPress={() => {
            setModalVisible(true);
          }}
          // disabled={activeGeocacheNames.length != activeGeocacheIds.length}
          // disabled={activeGeocacheNames.includes(undefined)}
          disabled={isLoadingContractData}
          // disabled={true}
          // activeOpacity={isLoadingContractData ? 1 : 0.1}
          // title="Select Cache"
        >
          {isLoadingContractData ? (
            <ActivityIndicator color={'white'}></ActivityIndicator>
          ) : (
            <Text style={globalStyles.buttonText}>{'SELECT CACHE'}</Text>
          )}
        </Pressable>

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            // alert('Modal has been closed.');
            setModalVisible(false);
          }}>
          <ScrollView style={styles.scrollContainer}>
            <View>
              <Text style={globalStyles.titleText}>Select Geocache</Text>
              {connector.connected ? (
                <>
                  <Text style={globalStyles.centerText}>
                    Choose a Geocache ID below to switch what Geocache you are
                    searching
                  </Text>
                  {isLoading && <ActivityIndicator></ActivityIndicator>}
                  {/* return ( */}
                  {activeGeocacheIds.length > 0 ? (
                    <RadioButton.Group style={styles.radioButtonContainer}>
                      {activeGeocacheIds?.map((id, index) => {
                        return (
                          <>
                            {/* <View style={styles.radioButtonContainer}> */}

                            <RadioButton.Item
                              // style={styles.buttonContainer}
                              // key={ird}
                              labelStyle={{color: global.secondaryColor}}
                              label={
                                id + ' - "' + activeGeocacheNames[id] + '"'
                              }
                              color={global.primaryColor}
                              onPress={() => getGeocacheMetadata(id)}
                              // status={ id == cacheMetadata?.geocacheId ?  'checked' : 'unchecked'}
                              status={
                                id == cacheMetadata?.geocacheId
                                  ? 'checked'
                                  : 'unchecked'
                              }
                              position={'trailing'}
                              style={styles.radioButton}></RadioButton.Item>
                          </>
                        );
                      })}
                    </RadioButton.Group>
                  ) : (
                    <Text style={globalStyles.centerText}>
                      {
                        'There are no active geocaches yet. Time for you to create one!'
                      }
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={globalStyles.centerText}>
                    Uh-Oh! Please connect your wallet to select a geocache.
                  </Text>
                </>
              )}

              <Button
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                color={global.primaryColor}
                title="Close"
              />
            </View>
          </ScrollView>
        </Modal>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContainer: {
    // marginBottom: 20,
    backgroundColor: global.cream,
  },
  radioButton: {
    // flex: 1
    // width: "90%"
  },
  radioButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 100,
    width: '100%',
  },
  button: {
    backgroundColor: global.primaryColor,
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 50,
    position: 'absolute',
    zIndex: 2,
    width: '100%',
    bottom: 100,
    padding: 15,
  },
});

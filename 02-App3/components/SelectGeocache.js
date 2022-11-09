import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
  AllGeocacheDataContext
} from '../App';
const globalStyles = require('../styles');

export default function SelectGeocache() {
  const [modalVisible, setModalVisible] = useState(false);
  const GeocacheContract = useContext(GeocacheContractContext);
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);
  const [selectedGeocache, setSelectedGeocache] = useState();
  const {activeGeocacheIds, setActiveGeocacheIds, activeGeocacheNames, setActiveGeocacheNames} = useContext(AllGeocacheDataContext)
 
  useEffect(() => {
    console.log("active names on selector: " + activeGeocacheNames)
  }, [activeGeocacheNames])

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const getData = async id => {
    //get data on selected geocache
    setSelectedGeocache(true);
    // setSelectedGeocache(id);
    var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(id);
    var selectedGeocacheItemLocations =
      await GeocacheContract.getGeolocationsOfGeocache(id);
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
    setSelectedGeocache(false);
    await delay(1000)
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <>
        <Button
          // buttonStyle={{position: "absolute", bottom: 95}}
          // buttonStyle={styles.button}
          onPress={() => {
            setModalVisible(true);
          }}
          // disabled={activeGeocacheNames.length != activeGeocacheIds.length}
          // disabled={!activeGeocacheNames.includes(undefined)}
          // disabled={!activeGeocacheNames}
          title="Select Cache"
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            // alert('Modal has been closed.');
            setModalVisible(false);
          }}>
          <View style={{marginTop: 22}}>
            <View>
              <Text style={globalStyles.centerText}>SelectGeocache</Text>
              <Text style={globalStyles.centerText}>
                Choose a Geocache ID below to switch what Geocache you are
                searching
              </Text>
              {selectedGeocache &&
                <ActivityIndicator></ActivityIndicator>
              }
              {/* return ( */}
                    <RadioButton.Group >
                    {/* <RadioButton.Group onValueChange={value => setValue(value)} value={value}> */}

                   {activeGeocacheIds.map((id, index) => {
                    return(
                      <>
                      <View style={styles.radioButtonContainer}>

                      <RadioButton.Item
                        // style={styles.buttonContainer}
                        key={index}
                        label={id + ' - "' + activeGeocacheNames[id] + '"'}
                        onPress={() => getData(index)}
                        // status={ id == cacheMetadata?.geocacheId ?  'checked' : 'unchecked'}
                        status={ id == cacheMetadata?.geocacheId ?  'checked' : 'unchecked'}
                        position={"trailing"}
                        style={styles.radioButton}
                        >
                        {/* <Text>"thes"</Text> */}
                      </RadioButton.Item>
                      {/* <Text>
                        {id + ' - "' + activeGeocacheNames[id] + '"'}
                      </Text> */}
                      </View>
                      </>
                    )
                   })}
                   </RadioButton.Group>
                    {/* </View> */}
                {/* ); */}
              {/* })} */}

              <Button
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                title="Close"
              />
            </View>
          </View>
        </Modal>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: "abosulte",
    // top: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    marginBottom: 25,
  },
  radioButton: {
    // flex: 1
  },
  radioButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: "100%"
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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

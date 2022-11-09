import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {
  CacheMetadataContext,
  LocationContext,
  Web3ProviderContext,
  GeocacheContractContext,
} from '../App';
const globalStyles = require('../styles');

export default function SelectGeocache() {
  const [modalVisible, setModalVisible] = useState(false);
  const GeocacheContract = useContext(GeocacheContractContext);
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);
  const [activeGeocacheIds, setActiveGeocacheIds] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11, 12, 13, 14,
  ]);
  const [activeGeocacheNames, setActiveGeocacheNames] = useState([]);

  // useEffect(() => {
  //   var numGeocaches;
  //   const getData = async () => {
  //       // numGeocaches = await GeocacheContract.numGeocaches();
  //       // TODO get list of ACtive Geocaches from contract
  //   }
  //   getData()
  //   // setActiveGeocaches([...Array(numGeocaches).keys()])
  //   setActiveGeocaches([0,1,2,3])
  //   // console.log("numGeocahce: " + [...Array(numGeocaches).keys()])
  //   // console.log("numGeocahce: " + numGeocaches)
  // }, [])

  useEffect(() => {
    // console.log("useEffect")
    const getIDs = async () => {
      const ids = await GeocacheContract.getAllActiveGeocacheIDs();
      const formattedIds = ids.map((id, index) => Number(id));
      console.log('ids: ' + ids);
      setActiveGeocacheIds([...formattedIds]);
    };
    // getIDs();
    getGeocacheNames();
  }, []);

  //Make this into a useContext
  const getGeocacheNames = async () => {
    var geocacheNames = [];
    activeGeocacheIds.map(async (geocacheID, index) => {
      console.log('getting name for : ' + geocacheID);
      var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(
        geocacheID,
      );
      geocacheNames[geocacheID] = selectedGeocacheRawData[7];
    });
    console.log('geocacheNames: ' + geocacheNames);
    setActiveGeocacheNames(geocacheNames);
  };

  const getData = async id => {
    //get data on selected geocache
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

              {activeGeocacheIds.map((item, index) => {
                return (
                  <TouchableOpacity onPress={() => getData(index)}>
                    <View style={styles.radioButtonContainer}>
                      <RadioButton
                        // style={styles.buttonContainer}
                        key={item.label}
                        label={index}
                        onPress={() => getData(index)}>
                        {/* <Text>"thes"</Text> */}
                      </RadioButton>
                      <Text>
                        {item + ' - "' + activeGeocacheNames[item] + '"'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

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
  radioButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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

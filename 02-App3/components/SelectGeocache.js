
import React, {useState, useContext, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Modal,TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { CacheMetadataContext, LocationContext, Web3ProviderContext, GeocacheContractContext } from '../App';


export default function SelectGeocache() {

  const [modalVisible, setModalVisible] = useState(false);
  const GeocacheContract = useContext(GeocacheContractContext)
  const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)
  const [activeGeocaches, setActiveGeocaches] = useState([])

  useEffect(() => {
    var numGeocaches;
    const getData = async () => {
        // numGeocaches = await GeocacheContract.numGeocaches();
        // TODO get list of ACtive Geocaches from contract
    }
    getData()
    // setActiveGeocaches([...Array(numGeocaches).keys()])
    setActiveGeocaches([0,1,2,3])
    // console.log("numGeocahce: " + [...Array(numGeocaches).keys()])
    // console.log("numGeocahce: " + numGeocaches)
  }, [])

    return (
      <View style={styles.container}>
      <>
        <Button
          style={styles.button}
          onPress={() => {
            setModalVisible(true);
          }}
          title="Show"
        />


        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={{ marginTop: 22 }}>
            <View>
              <Text>SelectGeocache</Text>

              {activeGeocaches.map((item, index) => {
                  return (
                    <RadioButton
                      // style={styles.buttonContainer}
                      key={item.label}
                      label={index}
                      onPress={() =>  console.log(index)}>
                      {/* <Text>"thes"</Text> */}
                    </RadioButton>
                  );
                })}

              <Button
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                title="Hide Modal"
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
    // flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3

  },
  button: {
    position: "absolute",
    top: 100,
    left: 100
  }
});


  
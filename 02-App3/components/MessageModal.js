import React, { useState } from "react";
import { Alert, Linking, Modal, StyleSheet, Text, Pressable, View, ActivityIndicator} from "react-native";
const globalStyles = require("../styles")

import {useNavigation} from '@react-navigation/native';
import {NavigationContainer, StackActions} from '@react-navigation/native';
export default function MessageModal({title, transactionHash, hasDeployedGeocache=false, isTransactionDelayed, openSeaURL, isProgress=false, body, resetParentState=() => {return}}) {
  const [modalVisible, setModalVisible] = useState(true);


  const navigation = useNavigation() 

  const handleURLClick = async (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  return (
    // <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={globalStyles.titleText}>{title}</Text>
            <Text style={styles.modalText}>{body}</Text>
              {isTransactionDelayed && (
                <Text style={[styles.modalText, {color: "red"}]}>{"Uh-oh! This is taking longer than usual. Please view your transaction on Etherscan to verify the status."}</Text>
              )}
              {isProgress && (
                // <br>
                <ActivityIndicator style={global.primaryColor}></ActivityIndicator>
                // </br>
              )}
  

              <View style={styles.buttonContainer}>
                {/*only show view on etherscan if a transaction hash is provided */}
                {transactionHash &&
                <Pressable
                    style={[styles.button, {backgroundColor : "navy"}]}
                    onPress={async () =>  await handleURLClick("https://goerli.etherscan.io/tx/" + transactionHash).catch((e) => {alert("OOPS! Error: " + e)})}
                  >
                  <Text style={styles.textStyle}>{"View transaction on Etherscan"}</Text>
                </Pressable>
                }
                {hasDeployedGeocache &&
                <Pressable
                    style={[styles.button, {backgroundColor : "green"}]}
                    onPress={async () =>  navigation.navigate("Cache Map")}
                  >
                  <Text style={styles.textStyle}>{"View on Cache Map"}</Text>
                </Pressable>
                }
                {openSeaURL &&
                <Pressable
                    style={[styles.button, {backgroundColor: "#1868B7"}]}
                    onPress={async () =>  await handleURLClick(openSeaURL).catch((e) => {alert("OOPS! Error: " + e)})}
                  >
                  <Text style={styles.textStyle}>{"View on OpenSea"}</Text>
                </Pressable>
                }
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setModalVisible(!modalVisible)
                    resetParentState()
                  }}
                >
                  <Text style={styles.textStyle}>{"Close "}</Text>
                </Pressable>
              </View>
          </View>
        </View>
      </Modal>
    // </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    display: "flex",
    padding: 10
    // flexDirection: "row"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    // flex: 1,
    margin: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 12,
    fontSize: 18,
    textAlign: "center"
  }
});


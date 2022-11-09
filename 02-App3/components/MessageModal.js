import React, { useState } from "react";
import { Alert, Linking, Modal, StyleSheet, Text, Pressable, View, ActivityIndicator} from "react-native";

export default function MessageModal({title, transactionHash, isTransactionDelayed, isProgress=false, body}) {
  const [modalVisible, setModalVisible] = useState(true);


  const handleEtherscanClick = async (url) => {
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
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{title}</Text>
            <Text style={styles.modalText}>{body}</Text>

              {isProgress && (
                // <br>
                <ActivityIndicator></ActivityIndicator>
                // </br>
              )}
              {isTransactionDelayed && (
                <Text style={[styles.modalText, {fontWeight:"bold"}]}>{"Uh-oh! This is taking much longer than usual. Please view your transaction on etherscan to verify the status."}</Text>
              )}
              <View style={styles.buttonContainer}>
                {/*only show view on etherscan if a transaction hash is provided */}
                {transactionHash &&
                <Pressable
                    style={[styles.button, styles.buttonOpen]}
                    onPress={async () =>  await handleEtherscanClick("https://goerli.etherscan.io/tx/" + transactionHash)}
                  >
                <Text style={styles.textStyle}>{"View on Etherscan"}</Text>
                </Pressable>
                }
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>{"Close"}</Text>
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
    marginBottom: 15,
    textAlign: "center"
  }
});


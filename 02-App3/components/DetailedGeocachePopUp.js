import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  Image,
} from "react-native";

export default function DetailedGeocachePopUp({
  metadata, // Metadata object being passed in
  resetParentState = () => {
    return;
  },
}) {
  const [modalVisible, setModalVisible] = useState(true);

  const handleURLClick = async (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
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
        <ScrollView contentContainerStyle={styles.modalView}>
          <Image
            style={styles.img}
            source={{
              uri: metadata.image,
            }}
          />
          <Text
            style={[styles.modalText, { fontWeight: "bold", fontSize: 28 }]}
          >
            {metadata.name}
          </Text>
          <Text style={[styles.modalText]}>{metadata.origin_story}</Text>
          <Text style={[styles.modalText, { textAlign: "left" }]}>
            Location found: {metadata.location_found}
          </Text>
          <Text style={[styles.modalText, { textAlign: "left" }]}>
            Number of items in this geocache: {metadata.size}
          </Text>
          <Text style={[styles.modalText, { textAlign: "left" }]}>
            Date created: {metadata.date_created}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: "#1868B7" }]}
            onPress={async () =>
              await handleURLClick(metadata.opensea_link).catch((e) => {
                alert("OOPS! Error: " + e);
              })
            }
          >
            <Text style={styles.textStyle}>{"View on OpenSea"}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              setModalVisible(false);
              resetParentState();
            }}
          >
            <Text style={styles.textStyle}>{"Close "}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: "flex",
    padding: 10,
    // flexDirection: "row"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    // flex: 1,
    margin: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
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
    textAlign: "center",
  },
  modalText: {
    marginBottom: 12,
    fontSize: 18,
    textAlign: "center",
  },
  img: {
    // Can change this if img is messed up
    width: 200,
    height: 200,
  },
});

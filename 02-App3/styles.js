'use strict';
import { StyleSheet } from 'react-native';

module.exports = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
    textContainer: {
      display: "flex",
      // flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 10,
      padding: 10,
    },
    centerText: {
      textAlign: "center",
      fontSize: 20,
      padding: 10,
    },
    titleText: {
      fontSize: 24,
      padding: 10,
      textAlign: "center",
      fontWeight: "bold"
    },
    messageModal: {
      position: "absolute",
      left: 200
    },
  });
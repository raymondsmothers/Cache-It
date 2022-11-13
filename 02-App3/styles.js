'use strict';
import { StyleSheet } from 'react-native';
// const globalStyles = require("./global")
import "./global"
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
      color: global.primaryColor
    },
    titleText: {
      fontSize: 24,
      padding: 10,
      textAlign: "center",
      fontWeight: "bold",
      color: global.primaryColor
    },
    messageModal: {
      position: "absolute",
      left: 200
    },
    text: {
      // padding: 10,
      fontSize: 18,
      // color: "white"
    },
    buttonText: {
      // padding: 10,
      fontSize: 14,
      color: "white",
    },
    button: {
      backgroundColor: global.primaryColor,
      // backgroundColor:
      //   "linear-gradient(95.66deg," + global.primaryColor + " 60%, " + global.primarySquare + " 100%)",
      filter: "blur(35px)",
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderRadius: 4,
      elevation: 3,
      // backgroundColor: 'black',
      
    }
  });
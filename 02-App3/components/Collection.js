import React, { useState, useContext, useEffect } from "react";

import PleaseConnect from './PleaseConnect';
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
} from "react-native";
import Grid from "react-native-grid-component";
import { Web3ProviderContext, GeocacheContractContext } from "../App";
import "../global";
import "@ethersproject/shims";
// // Import the ethers library
import { ethers } from "ethers";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import useSWR from "swr";
import { Geocache1155 } from "../contract_info/contractAddressesGoerli";
import DetailedGeocachePopUp from "./DetailedGeocachePopUp";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
const globalStyles = require("../styles");

export default function Collection() {
  const [geocacheData, setGeocacheData] = useState(null);
  const [detailedGeocacheData, setDetailedGeocacheData] = useState(null); // For the pop up modal
  const [showDetailedPopup, setShowDetailedPopup] = useState(false);
  const connector = useWalletConnect();
  const GeocacheContract = useContext(GeocacheContractContext);
  const providers = useContext(Web3ProviderContext);

  // Fetching our geocache items for the given user
  useEffect(() => {
    async function fetchData() {
      if (connector.accounts) {
        // console.log("Getting for wallet " + connector.accounts[0]);
        const res = await axios.get(
          `https://testnets-api.opensea.io/api/v1/assets?asset_contract_address=${Geocache1155}&owner=${connector.accounts[0]}`
        );

        let geocacheDataArr = [];
        for (let i = 0; i < res.data["assets"].length; i++) {
          const currItem = res.data["assets"][i];

          // Ordering of traits changes for some reason, so determining index for each trait
          let dateCreatedIndex;
          let sizeIndex;
          let locationCreatedIndex;
          for (let i = 0; i < currItem["traits"].length; i++) {
            if (currItem["traits"][i]["trait_type"] === "Geocache Date Created")
              dateCreatedIndex = i;
            if (currItem["traits"][i]["trait_type"] === "Geocache Size")
              sizeIndex = i;
            if (currItem["traits"][i]["trait_type"] === "Location Created")
              locationCreatedIndex = i;
          }
          geocacheDataArr.push({
            name: currItem["name"],
            image: currItem["image_url"],
            location_found: currItem["traits"][locationCreatedIndex]["value"],
            size: currItem["traits"][sizeIndex]["value"],
            date_created: currItem["traits"][dateCreatedIndex]["value"],
            origin_story: currItem["description"],
            opensea_link: currItem["permalink"],
          });
        }
        setGeocacheData(geocacheDataArr);
      }
    }
    fetchData();
  }, [connector]);

  const renderItem = (data, i) => {
    return (
      <TouchableOpacity
        style={{ width: "50%", alignItems: "center"}}
        onPress={() => renderDetailedMetadataPg(data)}
      >
        <View style={styles.container} key={i}>
          <Image
            style={styles.img}
            source={{
              uri: data.image,
            }}
          />
          <Text style={globalStyles.centerText}>{data.name}</Text>
          {/* <Text style={styles.viewText}>Location Found: </Text>
          <Text>{data.location_found}</Text> */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailedMetadataPg = (data) => {
    console.log("rendering detailed metadata screen!");
    setShowDetailedPopup(true);
    setDetailedGeocacheData(data);
  };

  const resetModalState = () => {
    setShowDetailedPopup(false);
    setDetailedGeocacheData(null);
  };

  return connector.connected ? (
    <SafeAreaView style={{ backgroundColor: global.cream, height: "100%"}}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={globalStyles.titleText}>
            {"\n"}View Your Collected Geocache Items
          </Text>
          {showDetailedPopup && (
            <DetailedGeocachePopUp
              metadata={detailedGeocacheData}
              resetParentState={resetModalState}
            />
          )}
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
                globalStyles.titleText
                // {
                //   marginTop: "50%",
                //   marginBottom: "40%",
                //   marginLeft: "10%",
                //   marginRight: "10%",
                //   textAlign: "center",
                //   fontSize: 24,
                // }
              }
            >
              {"\n"}No geocache items found yet... Time to collect!
            </Text>
          )}
          {/* TODO ADD ACTUAL LOADING ICON*/}
          {!geocacheData && (
            <Text style={globalStyles.titleText}>
              {"\n"}Loading{"\n"}
              <ActivityIndicator color={global.primaryColor}></ActivityIndicator>
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  ) : (
    <SafeAreaView>
      <View style={styles.container}>
        <PleaseConnect msg={" view your collection. "}></PleaseConnect>
      </View>
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
    backgroundColor: global.cream,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    padding: 10,
    margin: 5,
  },
  text: {
    textAlign: "center",
    fontSize: 24,
    margin: 10,
  },
  viewText: {
    fontWeight: "bold",
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

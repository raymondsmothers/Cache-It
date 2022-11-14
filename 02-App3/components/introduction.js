import * as React from 'react';
import {Text, View, Button, ScrollView, StyleSheet} from 'react-native';
import ARvision from './ARvision';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
const globalStyles = require("../styles")

const introtab = createMaterialTopTabNavigator();


function HowToPlay() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {"Welcome to Cache-it, the newest geocaching experience that let's you collect metaverse items straight from your phone!"}
      </Text>
      <Text style={styles.text}>
        This app enables users to instantly create new Geocaches, attempt to search local Geocahces others have created, and claim items that you find in the Geocache. 
         </Text>
      <Text style={styles.text}>Read through the rest of this tutorial to get an idea of how to play.</Text>
      {/* <Text style={styles.text}>Get close to the target geo cache</Text>
      <Text style={styles.text}>Get close to the target geo cache</Text>
      <Text>Open the AR when close enough to the target</Text>
      <Text>Try to find target through AR lens</Text> */}
    </View>
  );
}
function HowToConnect() {
  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.text}>
        {"First thing first, you will have to connect a web3 wallet to fully interact with this app. "}
      </Text>      
      <Text style={styles.text}>
        {"This wallet allows you to create new Geocaches on the Ethereum blockchain, and claim or \"mint\" Geocache items that you find."}
      </Text>      
      <Text style={styles.text}>
        {"Our favorite web3 wallet is Metamask, which you can download and set up in less than five minutes from any app store."}
      </Text>      
      <Text style={styles.text}>
        {"Once you have a wallet installed, click the \"Connect Wallet\" at the top right of any tab to connect. It's that simple."}
      </Text>      
    </View>
    </ScrollView>
  );
}


function HowToSearch() {
  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.text}>
        {"Next, you probably want to search for items in Geocaches around you, right? "}
      </Text>      
      <Text style={styles.text}>
        {"On the \"Cache Map\" tab, click the \"Select Cache\" button to see a list of all active Geocaches."}
      </Text>      
      <Text style={styles.text}>
        {"Click any one of these Geocaches, and you will see it populated on your Cache Map, as a circular georegion, with a handful of random markers."}
      </Text>      
      <Text style={styles.text}>
        {"These markers represent hidden Geocache items! You are now ready to get serious"}
      </Text>      
      <Text style={styles.text}>
        {"Move over to the \"Seek\" to begin your hunt. Here you can see some details of the Cache you are currently seeking, and your distance from the nearest item in the Geocache. " 
          + "You can see a pulse indicator and pulse strength, to help you feel how far away you are. The stronger the pulse strength, the farther away you are."}
      </Text>      
      <Text style={styles.text}>
        {"Something special happens when you get within 10 meters of an item. Your trusty Augemented Reality Lens will open up, and you will be able to see an AR object that represents a hidden cache item! " 
        + " Tap on the AR object to claim the item."}
      </Text>      
    </View>
    </ScrollView>
  );
}

function HowToMint() {
  return (
    <ScrollView>
    <View style={styles.container}>   
      <Text style={styles.text}>
        {"Once you claim an item, you will begin a series of transaction that will send you a a special NFT that represents that item. "}
      </Text>      
      <Text style={styles.text}>
        {"You don't need to know any special web3 jargon here; all you need to know is that soon your geocache item will be deposited into your connected wallet as an NFT. "}
      </Text>      
      <Text style={styles.text}>
        {"You can always check the etherscan transaction as this process is happening to verify everything completes correctly."}
      </Text>      
    </View>
    </ScrollView>
  );
}

function HowToCreate() {
  return (
    <ScrollView>
    <View style={styles.container}>   
      <Text style={styles.text}>
        {"Done searching? Time to create your own Geocache! Head over to the \"New Cache Form\" page. "}
      </Text>      
      <Text style={styles.text}>
        {"Here you decide on the radius of your Geocache, the number of items in your Geocache, and the name of your Geocache. " 
        + " This will generate a Geocache with your desired number of items, randomly located within your desired radius from your current location."}
      </Text>      
      <Text style={styles.text}>
        {"When you tap \"Submit\", we use a super cool AI engine to randomly generate an Origin Story for your cache, and a random image  based on that story. "}
      </Text>      
      <Text style={styles.text}>
        {"When those generations are complete, we will send a transaction request to your wallet to create your Geocache on the Ethereum Blockchain. "}
      </Text>      
      <Text style={styles.text}>
        {"Let this transaction complete, and then boom! You have officialy created your Geocache for everyone to search. "}
      </Text>      
    </View>
    </ScrollView>
  );
}

export default function IntroductionPage() {
  return (
    // <View style={[styles.container, {
    //   flexDirection: "column"
    // }]}>
    //   <View style={{ flex: 2}}>
    // <Text>Profile</Text>
    // </View>
    // <View style={{ flex: 2}}>
    //     <Text>Settings</Text>

    // </View>

    // </View>
    <introtab.Navigator
    screenOptions={{
      lazy: true,
      unmountOnBlur: true,
      tabBarActiveTintColor: global.cream,
      headerTintColor: global.secondaryColor,
      tabBarStyle: {backgroundColor: global.secondaryColor, fontSize: 12},
      headerStyle: {backgroundColor: global.cream},
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "bold",   
        // wordBreak: "break-word"
      },
    }}
    >
      <introtab.Screen name="How to Play" component={HowToPlay} />
      <introtab.Screen name="How to Connect" component={HowToConnect} />
      <introtab.Screen name="How to Create" component={HowToCreate} />
      <introtab.Screen name="How to Search" component={HowToSearch} />
      <introtab.Screen name="How to Mint" component={HowToMint} />
      {/* <introtab.Screen name="How to Connect" component={Intropage3} /> */}
      {/* <introtab.Screen name="Step 4" component={Intropage4} /> */}
    </introtab.Navigator>

    // </View>

    // </View>
    // <introtab.Navigator>
    //   <introtab.Screen name="Step 1" component={Intropage1} />
    //   <introtab.Screen name="Step 2" component={Intropage2} />
    //   <introtab.Screen name="Step 3" component={Intropage3} />
    //   <introtab.Screen name="Step 4" component={Intropage4} />
    // </introtab.Navigator>
  );
}


const styles = StyleSheet.create({
  container: {
    display: "flex",
    padding: 25,
    height: "100%",
    backgroundColor: global.cream
  },
  text: {
    margin: 10,
    fontSize: 18,
    color: global.primaryColor
  }
})

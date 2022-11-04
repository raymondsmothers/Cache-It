import {
  Viro3DObject,
  ViroAnimations,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
} from '@viro-community/react-viro';
import React, {useState, useContext} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {
  Web3ProviderContext,
  GeocacheContractContext,
  CacheMetadataContext,
} from '../App';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import {ethers} from 'ethers';

const ARVisionScene = () => {
  const [text, setText] = useState('Initializing AR...');
  const [ignoreDrag, setIgnoreDrag] = useState(false);
  const providersAndSigners = useContext(Web3ProviderContext);
  const GeocacheContract = useContext(GeocacheContractContext);
  const CacheMetadata = useContext(CacheMetadataContext);
  const connector = useWalletConnect();

  function onInitialized(state, reason) {
    console.log('guncelleme', state, reason);
    // console.debug("bug")
    // if (state === ViroConstants.TRACKING_NORMAL) {
    if (state === 3) {
      setText('Hello World!');
    }
    // else if (state === ViroConstants.TRACKING_NONE) {
    //   // Handle loss of tracking
    // }
  }

  // _onClick(source) {
  //   console.log("We just Clicked the image!");
  // }

  // Minting an item in collection for the user
  const mintItemInGeocache = async () => {
    const cacheItSigner = providersAndSigners.cacheItSigner;
    const geocacheId = CacheMetadata['cacheMetadata']['geocacheId'];
    const userAddress = connector.accounts[0];
    console.log("User's address is ", userAddress);

    // Calling the contract function as contract owner
    const geocacheContractWithSigner = await GeocacheContract.connect(
      cacheItSigner,
    );
    const mintItemInGeocacheTxn = await geocacheContractWithSigner
      .mintItemInGeocache(geocacheId, userAddress, {
        gasLimit: 10000000,
      })
      .then(res => {
        console.log('Success: ' + JSON.stringify(res, null, 2));
        console.log('Item minted for user ', userAddress, ' check openSea!');
      })
      .catch(error => {
        alert('Error minting item: ' + error.message);
        console.log('Error: ' + error.message);
      });
  };

  const initialPosition = [0, -0.5, -1];
  const objectScale = [10, 10, 10];
  return (
    <ViroARScene>
      {/* <ViroARScene onTrackingUpdated={onInitialized}> */}
      <ViroBox
        position={[0, -0.5, -1]}
        animation={{name: 'rotate', run: true, loop: true}}
        scale={[0.3, 0.3, 0.1]}
        materials={['grid']}
        // onClick={(position, source) => console.log('Click', position, source)}
        onClick={(position, source) => {
          Alert.alert('Congratulations!', 'Open Metamask to Claim?', [
            {
              text: 'No',
              onPress: () => console.log("Nah, I'm good"),
            },
            {
              text: 'Yes',
              onPress: () => mintItemInGeocache(),
            },
          ]);
        }}
        dragType="FixedDistance"
        dragPlane={{
          planePoint: [0, -1, 0],
          planeNormal: [0, 1, 0],
          maxDistance: 500,
        }}
        onDrag={
          (dragToPos, source) => {
            console.log('Drag', dragToPos[1], source);
            {
              if (source == 1) {
                if (dragToPos[1] - initialPosition[1] >= 0 && !ignoreDrag) {
                  setIgnoreDrag(true);
                  Alert.alert('Congratulations!', 'Open Metamask to Claim?', [
                    {
                      text: 'No',
                      onPress: () => console.log("Nah, I'm good"),
                    },
                    {
                      text: 'Yes',
                      onPress: () => mintItemInGeocache(),
                    },
                  ]);
                }
              }
            }
          }
          // dragtoPos[0]: x position
          // dragtoPos[1]: y position
          // dragtoPos[2]: z position
        } //OnDrag
      />
      {/* <Viro3DObject
        source={require("../res/geocaching_capsules_2_Blender.obj")}
        resources={[
          require("../res/geocaching_capsules_2_Blender.mtl")
        ]}
        height={1}
        width={1}
        type="OBJ"
          position={initialPosition}
          animation={{name: "rotate", run: true, loop: true}}
          // scale={[.3, .3, .1]} 
          scale={objectScale}
          materials={["grid"]} 
          // materials={["geocaching_capsules_2_Blender.mtl"]} 
          // onClick={(position, source) => console.log('Click', position, source)}
          dragType="FixedDistance"
          dragPlane={{
            planeNormal: [0, -0.25, -1],
            planePoint: initialPosition,
            maxDistance: 5
          }}
          ignoreEventHandling={ignoreDrag}
          onDrag={(dragToPos, source) => {    
            console.log('Drag', dragToPos[1], source);
            {
              if(source == 1) {
                if(dragToPos[1] - initialPosition[1] >= 0 && !ignoreDrag) {
                  setIgnoreDrag(true);
                  Alert.alert(
                    "Congratulations!",
                    "Open Metamask to Claim?",
                    [
                      {
                        text: "No",
                        onPress: () => console.log("Nah, I'm good")
                      },
                      {
                        text: "Yes",
                        onPress: () => console.log("Give me goodies!")
                      }
                    ]
                  );
                }
              }}
            }
            // dragtoPos[0]: x position    
            // dragtoPos[1]: y position    
            // dragtoPos[2]: z position
          }

          /> */}
    </ViroARScene>
  );
};

export default () => {
  return (
    <View style={styles.f1}>
      <ViroARSceneNavigator
        autofocus={false}
        initialScene={{
          scene: ARVisionScene,
        }}
        style={styles.f1}
      />
    </View>
  );
};

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('../grid_bg.jpg'),
  },
});

ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: '+=90',
    },
    duration: 250, //.25 seconds
  },
});
var styles = StyleSheet.create({
  f1: {flex: 1},
  container: {
    ...StyleSheet.absoluteFillObject,
    //   height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

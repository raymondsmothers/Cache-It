import {
  Viro3DObject,
  ViroAnimations,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
} from '@viro-community/react-viro';
import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {
  Web3ProviderContext,
  GeocacheContractContext,
  CacheMetadataContext,
} from '../App';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import {ethers} from 'ethers';
import MessageModal from './MessageModal';
const globalStyles = require('../styles');
export const MintingContext = React.createContext({});

const ARVisionScene = () => {
  // const [text, setText] = useState('Initializing AR...');
  const [ignoreDrag, setIgnoreDrag] = useState(false);
  const providersAndSigners = useContext(Web3ProviderContext);
  const GeocacheContract = useContext(GeocacheContractContext);
  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);
  const connector = useWalletConnect();
  const {setIsMintingItem, setHasMintedItem, hasMintedItem, setErrorMessage, setIsTransactionDelayed, setTransactionHash} =
    useContext(MintingContext);

  // const [ errorMessage, setErrorMessage ] = useState()

  // function onInitialized(state, reason) {
  //   console.log('guncelleme', state, reason);
  //   // console.debug("bug")
  //   // if (state === ViroConstants.TRACKING_NORMAL) {
  //   if (state === 3) {
  //     setText('Hello World!');
  //   }
  //   // else if (state === ViroConstants.TRACKING_NONE) {
  //   //   // Handle loss of tracking
  //   // }
  // }

  useEffect(() => {
    GeocacheContract.on('GeocacheItemMinted', geocacheItemMintedCallback);
    // console.log('priv: ' + providersAndSigners.cacheItSigner.address);
  });

  //This callback is wrong, the CAcheIt wallet is always sending the transaction
  const geocacheItemMintedCallback = (
    receiverAddress,
    geocacheId,
    geocacheItemId,
  ) => {
    receiverAddress = receiverAddress.toLocaleLowerCase();
    // console.log('creatorAddress: ' + creatorAddress);

    if (receiverAddress == connector.accounts[0]) {
    // if (geocacheId === cacheMetadata.geocacheId) {
      console.log('callback triggered');
      setIsMintingItem(false);
      setHasMintedItem(true);
    }
  };

  // _onClick(source) {
  //   console.log("We just Clicked the image!");
  // }

  // Minting an item in collection for the user
  const mintItemInGeocache = async () => {
    setIsMintingItem(true);
    const cacheItSigner = providersAndSigners.cacheItSigner;
    const geocacheId = cacheMetadata?.geocacheId;
    const userAddress = connector.accounts[0];
    // console.log("User's address is ", userAddress);

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
        // alert(`Successfully minted item for user ${userAddress}`);
        setTransactionHash(res.hash)
        setTimeout(() => {
          // console.log("DELAYED")
          setIsTransactionDelayed(true && !hasMintedItem)
        }, 15000)
      })
      .catch(error => {
        // alert('Error minting item: ' + error.message);
        console.log('Error in MintTXn: ' + error.message);
        setErrorMessage(error?.message);
        setIsMintingItem(false);
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
          Alert.alert(
            'Congratulations!',
            'Would you like to claim this item?',
            [
              {
                text: 'No',
                onPress: () => console.log("Nah, I'm good"),
              },
              {
                text: 'Yes',
                onPress: () => mintItemInGeocache(),
              },
            ],
          );
        }}
        dragType="FixedDistance"
        dragPlane={{
          planePoint: [0, -1, 0],
          planeNormal: [0, 1, 0],
          maxDistance: 500,
        }}
      />
    </ViroARScene>
  );
};

export default () => {
  const [isMintingItem, setIsMintingItem] = useState(false);
  const [hasMintedItem, setHasMintedItem] = useState(false);
  const [transactionHash, setTransactionHash] = useState()
  const [isTransactionDelayed, setIsTransactionDelayed] = useState(false)
  const [errorMessage, setErrorMessage] = useState();
  //  available context in this file
  MintingContextValue = {
    setIsMintingItem: setIsMintingItem,
    setHasMintedItem: setHasMintedItem,
    setErrorMessage: setErrorMessage,
    setTransactionHash: setTransactionHash,
    setIsTransactionDelayed: setIsTransactionDelayed,
    hasMintedItem: hasMintedItem
  };
  return (
    <MintingContext.Provider value={MintingContextValue}>
      <View style={styles.f1}>
        <ViroARSceneNavigator
          autofocus={false}
          initialScene={{
            scene: ARVisionScene,
          }}
          style={{flexGrow: 1, flex: 3}}
        />
        {isMintingItem && (
          <MessageModal
            style={globalStyles.messageModal}
            title={'Minting'}
            isProgress={true}
            isTransactionDelayed={isTransactionDelayed}
            transactionHash={transactionHash}
            body={'Please wait'}
          />
        )}
        {errorMessage && (
          <MessageModal
            style={globalStyles.messageModal}
            title={'Error'}
            body={errorMessage}
          />
        )}
        {
          hasMintedItem && (
            <MessageModal
              style={globalStyles.messageModal}
              title={'Success!'}
              // isProgress={true}
              isTransactionDelayed={false}
              transactionHash={transactionHash}
              body={'Nice! Your item has finished minting.'}
            />
          )
        }
      </View>
    </MintingContext.Provider>
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

import {
  Viro3DObject,
  ViroAnimations,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
} from '@viro-community/react-viro';
import React, {useState} from 'react';
import {StyleSheet, View, Alert} from 'react-native';

const ARVisionScene = () => {
  const [text, setText] = useState('Initializing AR...');
  const [ignoreDrag, setIgnoreDrag] = useState(false);

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
              onPress: () => console.log('Give me goodies!'),
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
                      onPress: () => console.log('Give me goodies!'),
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

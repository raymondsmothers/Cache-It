import { ViroAnimations, ViroARScene, ViroARSceneNavigator, ViroBox, ViroMaterials } from '@viro-community/react-viro';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

const HelloWorldSceneAR = () => {
  const [text, setText] = useState('Initializing AR...');

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
  

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroBox position={[0, -.5, -1]}
          animation={{name: "rotate", run: true, loop: true}}
          scale={[.3, .3, .1]} 
          materials={["grid"]} 
          onClick={(position, source) => console.log('Click', position, source)}
          dragType="FixedDistance"
          dragPlane={{
            planePoint: [0, -1, 0],
            planeNormal: [0, 1, 0],
            maxDistance: 500
          }}
          onDrag={(dragToPos, source) => {    
            console.log('Drag', dragToPos, source);
            // dragtoPos[0]: x position    
            // dragtoPos[1]: y position    
            // dragtoPos[2]: z position
          }}

          />
          
    </ViroARScene>
  );
};


export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: HelloWorldSceneAR,
      }}
      style={styles.f1}
    />
  );
};

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('./grid_bg.jpg'),
  },
});

ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: "+=90"
    },
    duration: 250, //.25 seconds
  },
});
var styles = StyleSheet.create({
  f1: {flex: 1},
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

import React, {useEffect, useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import "../global"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import {PulseRateContext} from './SeekScreen';



export default function AnimatedRings({pulseStrength}) {
  // const {pulseStrength, setPulseStrength} = useContext(PulseRateContext)
  // console.log('pulserate in animated ring: ' + JSON.stringify(pulseStrength, null, 2));
  // const Ring = ({delay, duration}) => {
  //   const ring = useSharedValue(0);
  //   // const {pulseStrength, setPulseStrength} = useContext(PulseRateContext)
  //   // console.log("Ring delay: " + delay)
  //   const ringStyle = useAnimatedStyle(() => {
  //     return {
  //       opacity: 0.8 - ring.value,
  //       transform: [
  //         {
  //           scale: interpolate(ring.value, [0, 1], [0, 4]),
  //         },
  //       ],
  //     };
  //   });
  //   useEffect(() => {
  //     ring.value = withDelay(
  //       delay,
  //       withRepeat(
  //         withTiming(1, {
  //           duration: duration,
  //         }),
  //         -1,
  //         false,
  //       ),
  //     );
  //   }, [delay, duration]);
  //   return <Animated.View style={[styles.ring, ringStyle]} />;
  // };

  const Ring = React.memo(({delay, duration}) => {
    // const RingUnMemoed = ({delay, duration}) => {
      // const {pulseStrength, setPulseStrength} = useContext(PulseRateContext)
      const ring = useSharedValue(0);
  
      const ringStyle = useAnimatedStyle(() => {
        return {
          opacity: 0.8 - ring.value,
          transform: [
            {
              scale: interpolate(ring.value, [0, 1], [0, 4]),
            },
          ],
        };
      });
      useEffect(() => {
        ring.value = withDelay(
          delay,
          withRepeat(
            withTiming(1, {
              duration: duration,
            }),
            -1,
            false,
          ),
        );
      }, [delay]);
      return <Animated.View style={[styles.ring, ringStyle]} />;
    },
    (prevProps, nextProps) => {
      prevProps.delay === nextProps.delay && prevProps.duration === nextProps.duration
      // prevProps.pulseStrength === nextProps.pulseStrength
  
    }
    );
  
  return (
    // <PulseRateContext.Consumer>
    //   {
    //     pulseStrength => 
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        {/**this aniation isn't updated on a state update from seekscreen :/ */}
        {/* <Ring duration={250 * pulseStrength} delay={0} /> */}
        <Ring duration={1000 * pulseStrength} delay={0} />
        <Ring duration={1000 * pulseStrength} delay={500 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={250 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={750 * pulseStrength} />
        {/* <Ring duration={1000 * pulseStrength} delay={0} />
        <Ring duration={1000 * pulseStrength} delay={500 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={250 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={750 * pulseStrength} /> */}
        {/* <Ring duration={1000 * pulseStrengthContext.pulseStrength} delay={0} />
        <Ring duration={1000 * pulseStrengthContext.pulseStrength} delay={500 * pulseStrengthContext.pulseStrength} />
        <Ring duration={1000 * pulseStrengthContext.pulseStrength} delay={250 * pulseStrengthContext.pulseStrength} />
        <Ring duration={1000 * pulseStrengthContext.pulseStrength} delay={750 * pulseStrengthContext.pulseStrength} /> */}
      </View>
    // }
    // </PulseRateContext.Consumer>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    // borderColor: 'tomato',
    borderColor: global.secondaryColor,
    borderWidth: 10,
  },
});

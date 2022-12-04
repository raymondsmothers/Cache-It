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



export default function AnimatedRings({pulseStrength}) {

  const Ring = React.memo(({delay, duration}) => {
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
    }
    );
  
  return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <Ring duration={1000 * pulseStrength} delay={0} />
        <Ring duration={1000 * pulseStrength} delay={500 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={250 * pulseStrength} />
        <Ring duration={1000 * pulseStrength} delay={750 * pulseStrength} />
      </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: global.secondaryColor,
    borderWidth: 10,
  },
});

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const Ring = ({delay, duration}) => {
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
  }, []);
  return <Animated.View style={[styles.ring, ringStyle]} />;
};

export default function AnimatedRingExample(params) {
  console.log('pulserate: ' + JSON.stringify(params.pulseRate, null, 2));
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
      {/**this aniation isn't updated on a state update from seekscreen :/ */}
      <Ring duration={40000 / params.pulseRate} delay={0} />
      <Ring
        duration={40000 / params.pulseRate}
        delay={20000 / params.pulseRate}
      />
      <Ring
        duration={40000 / params.pulseRate}
        delay={10000 / params.pulseRate}
      />
      <Ring
        duration={40000 / params.pulseRate}
        delay={30000 / params.pulseRate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: 'tomato',
    borderWidth: 10,
  },
});

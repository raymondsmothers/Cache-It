import * as React from 'react';
import { Text, View } from 'react-native';
import ARvision from './ARvision';

export default function SeekScreen() {
    return (
        (true) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Seek Screen </Text>
          </View>
        ) : (
            <ARvision></ARvision>
        )
    );
  }
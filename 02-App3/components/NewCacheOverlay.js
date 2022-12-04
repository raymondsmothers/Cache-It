import React, {useContext} from 'react';
import {View} from 'react-native';
import {Circle, Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {CacheMetadataContext} from '../App';
import "../global"
export default function NewCacheOverlay(props) {
  const defaultCircleColor = '#0000ff40';
  const navigation = useNavigation();

  const {cacheMetadata, setCacheMetadata} = useContext(CacheMetadataContext);

  // console.log(JSON.stringify(cacheMetadata));
  if (cacheMetadata == undefined || cacheMetadata?.imgUrl == '') {
    // if(no geocache is selected) {
    // console.log("no cache selected")
    return <View />;
  } else {
    return (
      <View>
        <Circle
          center={{
            latitude: cacheMetadata?.epicenterLat,
            longitude: cacheMetadata?.epicenterLong,
          }}
          // fillColor={defaultCircleColor}
          fillColor={global.primaryColor + "40"}
          radius={cacheMetadata?.radius}
        />
        {/* {cacheMetadata?.geolocations.map((marker, index) => (
          <Marker
            pinColor={'tomato'}
            title={cacheMetadata?.name}
            key={index}
            coordinate={marker}
            onPress={() => {
              navigation.navigate('Seek', {
                coord: {marker},
              });
            }}
          />
        ))} */}
      </View>
    );
  }
}

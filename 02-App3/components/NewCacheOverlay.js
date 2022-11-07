import React, {useContext} from 'react';
import { View } from 'react-native';
import { Circle, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native'
import { CacheMetadataContext } from '../App';

export default function NewCacheOverlay(props) {
    const defaultCircleColor = "#0000ff40";
    // const navigation = useNavigation();

    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)

    console.log(JSON.stringify(cacheMetadata));
    if(true) {
    // if(no geocache is selected) {
        console.log("no cache selected")
        return <View></View>;
    }
    else {
      return (
          <View>
              <Circle 
                  center={{
                      latitude: cacheMetadata?.epicenterLat, 
                      longitude: cacheMetadata?.epicenterLong
                  }}
                  fillColor={defaultCircleColor}
                  radius={cacheMetadata?.radius}
              />
              {cacheMetadata?.geolocations.map((marker, index) => (
                  <Marker
                      title={cacheMetadata?.name}
                      key={index}
                      coordinate={marker}
                      onPress={() => {
                          navigation.navigate("Seek", {
                              coord: {marker}
                          })
                      }}
                  />
              ))}
          </View>
      );
    }
}

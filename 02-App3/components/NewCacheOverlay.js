import React from 'react';
import { View } from 'react-native';
import { Circle, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native'

export default function NewCacheOverlay(props) {
    const defaultCircleColor = "#0000ff40";
    const navigation = useNavigation();

    // console.log(props.render);
    if(!props.render) {
        return <View></View>;
    }

    console.log(JSON.stringify(props.coordinates));

    return (
        <View>
            <Circle 
                center={{
                    latitude: props.center.latitude, 
                    longitude: props.center.longitude
                }}
                fillColor={defaultCircleColor}
                radius={props.radius}
            />
            {props.coordinates.map((marker, index) => (
                <Marker
                    title={props.cacheName}
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
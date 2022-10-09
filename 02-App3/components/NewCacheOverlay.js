import React from 'react';
import { View, Button } from 'react-native';
import { Circle, Marker } from 'react-native-maps';

export default function NewCacheOverlay(props) {
    const defaultCircleColor = "#0000ff40";
    console.log(props.renderComponent);
    if(!props.renderComponent) {
        return <View></View>;
    }

    return (
        <View>
            <Circle 
                center={{
                    latitude: props.center.latitude, 
                    longitude: props.center.longitude
                }}
                fillColor={defaultCircleColor}
                radius={Number(props.radius)}
            />
            {props.coordinates.map((marker, index) => (
                <Marker 
                    key={index}
                    coordinate={marker}
                />
            ))}
        </View>
    );
}
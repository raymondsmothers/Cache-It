import React, {useContext, useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE }  from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { LocationContext } from '../App';
import '../global';

export default function CacheMap() {
    // const [mapRef, setMapRef] = useState();
    const mapRef = React.createRef();

    const locationContext = useContext(LocationContext)


    const mapStyle = [
      {
          featureType: "administrative.land_parcel",
          stylers: [
              {
                  visibility: "off"
              }
          ]
      },
      {
          featureType: "poi",
          stylers: [
              {
                  visibility: "off"
              }
          ]
      },
      {
          featureType: "administrative.neighborhood",
          stylers: [
              {
                  visibility: "off"
              }
          ]
      }
  ]

  useEffect(() => {
    if(locationContext) {
        mapRef.current.setCamera({
          center: {
            latitude: locationContext?.latitude,
            longitude: locationContext?.longitude,
            latitudeDelta: locationContext?.latitudeDelta,
            longitudeDelta: locationContext?.longitudeDelta,
          },
          zoom: 15,
      }, {duration: 2000});
    }
  }, [locationContext])
  


    const styles = StyleSheet.create({
        container: {
          ...StyleSheet.absoluteFillObject,
          width: 400,
          justifyContent: 'flex-end',
          alignItems: 'center',
        },
        map: {
          ...StyleSheet.absoluteFillObject,
        },
    });

    return (
        <View style={styles.container}>

            <MapView
              ref={mapRef}
              showsBuildings={true}
              showsPointsOfInterest={false}
              customMapStyle={mapStyle}

             provider={PROVIDER_GOOGLE} // remove if not using Google Maps
             style={styles.map}
             followsUserLocation={true}
             showsUserLocation={true}
             showsMyLocationButton={true}
             region={
                locationContext != undefined ?
                {
                  latitude: locationContext.latitude,
                  longitude: locationContext.longitude,
                  latitudeDelta: locationContext.latitudeDelta,
                  longitudeDelta: locationContext.longitudeDelta
                }  
                :
                undefined
              }
            />
           </View>

    );
  }
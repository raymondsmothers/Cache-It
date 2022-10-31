import React, {useContext, useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE }  from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { CacheMetadataContext, LocationContext, GeocacheContractContext } from '../App';
import '../global';
import {
  withWalletConnect,
  useWalletConnect,
} from '@walletconnect/react-native-dapp';
import NewCacheOverlay from './NewCacheOverlay';

import { useRoute } from '@react-navigation/native';

export default function CacheMap() {
    // const [mapRef, setMapRef] = useState();
    const mapRef = React.createRef();
    const GeocacheContract = useContext(GeocacheContractContext)

    const locationContext = useContext(LocationContext)
    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)

    const connector = useWalletConnect();
    const route = useRoute();


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


  useEffect(() => {
    // console.log("providers: " + providers.walletConnect)
    // createGeocache()
    // generateItemLocations()
    const getData = async () => {
      
      var firstGeocache = await GeocacheContract.tokenIdToGeocache(1);
      var firstGeocacheLocations = await GeocacheContract.getGeolocationsOfGeocache(1);
      console.log("first geocache: " + JSON.stringify(firstGeocache, null, 2))
      console.log("first geocache gelocaitons: " + firstGeocacheLocations)
    }
    getData()
  })

  // useEffect(() => {
  //   if (connector.accounts) {
  //     console.log('Connector info: ', connector.accounts[0]);
  //   }
  // }, [connector]);

  useEffect(() => {
      console.log("metadata: " + JSON.stringify(cacheMetadata, null, 2))
  }, [cacheMetadata])
  
  // useEffect(() => {
  //   console.log("renderArea: " + renderArea);
  //   console.log("renderComponent: " + renderComponent);
  // }, [renderArea, renderComponent]);


  // let renderComponent = false;
  // let renderArea = false;
  // let cacheName = "";
  // let cacheRadius = "";
  // let numberOfPoints = "";
  // let locations = "";
  // if (route.params) {
  //   cacheName = route.params.cacheName.name;
  //   cacheRadius = route.params.cacheRadius.fixedRadius;
  //   numberOfPoints = route.params.numberOfItems.numItems;
  //   locations = route.params.cacheLocations.itemLocations;
  //   renderComponent = true;
  //   renderArea = true;
  // }

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
      button: {
        position: "absolute",
        width: "100%",
        bottom: 0,
        padding: 15,
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
        >
          <NewCacheOverlay
            render={cacheMetadata != undefined}
            cacheName={cacheMetadata?.name}
            radius={cacheMetadata?.radius}
            center={{latitude: locationContext?.latitude, longitude: locationContext?.longitude}}
            numberOfPoints={cacheMetadata?.numberOfPoints}
            coordinates={cacheMetadata?.geolocations}
          />
        </MapView>

      </View>
  );
}

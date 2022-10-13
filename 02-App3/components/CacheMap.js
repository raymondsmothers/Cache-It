import React, {useState, useEffect} from 'react';
import {View, Text, Button, PermissionsAndroid, StyleSheet} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {
  withWalletConnect,
  useWalletConnect,
} from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewCacheOverlay from './NewCacheOverlay';
import { useRoute } from '@react-navigation/native';

export default function CacheMap() {
  const [mapRef, setMapRef] = useState();
  // const [initialPosition, setInitialPosition] = useState({})
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [initialPosition, setInitialPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [render, setRender]  = useState(false);
  const connector = useWalletConnect();
  const route = useRoute();

  const mapStyle = [
    {
      featureType: 'administrative.land_parcel',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'administrative.neighborhood',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
  ];

  useEffect(() => {
    if (hasLocationPermission) {
      console.log('has permmision');
      // requestLocationPermission()
      Geolocation.getCurrentPosition(
        position => {
          const crd = position.coords;
          // console.log(position);
          setInitialPosition({
            latitude: crd.latitude,
            longitude: crd.longitude,
            latitudeDelta: 0.421,
            longitudeDelta: 0.421,
          });
          mapRef.setCamera(
            {
              center: {
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: 0.421,
                longitudeDelta: 0.421,
              },
              zoom: 15,
            },
            {duration: 2000},
          );
        },
        error => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      requestLocationPermission();
    }
  }, [hasLocationPermission]);

  useEffect(() => {
    if (connector.accounts) {
      console.log('Connector info: ', connector.accounts[0]);
    }
  }, [connector]);

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Example App',
          message: 'Example App access to your location ',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        // alert("You can use the location");
        setHasLocationPermission(true);
      } else {
        console.log('location permission denied');
        // alert("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      //   height: 400,
      width: 400,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      // ...StyleSheet.absoluteFillObject,
      position: "relative",
      height: "100%",
    },
    button: {
      position: "absolute",
      width: "100%",
      bottom: 0,
      padding: 15,
    },
  });

  // if (route.params) {
  //   console.log("route param - cacheName: "      + route.params.cacheName.name);
  //   console.log("route param - numberOfItems: "  + route.params.numberOfItems.numItems);
  //   console.log("route param - cacheRadius: "    + route.params.cacheRadius.radius);
  //   console.log("route param - cacheLocations: " + JSON.stringify(route.params.cacheLocations.itemLocations._3));
  // }

  let renderComponent = false;
  let renderArea = false;
  let cacheName = "";
  let cacheRadius = "";
  let numberOfPoints = "";
  let locations = "";
  if (route.params) {
    cacheName = route.params.cacheName.name;
    cacheRadius = route.params.cacheRadius.fixedRadius;
    numberOfPoints = route.params.numberOfItems.numItems;
    locations = route.params.cacheLocations.itemLocations._3;
    renderComponent = true;
    renderArea = true;
  }

  useEffect(() => {
    console.log("renderArea: " + renderArea);
    console.log("renderComponent: " + renderComponent);
  }, [renderArea, renderComponent]);

  return (
    <View>
        <MapView
          ref={map => {
            setMapRef(map);
          }}
          showsBuildings={true}
          showsPointsOfInterest={false}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          followsUserLocation={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
        <NewCacheOverlay
          render={renderComponent}
          cacheName={cacheName}
          radius={cacheRadius}
          center={{latitude: initialPosition.latitude, longitude: initialPosition.longitude}}
          numberOfPoints={numberOfPoints}
          coordinates={locations}
        />
        </MapView>

        {/* { renderComponent && renderArea &&
          <View style={styles.button}>
            <Button 
              title={"Confirm"}
              onPress={() => {renderArea = false; this.state({renderArea})}}
            />
            <Button 
              title={"Abort"}
              color={"red"}
              onPress={() => {renderComponent = false}}
            />
          </View>
        } */}

      </View>
  );
}

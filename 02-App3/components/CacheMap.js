import React, {useContext, useEffect, useState} from 'react';
import { View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE }  from 'react-native-maps';
import { CacheMetadataContext, LocationContext, GeocacheContractContext } from '../App';
import '../global';
import NewCacheOverlay from './NewCacheOverlay';
import SelectGeocache from './SelectGeocache';
export default function CacheMap() {
    // const [mapRef, setMapRef] = useState();
    const mapRef = React.createRef();
    const GeocacheContract = useContext(GeocacheContractContext)
    // TODO this is a hardcode state variable, we need to create a switch to allow users to select a geocache id, by name maybe
    const [selectedGeocache, setSelectedGeocache] = useState(0)
    const locationContext = useContext(LocationContext)
    const { cacheMetadata, setCacheMetadata } = useContext(CacheMetadataContext)

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
    if (locationContext) {
      mapRef.current.setCamera(
        {
          center: {
            latitude: locationContext?.latitude,
            longitude: locationContext?.longitude,
            latitudeDelta: locationContext?.latitudeDelta,
            longitudeDelta: locationContext?.longitudeDelta,
          },
          zoom: 15,
        },
        {duration: 2000},
      );
    }
  }, [locationContext]);

  // Getting all the active geocaches IDs
  // TODO: These are the IDs that the user should be able to select
  useEffect(() => {
    const getIDs = async () => {
      const ids = await GeocacheContract.getAllActiveGeocacheIDs();
      const formattedIds = ids.map((id, index) => Number(id));
      setActiveGeocacheIds([...formattedIds]);
    };
    getIDs();
  }, []);

  useEffect(() => {
    const getData = async () => {
      var selectedGeocacheRawData = await GeocacheContract.tokenIdToGeocache(
        selectedGeocache,
      );
      var selectedGeocacheItemLocations =
        await GeocacheContract.getGeolocationsOfGeocache(selectedGeocache);
      // console.log("selected geocahce: " + JSON.stringify(selectedGeocacheRawData, null, 2))
      // console.log("selected geocache gelocaitons: " + selectedGeocacheItemLocations)
      var itemLocations = [];
      selectedGeocacheItemLocations.map((coordsAsString, index) => {
        var coord = {
          latitude: parseFloat(
            coordsAsString.substring(0, coordsAsString.indexOf(',')),
          ),
          longitude: parseFloat(
            coordsAsString.substring(coordsAsString.indexOf(',') + 1),
          ),
        };
        itemLocations.push(coord);
      });
      setCacheMetadata({
        creator: selectedGeocacheRawData[0],
        imgUrl: selectedGeocacheRawData[1],
        date: selectedGeocacheRawData[2],
        numberOfItems: parseInt(selectedGeocacheRawData[3]),
        isActive: selectedGeocacheRawData[4],
        epicenterLat: selectedGeocacheRawData[5],
        epicenterLong: selectedGeocacheRawData[6],
        name: selectedGeocacheRawData[7],
        radius: parseInt(selectedGeocacheRawData[8]),
        geolocations: itemLocations,
        geocacheId: selectedGeocache,
      });
    };
    getData();
  }, []);

  const formatCoords = () => {};

  // useEffect(() => {
  //   if (connector.accounts) {
  //     console.log('Connector info: ', connector.accounts[0]);
  //   }
  // }, [connector]);

  return (
    <View style={styles.container}>
        {/* <Button></Button> */}
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
            // render={cacheMetadata.creator != undefined}
            // cacheName={cacheMetadata?.name}
            // radius={cacheMetadata?.radius}
            // center={{latitude: cacheMetadata?.epicenterLat, longitude: cacheMetadata?.epicenterLong}}
            // numberOfPoints={cacheMetadata?.numberOfPoints}
            // coordinates={cacheMetadata?.geolocations}
          />
        </MapView>
        <SelectGeocache></SelectGeocache>
      </View>
  );
}

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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    position: "absolute",
    zIndex: 2,
    width: '100%',
    bottom: 0,
    padding: 15,
  },
});

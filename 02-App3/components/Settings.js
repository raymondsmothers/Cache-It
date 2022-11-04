// import * as React from 'react';
// import { Text, View , Button, StyleSheet} from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// const styles = StyleSheet.create({
//   container: {
//     flex: 2,
//     padding: 20,
//   },
// });


// export default function SettingsScreen({navigation}) {
//   return (
//     <View style={[styles.container, {
//       flexDirection: "column"
//     }]}>
//       <View style={{ flex: 2}}>
//     <Text>Profile</Text>
//     </View>
//     <View style={{ flex: 2}}>
//         <Text>Settings</Text>
//         <Button
//         title="How to Play"
//         onPress={() => navigation.navigate('Introduction')}
//       />
//     </View>

            
//     </View>
        
    


//   );
// }
import React from 'react';
import { StyleSheet, Text, View, Button, Modal } from 'react-native';


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    };
  }

  _setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  render() {
    return (
      <View style={styles.container}>

        <Button
          onPress={() => {
            this._setModalVisible(true);
          }}
          title="Show"
        />


        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={{ marginTop: 22 }}>
            <View>
              <Text>Hello World!</Text>

              {/* <RadioButton /> */}

              <Button
                onPress={() => {
                  this._setModalVisible(!this.state.modalVisible);
                }}
                title="Hide Modal"
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


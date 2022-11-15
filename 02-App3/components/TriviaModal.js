import React, { useState, useEffect } from "react";
import { Alert, Linking, Modal, StyleSheet, Text, Pressable, View, ActivityIndicator} from "react-native";
const globalStyles = require("../global")
import {OPENAI_SECRET_KEY} from '@env';
import {RadioButton} from 'react-native-paper';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NavigationContainer, StackActions} from '@react-navigation/native';
export default function TriviaModal() {
  const [modalVisible, setModalVisible] = useState(true);
  const [isGeneratingTrivia, setIsGeneratingTrivia] = useState()
  const [triviaQuestion, setTriviaQuestion] = useState()
  const [triviaAnswerOptions, setTriviaAnswerOptions] = useState([])
  const [triviaCorrectAnswer, setTriviaCorrectAnswer] = useState()
  const [selectedAnswer, setSelectedAnswer] = useState()

  const navigation = useNavigation() 

  const handleSubmit = async () => {
    //Check to see if selected radio button is correct trivia answer
  };

  useEffect(() => {
    generateTrivia()
  })

  const parseTriviaResponse = (response) => {
    // console.log(response)
    // console.log(response.data.choices[0].text)
              // TODO parse trivia response
    // set the state variable "triviaQuestion" to the first line of the response

    // set the state variable "triviaAnswerOptions" to the next 4 lines of the response
    // set the state variable "triviaCorrectAnswer" to the answer that has a "*" next to it
    // print the response to the console  
    
  }
          

  const generateTrivia = async () => {
    setIsGeneratingTrivia(true);
    return new Promise((resolve, reject) => {
      var url = 'https://api.openai.com/v1/completions';
      var bearer = 'Bearer ' + OPENAI_SECRET_KEY;
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-davinci-002',
          prompt: 'Generate a hard trivia question, and then generate 4 trivia options for that question on a new line. Include a "*" next to the correct answer.',
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 1,
          presence_penalty: 1,
          best_of: 2,
        }),
      })
        .then(response => {
          return response.json();
        })
        .then(async data => {
          // console.log(data)
          // console.log(typeof data)
          // console.log(Object.keys(data))
          // console.log(data['choices'][0].text)
          const triviaData = data['choices'][0].text;


          resolve(triviaQuestion);

        })
        .catch(error => {
          console.log('Something bad happened ' + error);
          // setErrorMessage(
          //   'Something bad happened while generating trivia, please try again:  ' +
          //     error,
          // );
          setIsGeneratingTrivia(false);
          // setGeocacheOriginStory('');
        });

      // }
    });
  };



  return (
    // <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalText, {fontWeight: "bold"}]}>{"Trivia Challenge"}</Text>
            <Text style={styles.modalText}>{"Correctly answer the question below to mint the item."}</Text>
            {isGeneratingTrivia ? (
              <View>
                <Text>Loading Trivia</Text>
                <ActivityIndicator></ActivityIndicator>
              </View>
            ) : (
              <View>
                <Text>
                  {triviaQuestion}
                </Text>
                <RadioButton.Group style={styles.radioButtonContainer}>
                    {triviaAnswerOptions?.map((option, index) => {
                      return(
                        <>
                        
                        <RadioButton.Item
                          // style={styles.buttonContainer}
                          key={index}
                          labelStyle={{color: global.secondaryColor}}
                          label={"option"}
                          color={global.primaryColor}
                          onPress={() => setSelectedAnswer(index)}
                          status={ index == selectedAnswer ?  'checked' : 'unchecked'}
                          position={"trailing"}
                          style={styles.radioButton}
                          >
                        </RadioButton.Item>
                        </>
                      )
                    })}
                </RadioButton.Group>
              </View>
            )}
            
  

              <View style={styles.buttonContainer}>


                {true &&
                <Pressable
                    style={[styles.button, {backgroundColor: "#1868B7"}]}
                    onPress={async () =>  await handleSubmit()}
                  >
                  <Text style={styles.textStyle}>{"Submit Answer"}</Text>
                </Pressable>
                }
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setModalVisible(!modalVisible)
                    resetParentState()
                  }}
                >
                  <Text style={styles.textStyle}>{"Close "}</Text>
                </Pressable>
              </View>
          </View>
        </View>
      </Modal>
    // </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    display: "flex",
    padding: 10
    // flexDirection: "row"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  radioButton: {
    // flex: 1
    // width: "90%"
  },
  radioButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 100,
    width: "100%"
  },
  button: {
    // flex: 1,
    margin: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 12,
    fontSize: 18,
    textAlign: "center"
  }
});


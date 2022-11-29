import React, { useState, useEffect } from "react";
import { Alert, Linking, Modal, StyleSheet, Text, Pressable, View, ActivityIndicator} from "react-native";
const globalStyles = require("../styles")
const global = require("../global")
import {OPENAI_SECRET_KEY} from '@env';
import {RadioButton} from 'react-native-paper';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NavigationContainer, StackActions} from '@react-navigation/native';
export default function TriviaModal({mintItemInGeocache, modalVisible, setModalVisible}) {
  // const [modalVisible, setModalVisible] = useState(true);
  const [isGeneratingTrivia, setIsGeneratingTrivia] = useState()
  const [triviaQuestion, setTriviaQuestion] = useState()
  const [triviaAnswerOptions, setTriviaAnswerOptions] = useState([])
  const [triviaCorrectAnswer, setTriviaCorrectAnswer] = useState()
  const [isIncorrect, setIsIncorrect] = useState()
  const [selectedAnswer, setSelectedAnswer] = useState()
  const [errorMessage, setErrorMessage] = useState()
  const navigation = useNavigation() 

  const handleSubmit = async () => {
    //Check to see if selected radio button is correct trivia answer
    if(selectedAnswer == triviaCorrectAnswer) {
        console.log("correct!")
        // setHasCorrectlyAnsweredTrivia(true)
        mintItemInGeocache()
        setModalVisible(!modalVisible);
        // setModalVisible
    }
    else {
      setIsIncorrect(true)
      console.log("incorrect")
    }
  };

  useEffect(() => {
    generateTrivia()
  }, [])

  const parseTriviaResponse = (response) => {
    var data = response.split("\n")
    data = data.filter(element => {
      return element != null && element != "";
    });
    //If the generated trivia is only a answer question pair, regenerate
    if(data.length != 5) {
      console.log("bad response")
      generateTrivia()
      return
    }
    var answerOptions = data.slice(1)
    answerOptions = answerOptions.sort((a, b) => 0.5 - Math.random());
    var correctAnswerIndex = answerOptions.indexOf(data[1]);

    // answerOptions.forEach((element, index, arr) => {
    //     if(element.includes("*"))
    //       correctAnswer = answerOptions.indexOf(element)
    //     arr[index] = element.replace("*", "")
    // });
    // console.log("answer: " + correctAnswerIndex)
    // console.log("options: " + answerOptions)
    // console.log("question: " + data[0])
    // console.log("trivia data: " + data)
    setTriviaCorrectAnswer(correctAnswerIndex)
    setTriviaQuestion(data[0])
    setTriviaAnswerOptions(answerOptions)
    // console.log(response)
    // console.log(response.data.choices[0].text)
              // TODO parse trivia response
    // set the state variable "triviaQuestion" to the first line of the response

    // set the state variable "triviaAnswerOptions" to the next 4 lines of the response
    // set the state variable "triviaCorrectAnswer" to the answer that has a "*" next to it
    // print the response to the console  
    
  }
          

  const generateTrivia = async () => {
    setSelectedAnswer(undefined)
    setIsIncorrect(false)
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
          // prompt: 'Generate a hard trivia question. Then print the answer to this trivia question on a new line. Then generate 4 trivia options for the trivia question on a new line',
          // prompt: 'Generate a hard trivia question, and then print the answer on a new line, and then generate 4 more trivia options on a new line.',
          // prompt: 'Generate an interesting trivia question, and then generate the answer on a new line, and then generate 3 more trivia options for that question on a new line. The trivia options should include the answer.',
          prompt: "Generate a hard trivia question, then generate 4 trivia options, each on a new line, with the first line containing the correct answer",
          temperature: 0.95,
          max_tokens: 500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
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
          parseTriviaResponse(triviaData)
          setIsGeneratingTrivia(false)
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
        })
        ;

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
            <Text style={globalStyles.titleText}>{"Trivia Challenge"}</Text>
            <Text style={styles.modalText}>{"Correctly answer the question below to mint the item."}</Text>
            {isGeneratingTrivia ? (
              <View>
                <Text>Generating Question</Text>
                <ActivityIndicator></ActivityIndicator>
              </View>
            ) : (
              <View>
                {errorMessage == undefined ? (

                  <>
                  <Text style={globalStyles.titleText}>
                    {triviaQuestion}
                  </Text>
                  <RadioButton.Group style={styles.radioButtonContainer}>
                      {triviaAnswerOptions?.map((option, index) => {
                        return(
                          <>
                          
                          <RadioButton.Item
                            // style={styles.buttonContainer}
                            key={option}
                            labelStyle={{color: global.secondaryColor}}
                            label={option}
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
                  </>
                ) : (
                  <Text>{"Uh-Oh, something bad happened: " + errorMessage}</Text>
                )}
                {isIncorrect && (
                  <Text style={[styles.modalText, {color: "red"}]}> Sorry, that is incorrect. Please generate a new question. </Text>
                )}
              </View>
            )}
            
  

              <View style={styles.buttonContainer}>


                {selectedAnswer != undefined && !isIncorrect &&
                <Pressable
                    style={[styles.button, {backgroundColor: "#1868B7"}]}
                    onPress={async () =>  await handleSubmit()}
                    // disabled={isIncorrect}
                  >
                  <Text style={styles.textStyle}>{"Submit Answer"}</Text>
                </Pressable>
                }
                <Pressable
                  style={[styles.button, {backgroundColor: "green"}]}
                  onPress={() => {
                    generateTrivia()
                    // resetParentState()
                  }}
                >
                  <Text style={styles.textStyle}>{"Generate New Question"}</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setModalVisible(!modalVisible)
                    // resetParentState()
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
  },
  modalTitle: {
    marginBottom: 12,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: global.secondaryColor
  }
});


import React, { useState } from 'react';
import { 
    View,
    Image, 
    Button, 
    Text, 
    TouchableOpacity, 
    SafeAreaView,
    ScrollView,
    StyleSheet, 
    Modal 
} from 'react-native';
import { List } from 'react-native-paper';
import "../global"

const howToPlay_createCache = require("../res/HowToPlay-CreateCache.json");

function HowToPlayComponent_CreateCache() {
    // console.log(require(JSON.stringify(howToPlay_createCache.images[0])));
    console.log(typeof JSON.stringify(howToPlay_createCache.images[0]));

    let imagePaths = [];
    for(let i = 0; i < howToPlay_createCache.images.length; i++) {
        imagePaths.push(JSON.stringify(howToPlay_createCache.images[i]));
    }

    return (
            <View>
                <Text style={styles.heading1}>{howToPlay_createCache.textSections[0] + "\n"}</Text>
                <Text style={styles.heading2}>{howToPlay_createCache.textSections[1] + "\n"}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/connect_wallet.png")}
                    style={styles.images}
                />
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[2] + "\n"}</Text>

                <Image
                    source={require("../res/HowToPlay/CreatingCache/metamask_confirm_wallet_link.png")}
                    style={styles.images}
                />
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[3] + "\n"}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/disconnect_wallet.png")}
                    style={styles.images}
                />
                <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_createCache.textSections[4] + "\n"}</Text>

                <Text style={styles.heading2}>{howToPlay_createCache.textSections[5] + "\n"}</Text>
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[6] + "\n"}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/newCacheForm_tab.png")}
                    style={styles.images}
                />
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[7] + "\n"}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/new_cache_form.png")}
                    style={styles.images}
                />
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[8] + "\n"}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/confirm_payment.png")}
                    style={styles.images}
                />
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[9] + "\n"}</Text>
                <Text style={styles.howToPlayText}>{howToPlay_createCache.textSections[10] + "\n"}</Text>
                <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_createCache.textSections[11] + "\n"}</Text>
            </View>
    )
}

function HowToPlayComponent_Search() {

}

function HowToPlayComponent_Minting() {

}

export default function HowToPlayModal() {
    const [showModal, setShowModal] = useState(false);

    const [expanded, setExpanded] = useState(true);
    const handlePress = () => setExpanded(!expanded);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowModal(!showModal)}
                style={styles.roundButton}
            >
                <Text style={styles.buttonText}>?</Text>
            </TouchableOpacity>
            <Modal
                animationType={'slide'}
                transparent={false}
                visible={showModal}
                onRequestClose={() => {
                    setShowModal(false);
                }}
            >
                <ScrollView>
                    <View style={styles.container}>
                        <List.Section title='Accordions'>
                            <List.Accordion
                                title="Create A New Cache"
                            >
                                <HowToPlayComponent_CreateCache />
                            </List.Accordion>

                            <List.Accordion
                                title="Search For A Cache"
                            >
                            </List.Accordion>

                            <List.Accordion
                                title="Claim A Cache"
                            >
                            </List.Accordion>
                        </List.Section>
                        <Button
                            title={"Close"}
                            onPress={() => {setShowModal(!showModal)}}
                            color={global.primaryColor}
                        />
                    </View>
                </ScrollView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
        padding: 0,
    },
    roundButton: {
        width:35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 10,
        borderRadius: 100,
        backgroundColor: global.primaryColor,
    },
    buttonText: {
        color: 'white',
    },
    closeButton: {
        padding: 20
    },
    heading1: {
        fontWeight: '600',
        fontSize: 24,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    heading2: {
        fontWeight: '500',
        fontSize: 20,
        paddingLeft: 20,
        paddingRight: 20,
        textDecorationLine: 'underline',
    },
    howToPlayText: {
        fontSize: 16,
        paddingLeft: 20,
        paddingRight: 20
    },
    noteText: {
        fontWeight: "bold",
    },
    images: {
        aspectRatio: 1,
        alignSelf: "center",
        resizeMode: 'center',
        margin: -110
    }
});
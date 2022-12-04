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
import "../global";

const howToPlay_CreateCache = require("../res/HowToPlay-CreateCache.json");
const howToPlay_ConnectWallet = require("../res/HowToPlay-ConnectWallet.json");
const howToPlay_SearchForCache = require("../res/HowToPlay-SearchForCache.json");
const howToPlay_ViewCache = require("../res/HowToPlay-ViewCache.json");
const howToPlay_ClaimCache = require("../res/HowToPlay-ClaimCache.json");

function HowToPlayComponent_CreateCache() {
    return (
            <View>
                <Text style={styles.heading1}>{howToPlay_CreateCache.textSections[0]}</Text>
                <Text style={styles.howToPlayText}>{howToPlay_CreateCache.textSections[1]}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/new_cache_tab.png")}
                    style={styles.images_landscape}
                />
                <Text style={styles.howToPlayText}>{howToPlay_CreateCache.textSections[2]}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/new_cache_form.png")}
                    style={styles.images_portrait}
                />
                <Text style={styles.howToPlayText}>{howToPlay_CreateCache.textSections[3]}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/metamask_create_cache.png")}
                    style={styles.images_landscape}
                />
                <Text style={styles.howToPlayText}>{howToPlay_CreateCache.textSections[4]}</Text>
                <Image
                    source={require("../res/HowToPlay/CreatingCache/something_cache_cacheMap.png")}
                    style={styles.images_landscape}
                />
                <Text style={styles.howToPlayText}>{howToPlay_CreateCache.textSections[5]}</Text>
                <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_CreateCache.textSections[6]}</Text>
            </View>
    )
}

function HowToPlayComponent_ConnectWallet() {
    return (
        <View>
            <Text style={styles.heading1}>{howToPlay_ConnectWallet.textSections[0] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_ConnectWallet.textSections[1] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_ConnectWallet.textSections[2] + "\n"}</Text>
            <Image
                source={require("../res/HowToPlay/ConnectWallet/connect_wallet.png")}
                style={styles.images_landscape}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ConnectWallet.textSections[3] + "\n"}</Text>

            <Image
                source={require("../res/HowToPlay/ConnectWallet/metamask_confirm_wallet_link.png")}
                style={styles.images_portrait}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ConnectWallet.textSections[4] + "\n"}</Text>
            <Image
                source={require("../res/HowToPlay/ConnectWallet/disconnect_wallet.png")}
                style={styles.images_landscape}
            />
            <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_ConnectWallet.textSections[5] + "\n"}</Text>
        </View>
    )
}

function HowToPlayComponent_Search() {
    return (
        <View>
            <Text style={styles.heading1}>{howToPlay_SearchForCache.textSections[0] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_SearchForCache.textSections[1] + "\n"}</Text>
            <Image
                source={require("../res/HowToPlay/SearchingForCache/select_cache.png")}
                style={styles.images_landscape}
            />
            <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_SearchForCache.textSections[2] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_SearchForCache.textSections[2] + "\n"}</Text>

            <Image
                source={require("../res/HowToPlay/SearchingForCache/select_cache_test_henry.png")}
                style={styles.images_landscape}
            />
            <Text style={styles.howToPlayText}>{howToPlay_SearchForCache.textSections[3] + "\n"}</Text>
            
            <Image
                source={require("../res/HowToPlay/SearchingForCache/test_henry_cache_cacheMap.png")}
                style={styles.images_landscape}
            />
            <Text style={styles.howToPlayText}>{howToPlay_SearchForCache.textSections[4] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_SearchForCache.textSections[5] + "\n"}</Text>
        </View>
    )
}

function HowToPlayComponent_Minting() {
    return (
        <View>
            <Text style={styles.heading1}>{howToPlay_ClaimCache.textSections[0]}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_ClaimCache.textSections[1]}</Text>
            <Image
                source={require("../res/HowToPlay/ClaimingCache/seek_screen.png")}
                style={styles.images_portrait}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ClaimCache.textSections[2]}</Text>
            <Image
                source={require("../res/HowToPlay/ClaimingCache/ar_object.png")}
                style={styles.images_portrait}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ClaimCache.textSections[3]}</Text>
            <Image
                source={require("../res/HowToPlay/ClaimingCache/trivia.png")}
                style={styles.images_portrait}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ClaimCache.textSections[4]}</Text>
            <Image
                source={require("../res/HowToPlay/ClaimingCache/error_cache_creator.png")}
                style={styles.images_portrait}
            />
            <Text style={[styles.howToPlayText, styles.noteText]}>{howToPlay_ClaimCache.textSections[5]}</Text>
        </View>
    )
}

function HowToPlayComponent_ViewCache() {
    return(
        <View>
            <Text style={styles.heading1}>{howToPlay_ViewCache.textSections[0] + "\n"}</Text>
            <Text style={styles.howToPlayText}>{howToPlay_ViewCache.textSections[1] + "\n"}</Text>

            <Image
                source={require("../res/HowToPlay/ViewingCache/app_nft.png")}
                style={styles.images_portrait}
            />

            <Text style={[styles.howToPlayText]}>{howToPlay_ViewCache.textSections[2] + "\n"}</Text>

            <Image
                source={require("../res/HowToPlay/ViewingCache/opensea_view.png")}
                style={styles.images_portrait}
            />
            <Text style={styles.howToPlayText}>{howToPlay_ViewCache.textSections[3] + "\n"}</Text>
        </View>
    );
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
                        <List.Section title='Help'>
                        <List.Accordion
                                title="Connect Your Crypto Wallet"
                            >
                                <HowToPlayComponent_ConnectWallet />
                            </List.Accordion>

                            <List.Accordion
                                title="Create A New Cache"
                            >
                                <HowToPlayComponent_CreateCache />
                            </List.Accordion>

                            <List.Accordion
                                title="Search For A Cache"
                            >
                                <HowToPlayComponent_Search />
                            </List.Accordion>

                            <List.Accordion
                                title="Claim A Cache"
                            >
                                <HowToPlayComponent_Minting />
                            </List.Accordion>

                            <List.Accordion
                                title="Viewing A Cache"
                            >
                                <HowToPlayComponent_ViewCache />
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
    images_portrait: {
        height: 560, 
        width: 280, 
        alignSelf: 'center', 
        resizeMode: 'center'
    },
    images_landscape: {
        height: 280, 
        width: 560, 
        alignSelf: 'center', 
        resizeMode: 'center'
    },
});
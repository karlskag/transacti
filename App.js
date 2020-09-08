import {StatusBar} from 'expo-status-bar';
import React, {Component} from 'react';
import {StyleSheet, Text, View, Animated, PanResponder, Easing} from 'react-native';
import {Feather} from '@expo/vector-icons';
import * as datastore from './datastore/main';
import AppEngine from "@teamhex/hexlib/appEngine";
import * as core from './core';
import * as interpolationFns from './animations/interpolationFunctions';
import performAppSideEffect from './appSideEffects';

const db = datastore.init()
const colors = ["rgb(255,232,204)", "rgb(255,243,191)", "rgb(255,227,227)", "rgb(211,249,216)"];

export default class App extends Component {
    constructor(props) {
        super(props);
        let thisComponent = this;
        thisComponent.onRelease = thisComponent.onRelease.bind(thisComponent);
        thisComponent.state = {
            counter: 0,
            leftTotalAnim: new Animated.Value(0),
            rightTotalAnim: new Animated.Value(0),
            shuffleAnim: new Animated.Value(0),
            cardsPan: new Animated.ValueXY()
        };
        thisComponent.colorIndex = 0;
        thisComponent.cardsPanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (event, gestureState) => {
                thisComponent.state.cardsPan.setValue({
                    x: gestureState.dx,
                    y: thisComponent.state.cardsPan.y
                });
            },
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: function (event, gestureState) {
                thisComponent.onRelease(event, gestureState);
            }
        });

        thisComponent._mounted = false;
        thisComponent.appEngine = AppEngine({
            initialState: props.state || core.createState(),
            performSideEffects: function ({state, swapState}) {
                performAppSideEffect({state, swapState, db});
            },
            onStateChange: function ({state}) {
                thisComponent.props.onStateChange && thisComponent.props.onStateChange(state);
            },
            render: function () {
                if (thisComponent._mounted) {
                    thisComponent.setState({counter: thisComponent.state.counter++});
                }
            }
        });
    }

    componentDidMount() {
        this._mounted = true;
    }

    onRelease(event, gestureState) {
        let edgeDistance = 100;
        let deltaX = gestureState.dx;
        let thisComponent = this;

        if (Math.abs(deltaX) > edgeDistance) {
            let stateAtom = thisComponent.appEngine.stateAtom;
            Animated.timing(thisComponent.state.cardsPan, {
                toValue: deltaX > 0 ? 320 : -320,
                duration: 150,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(thisComponent.state.shuffleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false,
                    easing: Easing.circle
                }).start(() => {
                    thisComponent.state.shuffleAnim.setValue(0);
                    thisComponent.state.cardsPan.setValue({
                        x: gestureState.dx,
                        y: thisComponent.state.cardsPan.y
                    });
                    thisComponent.colorIndex = thisComponent.colorIndex + 1;
                    if (deltaX > 0) {
                        Animated.timing(thisComponent.state.rightTotalAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: false
                        }).start(() => {
                            thisComponent.state.rightTotalAnim.setValue(0);
                        });

                        console.log('classified as shared');
                        stateAtom.swap(core.handleClassification, stateAtom.deref().unclassifiedTransactions[0].id, core.SHARED);
                    } else {
                        Animated.timing(thisComponent.state.leftTotalAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: false
                        }).start(() => {
                            thisComponent.state.leftTotalAnim.setValue(0);
                        });

                        console.log('classified as separate');
                        stateAtom.swap(core.handleClassification, stateAtom.deref().unclassifiedTransactions[0].id, core.SEPARATE);
                    }
                });
            });
        } else {
            Animated.timing(thisComponent.state.cardsPan, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }).start();
        }
    }

    render() {
        let thisComponent = this;
        let state = thisComponent.appEngine.stateAtom.deref();

        const screenParameters = {
            state: state,
            swapState: thisComponent.appEngine.stateAtom.swap
        };

        return (
            <Animated.View style={{...styles.container, backgroundColor: interpolationFns.getBackgroundColorInterpolation(thisComponent.state.shuffleAnim, colors, thisComponent.colorIndex)}}>
                <View style={styles.iconContainerLeft}>
                    <Feather name="user" size={30} color="black"/>
                </View>
                <View style={styles.iconContainerRight}>
                    <Feather name="users" size={30} color="black"/>
                </View>
                <Text style={{display: screenParameters.state.unclassifiedTransactions.length > 1 ? 'none' : undefined, fontFamily: "Courier-Bold", fontSize: 20, position: 'absolute', bottom: 400}}>Färdig-swipeat!</Text>
                {screenParameters.state.unclassifiedTransactions.map(function (transaction, index) {
                    return <Animated.View
                        key={index}
                        {...thisComponent.cardsPanResponder.panHandlers}
                        style={{
                            ...styles.listItem,
                            zIndex: 100 - index,
                            bottom: interpolationFns.getBottomInterpolation(thisComponent.state.shuffleAnim, index),
                            transform: [{scale: interpolationFns.getScaleInterpolation(thisComponent.state.shuffleAnim, index)}]
                                .concat(index < 1 ? {translateX: thisComponent.state.cardsPan.x} : []),
                            opacity: interpolationFns.getOpacityInterpolation(thisComponent.state.shuffleAnim, index),
                        }}>
                        <View style={styles.headingContainer}>
                            <Text style={styles.headingText}>{transaction.data.name}</Text>
                        </View>
                        <Text style={{fontFamily: "Courier", fontSize: 25, paddingTop: 40}}>{transaction.data.amount} kr</Text>
                        <Text style={{fontFamily: "Courier", fontSize: 20, paddingTop: 20}}>{transaction.data.date}</Text>
                    </Animated.View>
                })}
                <Animated.View style={{...styles.leftTotal, transform: [{scale: interpolationFns.getTotalInterpolation(thisComponent.state.leftTotalAnim)}]}}>
                    <Text style={{fontFamily: "Courier-Bold", fontSize: 17, paddingTop: 17}}>Eget</Text>
                    <Text style={{fontFamily: "Courier", fontSize: 19, paddingTop: 18}}>{core.getSeparateTotal(screenParameters.state)} kr</Text>
                </Animated.View>
                <Animated.View style={{...styles.rightTotal, transform: [{scale: interpolationFns.getTotalInterpolation(thisComponent.state.rightTotalAnim)}]}}>
                    <Text style={{fontFamily: "Courier-Bold", fontSize: 17, paddingTop: 17}}>Delat</Text>
                    <Text style={{fontFamily: "Courier", fontSize: 19, paddingTop: 18}}>{core.getSharedTotal(screenParameters.state)} kr</Text>
                </Animated.View>
                <StatusBar style="auto"/>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    listItem: {
        position: 'absolute',
        backgroundColor: 'white',
        height: 290,
        width: 250,
        flex: 1,
        alignItems: 'center',
        borderRadius: 8
    },
    shadow: {
        borderTopWidth: 1,
        borderColor: '#3d4147'
        // borderColor: '#f2f2f2'
    },
    iconContainerLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 600,
        left: 90,
        width: 80,
        height: 60,
        backgroundColor: "white",
        borderRadius: 50
    },
    iconContainerRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 600,
        right: 90,
        width: 80,
        height: 60,
        backgroundColor: "white",
        borderRadius: 50
    },
    headingContainer: {
        backgroundColor: '#495057',
        width: 250,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    headingText: {
        fontFamily: "Courier-Bold",
        color: 'white',
        fontSize: 35,
        paddingTop: 30,
        paddingBottom: 20,
        textAlign: "center"
    },
    leftTotal: {
        position: 'absolute',
        bottom: 115,
        backgroundColor: 'white',
        width: 115,
        height: 90,
        left: 65,
        borderRadius: 7,
        flex: 1,
        alignItems: 'center'
    },
    rightTotal: {
        position: 'absolute',
        bottom: 115,
        backgroundColor: 'white',
        width: 115,
        height: 90,
        right: 65,
        borderRadius: 7,
        flex: 1,
        alignItems: 'center'
    }
});

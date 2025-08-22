import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CUSTOM_TAB_BAR_HEIGHT } from '@/constants/TabBar';
import {BlurView} from "expo-blur";
import {Colors} from "@/constants/Colors";

interface TabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();
    const tabWidth = 80; // Fixed tab width based on padding
    const translateX = useSharedValue(0);
    const circleScale = useSharedValue(0);
    const scaleValues = state.routes.map(() => useSharedValue(1));
    const labelTranslateYValues = state.routes.map(() => useSharedValue(0));
    const iconTranslateYValues = state.routes.map(() => useSharedValue(0));

    React.useEffect(() => {
        translateX.value = withSpring(state.index * tabWidth, {
            damping: 16,
            stiffness: 150,
        });
        circleScale.value = withTiming(1, { duration: 300 });

        scaleValues.forEach((scale, index) => {
            if (state.index === index) {
                scale.value = withSpring(1.4, {
                    damping: 30,
                    stiffness: 300,
                });

                // Animate labels down when selected, up when not selected
                labelTranslateYValues.forEach((translateY, index) => {
                    translateY.value = withSpring(state.index === index ? 20 : 0, {
                        damping: 30,
                        stiffness: 300,
                    });
                });
            } else {
                // Immediate for deselected (scaling down)
                scale.value = withSpring(1, {
                    damping: 30,
                    stiffness: 300,
                });

                // Animate labels down when selected, up when not selected
                labelTranslateYValues.forEach((translateY, index) => {
                    translateY.value = withSpring(state.index === index ? 20 : 0, {
                        damping: 30,
                        stiffness: 300,
                    });
                });
            }
        });

        // Animate icons down slightly when selected
        iconTranslateYValues.forEach((translateY, index) => {
            translateY.value = withSpring(state.index === index ? 6 : 0, {
                damping: 15,
                stiffness: 300,
            });
        });
    }, [state.index, tabWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const circleAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: circleScale.value }],
        };
    });

    const iconAnimatedStyles = scaleValues.map((scale, index) => 
        useAnimatedStyle(() => {
            return {
                transform: [
                    { scale: scale.value },
                    { translateY: iconTranslateYValues[index].value }
                ],
            };
        })
    );

    const labelAnimatedStyles = labelTranslateYValues.map((translateY) =>
        useAnimatedStyle(() => {
            return {
                transform: [{ translateY: translateY.value }],
            };
        })
    );


    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <BlurView intensity={10} tint="dark" style={styles.tabContainer}>

                <Animated.View style={[styles.indicator, { width: tabWidth }, animatedStyle]}>
                    <Animated.View style={[circleAnimatedStyle]}>
                        <LinearGradient
                            colors={['#ec3660', '#cd3d3d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.circle}
                        />
                    </Animated.View>
                </Animated.View>

                {state.routes.map((route: any, index: number) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const getTabIcon = (routeName: string, isFocused: boolean) => {
                        switch (routeName) {
                            case 'index':
                                return 'film';
                            case 'tv-shows':
                                return 'tv';
                            case 'watchlist':
                                return isFocused ? 'heart.fill' : 'heart';
                            default:
                                return isFocused ? 'house.fill' : 'house';
                        }
                    };

                    const getTabLabel = (routeName: string) => {
                        switch (routeName) {
                            case 'index':
                                return 'Movies';
                            case 'tv-shows':
                                return 'TV Shows';
                            case 'watchlist':
                                return 'Watchlist';
                            default:
                                return routeName;
                        }
                    };


                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tab}
                            onPress={onPress}
                            activeOpacity={0.8}
                        >

                            <Animated.View style={[styles.iconContainer, iconAnimatedStyles[index]]}>
                                <IconSymbol
                                    size={24}
                                    name={getTabIcon(route.name, isFocused)}
                                    color={Colors.text}
                                />
                            </Animated.View>

                            <Animated.Text style={[
                                styles.label,
                                { color: Colors.text },
                                labelAnimatedStyles[index]
                            ]}>
                                {getTabLabel(route.name)}
                            </Animated.Text>
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
    },
    indicator: {
        position: 'absolute',
        top: 1,
        bottom: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    circle: {
        width: 80,
        height: 58,
        borderRadius: 30,
    },
    tabContainer: {
        flexDirection: 'row',
        position: 'relative',
        height: CUSTOM_TAB_BAR_HEIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 60,
        zIndex: 10,
        alignSelf: 'center',
        paddingHorizontal: 0,
        overflow: 'hidden',
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        width: 80,
        position: 'relative',
        zIndex: 5,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    whiteIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
        zIndex: 8,
    },
});
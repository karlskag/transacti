export function getBottomInterpolation(animationHandler, cardIndex) {
    return animationHandler.interpolate({
        inputRange: [0, 1],
        outputRange: [240 + cardIndex * (28 - (cardIndex * 2)), 240 + (cardIndex - 1) * (28 - (cardIndex * 2))]
    });
}

export function getScaleInterpolation(animationHandler, cardIndex) {
    return animationHandler.interpolate({
        inputRange: [0, 1],
        outputRange: [1 - (cardIndex * 0.10), (1 - ((cardIndex - 1) * 0.10))]
    });
}

export function getOpacityInterpolation(animationHandler, cardIndex) {
    return animationHandler.interpolate({
        inputRange: [0, 1],
        outputRange: [cardIndex === 1 ? 0.9 : (1 - (cardIndex * 0.33)), (cardIndex - 1) > 1 ? (1 - ((cardIndex - 1) * 0.33)) : 1]
    });
}

export function getBackgroundColorInterpolation(animationHandler, colors, colorIndex) {
    return animationHandler.interpolate({
        inputRange: [0, 1],
        outputRange: [colors[colorIndex % colors.length], colors[(colorIndex + 1) % colors.length]]
    });
}


export function getTotalInterpolation(animationHandler) {
    return animationHandler.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.1, 1]
    });
}
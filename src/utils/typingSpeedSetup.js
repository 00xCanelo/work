const TYPING_SPEEDS = {
    Ultra_fast: 25,
    Fast: 75,
    Medium: 100,
    Slow: 125
};

function getTypingSpeed(speed) {
    return TYPING_SPEEDS[speed] || TYPING_SPEEDS.Medium;
}

function getTypingVariation(baseSpeed) {
    const variation = Math.random() * 0.3 + 0.85;
    return Math.floor(baseSpeed * variation);
}

function getRandomPause() {
    return Math.floor(Math.random() * 300) + 100;
}

function shouldCorrect() {
    return Math.random() < 0.05;
}

module.exports = {
    TYPING_SPEEDS,
    getTypingSpeed,
    getTypingVariation,
    getRandomPause,
    shouldCorrect
};

//定義 AudioManager
const AudioManager = (() => {
    let sounds = {};

    // 載入音效
    function loadSound(name, src) {
        const audio = new Audio(src);
        sounds[name] = audio;
    }

    // 播放音效
    function playSound(name) {
        console.log('播放音樂了嗎？？？')
        if (sounds[name]) {
            sounds[name].currentTime = 0; // 重置播放進度
            sounds[name].play();
        }
    }

    function pauseSound(name) {
        if (sounds[name] && !sounds[name].paused) {
            sounds[name].pause();
        }
    }

    // 初始化音效
    function init() {
        loadSound("buttonClick", "/audio/button-click.mp3");
        loadSound("sliderMove", "/audio/slider-move.mp3");
        loadSound("discSpin", "/audio/disc-spin.mp3");
        loadSound("djOn", "/audio/dj-on.mp3");
        loadSound("djOff", "/audio/dj-off.mp3");

    }

    return { init, playSound, pauseSound };
})();

document.addEventListener("DOMContentLoaded", () => {
    AudioManager.init();
});

export default AudioManager; //可以直接匯入其他 .js

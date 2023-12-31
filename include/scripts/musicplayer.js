let audio = document.getElementById('music-player');
let playButton = document.getElementById('music-player-btn');
let volumeSlider = document.getElementById('music-player-slider');

function playMusic(){
    if (audio.paused) {
        audio.play();
        playButton.innerHTML = 'Pause';
    }else{
        audio.pause();
        playButton.innerHTML = 'Play';
    }
}
function changeVolume(){
    audio.volume = Math.round(volumeSlider.value) / 100 * 0.5;
}
audio.volume = 0.3;
playButton.addEventListener('click', playMusic);
volumeSlider.addEventListener('change', changeVolume);

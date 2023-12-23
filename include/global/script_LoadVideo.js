'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const player = new Plyr('#player', {
        title: 'Introduction to Networking',
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        controls: [
            'play-large', // The large play button in the center
            'play', // Play/pause playback
            'progress', // The progress bar and scrubber for playback and buffering
            'current-time', // The current time of playback
            'duration', // The full duration of the media
            'mute', // Toggle mute
            'volume', // Volume control
            'captions', // Toggle captions
            'settings', // Settings menu
            'pip', // Picture-in-picture 
            'airplay', // Airplay 
            'fullscreen', // Toggle fullscreen
          ]
    });
});

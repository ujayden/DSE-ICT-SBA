'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const player = new Plyr('#player', {
        title: 'Introduction to Networking',
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        controls: [
            'play-large', 
            'play', 
            'progress', 
            'current-time', 
            'duration', 
            'mute', 
            'volume', 
            'captions', 
            'settings', 
            'pip', 
            'airplay', 
            'fullscreen', 
          ]
    });
});

let currentURL = new URL(window.location.href).origin;

let btnDashboard = document.getElementById('btnDashboard');
let searchInput = document.getElementById('headerSearch');

btnDashboard.addEventListener('click', () => {
    window.location.href = currentURL + '/dashboard/index.html';
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        window.location.href = currentURL + '/search.html?q=' + searchInput.value;
    }
});
(function loadBookMark() {
    let hash = window.location.hash;

    if (hash) {
        let tabLinks = document.querySelectorAll('.list-group-item');
        for (let i = 0; i < tabLinks.length; i++) {
            if (tabLinks[i].getAttribute('href') === hash) {
                new bootstrap.Tab(tabLinks[i]).show();
                break;
            }
        }
    }
})();
document.querySelectorAll('.list-group-item').forEach(function(link) {
    link.addEventListener('click', function(event) {
        history.pushState({}, '', link.getAttribute('href'));
    });
});
let nextPageLinks = document.querySelectorAll('.nextPageLink');

nextPageLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        history.pushState({}, '', link.getAttribute('href'));
        let hash = link.getAttribute('href');
        let targetTab = document.querySelector('.list-group-item[href="' + hash + '"]');
        if (targetTab) {
            new bootstrap.Tab(targetTab).show();
        }
    });
});

let openBeginnerQuizBtn = document.getElementById('openBeginnerQuiz');

openBeginnerQuizBtn.addEventListener('click', () => {
    window.location.href = currentURL + '/learning/beginner/quiz1.html';
}
);
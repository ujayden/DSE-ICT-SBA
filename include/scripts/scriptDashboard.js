'use strict';
let startButtons = {
    Beginner: document.getElementById('courseStartBeginner'),
    Basic: document.getElementById('courseStartBasic'),
    Advanced: document.getElementById('courseStartAdvanced'),
    Expert: document.getElementById('courseStartExpert')
}
let currentURL = new URL(window.location.href).origin;
startButtons.Beginner.addEventListener('click', () => {
    window.location.href = currentURL + '/learning/beginner/index.html';
});

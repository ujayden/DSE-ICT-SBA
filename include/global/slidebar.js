'use strict';
let toggle = document.getElementById('header-toggle'),
  nav = document.getElementById('nav-bar'),
  bodypd = document.getElementById('body-pd'),
  headerpd = document.getElementById('header');

let grayBackground = document.getElementById('greyBackground');

function toggleNavBar() {
    nav.classList.toggle('nav-show');
    toggle.classList.toggle('bx-x');
    bodypd.classList.toggle('body-pd');
    headerpd.classList.toggle('body-pd');
	if (grayBackground.style.visibility != 'visible') {
		grayBackground.style.visibility = 'visible';
	} else {
		grayBackground.style.visibility = 'hidden';
	}
}
toggle.addEventListener('click', () => {
	toggleNavBar();
});
grayBackground.addEventListener('click', () => {
	toggleNavBar();
});
let navSelfClose = document.getElementById('navCloseSelf');
if (navSelfClose) {
    navSelfClose.addEventListener('click', () => {
        toggleNavBar();
    });
}
let linkColor = document.querySelectorAll('.nav_link');
  
function colorLink() {
    if (linkColor) {
        linkColor.forEach((l) => l.classList.remove('navActive'));
        this.classList.add('navActive');
    }
}
  
linkColor.forEach((l) => l.addEventListener('click', colorLink));
  

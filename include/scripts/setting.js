'use strict';
let backToTop_btn = document.getElementById('backToTop_btn')
//Select <body>
let backToTop_TopTarget = document.getElementById("header");

let scrollContainer = document.getElementById("main");

//Scroll to top when clicking the button
backToTop_btn.addEventListener('click', function() {
    scrollContainer.scroll({top: 0, behavior: "smooth"})
}
);
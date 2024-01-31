'use strict';
let backToTop_btn = document.getElementById('backToTop_btn')
//Select <body>
let backToTop_TopTarget = document.getElementById("header");

//Scroll to top when clicking the button
backToTop_btn.addEventListener('click', function() {
    window.scroll({top: 0, behavior: "smooth"})
}
);
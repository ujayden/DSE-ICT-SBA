'use strict';
let slideIndex = 1;
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("photo-container");
    if (n > slides.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0 ; i < slides.length ; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
}
let slideChangedByUser = false;
function nextSlide(n) {
    showSlides(slideIndex += n);
}
showSlides(1);
document.getElementById("prev").addEventListener("click", function() {
    nextSlide(-1);
    slideChangedByUser = true;
}
);
document.getElementById("next").addEventListener("click", function() {
    nextSlide(1);
    slideChangedByUser = true;
}
);
//Auto slide
function autoSlide() {
    if (!(slideChangedByUser)) {
    nextSlide(1);
    }else {
        clearInterval(autoGallerySlide);
    }
}
let autoGallerySlide = setInterval(autoSlide, 5000);
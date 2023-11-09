'use strict';
let scrollCooldown = false;
$(document).ready(function(){
    $("#posterBenefitCarousel").owlCarousel({
        items: 3, // Number of items shown in each slide
        loop: true, // Continuously loop the carousel
        margin: 20, // Space between items
        lazyLoad: true,
        center: true, // Center Carousel
        autoplay: true, // Autoplay Carousel
        autoplayTimeout: 2000, // Autoplay Interval
        autoplayHoverPause: true, // Pause on hover
        nav: true, // Show navigation buttons
        navText: ["<i class='fas fa-chevron-left'></i>", "<i class='fas fa-chevron-right'></i>"], // Custom navigation icons
        responsive: {
            0: {
                items: 1 // Number of items shown in the carousel for smaller screens
            },
            768: {
                items: 2 // Number of items shown in the carousel for medium screens
            },
            992: {
                items: 3 // Number of items shown in the carousel for large screens
            }
        }
    });
    $("#posterCommentCarousel").owlCarousel({
        items: 3, // Number of items shown in each slide
        loop: true, // Continuously loop the carousel
        margin: 20, // Space between items
        lazyLoad: true,
        center: true, // Center Carousel
        autoplay: true, // Autoplay Carousel
        autoplayTimeout: 1800, // Autoplay Interval
        autoplayHoverPause: true, // Pause on hover
        nav: true, // Show navigation buttons
        navText: ["<i class='fas fa-chevron-left'></i>", "<i class='fas fa-chevron-right'></i>"], // Custom navigation icons
        responsive: {
            0: {
                items: 1 // Number of items shown in the carousel for smaller screens
            },
            768: {
                items: 2 // Number of items shown in the carousel for medium screens
            },
            992: {
                items: 3 // Number of items shown in the carousel for large screens
            }
        }
    });
        
    let benefitCarousel = $('#posterBenefitCarousel');
    benefitCarousel.on('mousewheel', '.owl-stage', function (e) {
        if (e.originalEvent.deltaY>0 && !scrollCooldown) {
            benefitCarousel.trigger('next.owl');
            scrollCooldown = true;
        } else if (e.originalEvent.deltaY<0 && !scrollCooldown) {
            benefitCarousel.trigger('prev.owl');
            scrollCooldown = true;
        }else{
            return false;
        }
        setTimeout(function(){
            scrollCooldown = false;
        }, 100);
        e.preventDefault();
    }
    );
});

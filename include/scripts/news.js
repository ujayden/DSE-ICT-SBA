'use strict';
document.getElementById('button-search').addEventListener('click', function() {
    document.getElementById('searchInProgress').style.display = 'block';
});
let currentURL = new URL(window.location.href).origin;
let shareBtns = $('.newsShare');
shareBtns.each(function() {
    $(this).on('click', function(event) {
        event.preventDefault();
        let cardContainer = $(this).closest('.card');
        let readMoreLink = cardContainer.find('a').attr('href');
        let title = cardContainer.find('.card-title').text();
        let constructUrl = new URL(currentURL + readMoreLink);
        if (navigator.share) {
            navigator.share({
                title: title,
                url: constructUrl
            }).catch(error => {
                navigator.clipboard.writeText(constructUrl.href).then(() => {
                    alert('URL copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy URL to clipboard', err);
                });
            });
        } else {
            console.log(constructUrl)
            navigator.clipboard.writeText(constructUrl.href).then(() => {
                alert('URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy URL to clipboard', err);
            });
        }
    });
});


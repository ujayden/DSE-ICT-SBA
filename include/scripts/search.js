'use strict';
let searchPageAttributes = {
    searchInput: undefined,
    pageURL: undefined,
    viewPage: 1,
    mode: 'resultDisplay'
}
let currentURL = new URL(window.location.href);
searchPageAttributes.pageURL = currentURL.origin + '/api/search.php';
searchPageAttributes.searchInput = currentURL.searchParams.get('q');
if (searchPageAttributes.searchInput === null) {
    let fallbackSearchInput = currentURL.searchParams.get('search');
    if (fallbackSearchInput !== null) {
        debugger;
        window.location.href = '/search.html?q=' + fallbackSearchInput;
        console.error('Alert: Use fallback search input as "?search=" instead of "?q=". Please update the link to use "?q=" instead of "?search=".');
    }
    searchPageAttributes.searchInput = '';
    searchPageAttributes.mode = 'promptInput';
}
//Check google search mode
searchPageAttributes.viewPage = currentURL.searchParams.get('page');
if (searchPageAttributes.viewPage === null) {
    searchPageAttributes.viewPage = 1;
}
//Check the mode of the page
let searchForm = document.getElementById('searchInputContainer');
let resultContainer = document.getElementById('resultContainer');
//Form
let searchFormInput = document.getElementById('formSearch');
let searchFormButton = document.getElementById('formSearchBtn');
searchForm.classList.remove('hidden');
resultContainer.classList.add('hidden');
searchFormButton.addEventListener('click', () => {
    if (searchFormInput.value !== '') {
        searchPageAttributes.searchInput = searchFormInput.value;
        searchPageAttributes.mode = 'resultDisplay';
        displayResults();
    }
}
);
if (searchPageAttributes.mode === 'promptInput') {
    displayPrompt();
}else if (searchPageAttributes.mode === 'resultDisplay') {
    displayResults();
}else{
    console.error('Invalid mode for' + searchPageAttributes.mode + '. Use fallback mode: promptInput');
    displayPrompt();
}
function displayPrompt(){
    searchForm.classList.remove('hidden');
    resultContainer.classList.add('hidden');
}
function displayResults(){
    searchForm.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    setupResult();
}

let searchResult;
let searchResultContainer = document.getElementById('result-container');
let searchResultTermsContainer = document.getElementById('search-result-terms');
let searchResultTermsCount = document.getElementById('search-result-count');
let searchResultTotalPagesCount = document.getElementById('search-result-page-count');


async function setupResult(){
    //TODO: Update the address bar
    history.pushState(null, null, '?q=' + searchPageAttributes.searchInput + '&page=' + searchPageAttributes.viewPage); 
    searchResult = await fetchResult(searchPageAttributes.searchInput, searchPageAttributes.viewPage);
    if (searchResult.success) {
        //TODO: Display the result
        renderResult(searchResult.data);
        updateButton(searchPageAttributes.viewPage, searchResult.data.totalPages);
        
    }else{
        //TODO: Display error
        searchResultTermsContainer.innerHTML = searchPageAttributes.searchInput;
        searchResultTermsCount.innerHTML = 'No';
        searchResultTotalPagesCount = '0';
        searchResultContainer.innerHTML = '<div class="alert alert-danger" role="alert"><h4 class="alert-heading">Sorry, but something went wrong.</h4> <p>Please try again later. We apologize for the inconvenience.<p></div>';
    }
}
function renderResult(data){
    searchResultTermsContainer.innerHTML = data.terms;
    searchResultTermsCount.innerHTML = data.totalResults;
    searchResultTotalPagesCount.innerHTML = data.totalPages;
    //searchResultContainer.innerHTML = '';
    if (data.totalResults > 0) {
        data.results.forEach((result) => {
            let resultItem = document.createElement('div');
            resultItem.classList.add('result-item-text');
            //Use appendChild instead of innerHTML to prevent XSS
            let resultHashtags = document.createElement('ul');
            resultHashtags.classList.add('hashtagList');
            try {
                result.hashtags.forEach((hashtag) => {
                    let hashtagLink = "/search.html?q=" + encodeURIComponent(hashtag);
                    let hashtagItem = document.createElement('li');
                    let hashtagItemLink = document.createElement('a');
                    hashtagItemLink.setAttribute('href', hashtagLink);
                    hashtagItemLink.innerHTML = hashtag;
                    hashtagItem.appendChild(hashtagItemLink);
                    resultHashtags.appendChild(hashtagItem);
                }); 
            }catch (e) {
                let hashtagItem = document.createElement('li');
                resultHashtags.appendChild(hashtagItem);
            }
            //Use appendChild instead of innerHTML to prevent XSS
            let resultItemTitle = document.createElement('a');
            resultItemTitle.classList.add('result-item-title');
            resultItemTitle.setAttribute('href', result.url);
            resultItemTitle.innerHTML = result.title;
            resultItem.appendChild(resultItemTitle);
            
            resultItem.appendChild(document.createElement('br'));

            let resultItemLink = document.createElement('a');
            resultItemLink.classList.add('result-item-link');
            resultItemLink.setAttribute('href', result.url);
            resultItemLink.innerHTML = result.url;
            resultItem.appendChild(resultItemLink);

            let resultItemDate = document.createElement('p');
            resultItemDate.classList.add('result-item-date');
            resultItemDate.innerHTML = "Last update: " + result.updateTime;
            resultItem.appendChild(resultItemDate);

            let resultItemDescription = document.createElement('p');
            resultItemDescription.classList.add('result-item-description');
            resultItemDescription.innerHTML = result.content;
            resultItem.appendChild(resultItemDescription);

            let resultItemCheckNowLink = document.createElement('a');
            resultItemCheckNowLink.setAttribute('href', result.url);
            resultItemCheckNowLink.innerHTML = "Check Now";
            resultItem.appendChild(resultItemCheckNowLink);
            
            resultItem.appendChild(resultHashtags);
            resultItem.appendChild(document.createElement('hr'));

            searchResultContainer.appendChild(resultItem);
        });
    }else{
        searchResultContainer.innerHTML = '<div class="alert alert-warning" role="alert"><h4 class="alert-heading">Sorry, but we cannot find any result.</h4> <p>Please try again with different keywords.<p></div>';
    }
}
let backButton = document.getElementById('backToPrevious');
let nextButton = document.getElementById('goToNext');
let homeButton = document.getElementById('goToFirst');
let prevStatusDisplay = document.getElementById('prevStatus');
let nextStatusDisplay = document.getElementById('nextStatus');

function updateButton(currentPage, totalPages){
    currentPage = parseInt(currentPage);
    //Setup the back button first
    if (currentPage <= 1) {
        //Add disabled class to the parent
        backButton.parentElement.classList.add('disabled');
    }else{
        //Remove disabled class from the parent
        backButton.parentElement.classList.remove('disabled');
        //Change the link
        backButton.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=' + (currentPage - 1));
    }
    //Setup the next button
    if (currentPage >= totalPages) {
        //Add disabled class to the parent
        nextButton.parentElement.classList.add('disabled');
    }else{
        //Remove disabled class from the parent
        nextButton.parentElement.classList.remove('disabled');
        //Change the link
        nextButton.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=' + (currentPage + 1));
    }
    //Setup the home button
    homeButton.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=1');
    //Setup the rest of the buttons. Like [Previous 1 ... 99 100 101 102 103 ... Next] (Current page is 100, ... is a disabled link)
    //For page 1, [Previous 1 2 3 4 5 ... Next], for page 2, [Previous 1 2 3 4 5 ... Next], for page 4, [Previous 1 ... 3 4 5 6 ... Next], for page 5, [Previous 1 ... 3 4 5 6 ... Next]
    //TODO: Check if the page is does need prev ... or not
    if (currentPage > 3) {
        //Add prev ...
        prevStatusDisplay.parentElement.classList.remove('hidden');
    }
    if (currentPage < totalPages - 2) {
        nextStatusDisplay.parentElement.classList.remove('hidden');
    }
    //TODO: Add the rest of the buttons with appendChild
    if (currentPage == 1) {
        //TODO: Mark the first button as active
        homeButton.parentElement.classList.add('active');
    }else{
        //TODO: Render it self after the ... button
        let newButton = document.createElement('li');
        let newButtonLink = document.createElement('a');
        newButtonLink.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=' + currentPage);
        newButtonLink.innerHTML = currentPage;
        newButton.id = 'page' + currentPage;
        newButton.classList.add('page-item');
        newButtonLink.classList.add('page-link');
        newButton.classList.add('active');
        newButton.appendChild(newButtonLink);
        let parentElement = prevStatusDisplay.parentElement.parentElement;
        let referenceNode = prevStatusDisplay.parentElement.nextSibling;
        parentElement.insertBefore(newButton, referenceNode);
    }
    //Render the rest of the buttons
    //Previous button
    for (let i = currentPage -1; i<=currentPage-1; i++) {
        if (i > 1) {
            let newButton = document.createElement('li');
            let newButtonLink = document.createElement('a');
            newButtonLink.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=' + i);
            newButtonLink.innerHTML = i;
            newButton.id = 'page' + i;
            newButton.classList.add('page-item');
            newButtonLink.classList.add('page-link');
            newButton.appendChild(newButtonLink);
            let targetElement = document.getElementById('page' + currentPage);
            targetElement.parentElement.insertBefore(newButton, targetElement);
        }
    }
    //Next button
    //Note that render more button if the current page is 1
    let toRenderNextButtonCount;
    switch (currentPage) {
        case 1:
            toRenderNextButtonCount = 4;
            break;
        case 2:
            toRenderNextButtonCount = 3;
            break;
        default:
            toRenderNextButtonCount = 2;
        break;
    }
    for (let i = currentPage + toRenderNextButtonCount; i > currentPage; i--) {
        if (i <= totalPages) {
            let newButton = document.createElement('li');
            let newButtonLink = document.createElement('a');
            newButtonLink.setAttribute('href', '?q=' + searchPageAttributes.searchInput + '&page=' + i);
            newButtonLink.innerHTML = i;
            newButton.id = 'page' + i;
            newButton.classList.add('page-item');
            newButtonLink.classList.add('page-link');
            newButton.appendChild(newButtonLink);
            let targetElement;
            if (currentPage == 1) {
                targetElement = homeButton.parentElement;
            }else{
                targetElement = document.getElementById('page' + currentPage);
            }
            targetElement.parentElement.insertBefore(newButton, targetElement.nextSibling);
        }
    }
}

async function fetchResult(searchParams, page){
    let result = {
        success: true,
        data: {
            terms: undefined,
            currentPage: undefined,
            resultsPerPage: 10,
            totalResults: undefined,
            totalPages: undefined,
            results: []
        }
    }
    try {
        const response = await fetch(searchPageAttributes.pageURL + '?searchTerm=' + searchParams + '&page=' + page);
        const data = await response.json();
        result.success = data.success;
        result.data.terms = data.terms;
        result.data.currentPage = data.currentPage;
        result.data.resultsPerPage = data.resultsPerPage;
        result.data.totalResults = data.totalResults;
        result.data.totalPages = data.totalPages;
        result.data.results = data.result;
    } catch (error) {
        result.success = false;
        console.error(error);
    }
    return result;
}
// Load more button: Next page
let loadMoreButton = document.getElementById('result-footer-btn');
loadMoreButton.addEventListener('click', () => {
    window.location.href = '?q=' + searchPageAttributes.searchInput + '&page=' + (parseInt(searchPageAttributes.viewPage) + 1);
});
// Use google search with programmable search engine
let googleSearchButton = document.getElementById('google-enhanced-search-tab');
googleSearchButton.addEventListener('click', () => {
    //TODO: Update the address bar
    history.pushState(null, null, '?q=' + searchPageAttributes.searchInput);
});
let searchAgain = document.getElementById('formSearch2');
let searchAgainButton = document.getElementById('formSearchBtn2');
searchAgainButton.addEventListener('click', () => {
    window.location.href = '/search.html?q=' + searchAgain.value;
}
);
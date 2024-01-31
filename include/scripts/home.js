'use strict';
//Function for latest news
//Refresh the news
let news = document.getElementById('News');
let newsDetail = [
    "2023-12-29 OpenAI has released GPT-4.5 secretly",
    "2023-12-28 NVIDIA has released  GeForce RTX 4090 D GPU to the China market",
    "2023-10-23 HKEAA has released the timetable for 2024 DSE"
]
//Allow user to close the news
let closeNews = document.getElementById('newsLoopClose');
closeNews.addEventListener('click', function() {
    document.getElementById('newsLoop').style.display = 'none';
    clearInterval(newsLoopRefresh);
}
);
//Allow user to change the news
let newsCurrentNo = 1;
let newsCountDisplay = document.getElementById('newsCount');

/**
 * 
 * @param {Number} newsDirection //The direction of the news, 1 for next, -1 for back.
 */
function changeNews(newsDirection) {
    newsCurrentNo += newsDirection;
    if (newsCurrentNo > newsDetail.length) {
        newsCurrentNo = 1;
    }
    if (newsCurrentNo < 1) {
        newsCurrentNo = newsDetail.length;
    }
    news.innerHTML = newsDetail[newsCurrentNo-1];
    newsCountDisplay.innerHTML = newsCurrentNo + "/" + newsDetail.length;
}
let newsChangeBack = document.getElementById('newsLoopBack');
newsChangeBack.addEventListener('click', function() {
    changeNews(-1);
    clearInterval(newsLoopRefresh);
    pauseNews.style.display = 'none';
}
);
let newsChangeNext = document.getElementById('newsLoopNext');
newsChangeNext.addEventListener('click', function() {
    changeNews(1);
    clearInterval(newsLoopRefresh);
    pauseNews.style.display = 'none';
}
);
//Auto refresh the news
let newsLoopRefresh = setInterval(function() {
    changeNews(1);
}, 5000);
let pauseNews = document.getElementById('newsLoopPause');
pauseNews.addEventListener('click', function() {
    clearInterval(newsLoopRefresh);
    pauseNews.style.display = 'none';
}
);
changeNews(0);


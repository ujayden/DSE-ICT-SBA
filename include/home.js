'use strict';
//Function for latest news
//Refresh the news
//TODO: Add a function to refresh the news
let news1 = document.getElementById('News1');
let news2 = document.getElementById('News2');
let news3 = document.getElementById('News3');
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
function changeNews(newsDirection) {
    if (newsCurrentNo == 1 && newsDirection == -1) {
        newsCurrentNo = 3;
    }
    else if (newsCurrentNo == 3 && newsDirection == 1) {
        newsCurrentNo = 1;
    }else{
        newsCurrentNo += newsDirection;
        //The += is same as newsCurrentNo = newsCurrentNo + newsDirection
    }
    //Change the news
    switch (newsCurrentNo) {
        case 1:
            news1.style.display = 'block';
            news2.style.display = 'none';
            news3.style.display = 'none';
            document.getElementById('newsCount').innerHTML = '1/3';
            break;
        case 2:
            news1.style.display = 'none';
            news2.style.display = 'block';
            news3.style.display = 'none';
            document.getElementById('newsCount').innerHTML = '2/3';
            break;
        case 3:
            news1.style.display = 'none';
            news2.style.display = 'none';
            news3.style.display = 'block';
            document.getElementById('newsCount').innerHTML = '3/3';
            break;
    }
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
//Copyright @uncle-jayden, licensed under CC BY-NC-ND 4.0
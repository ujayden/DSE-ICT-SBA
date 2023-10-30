//Get basic information about the quiz
let quizForm = document.getElementById("quizArea");
let currentURL = new URL(window.location.href);
let urlPath = "/learning/quizData/";
let quizAttributes = {
    "ID": undefined,
    "DataSourceURL": undefined,
    "AnswerURL": undefined,
    "Name": undefined,
    "Description": undefined,
    "TimeLimit": undefined,
    "AllowAway": undefined,
    "AllowReview": undefined,
    "AdditionTime": 0,
}
try{
    quizID = document.getElementById("main-Quiz").getAttribute("data-Quiz-ID");
}catch(e){
    quizID = currentURL.searchParams.get("id");
}finally{
    if (quizID == undefined || quizID == null || quizID == "" || isNaN(quizID)) {
        window.alert("Quiz ID is not valid. Try again.");
        throw new Error("Quiz ID is not valid. Try again.");
    }
    quizAttributes.ID = quizID;
}
//Get the quiz information from the server
//Read the config first, load URL from quiz itself
try{
    quizConfigURL = document.getElementById("main-Quiz").getAttribute("data-config-url");
    quizConfigURL = currentURL.origin + urlPath + quizConfigURL;
}catch (e){
}finally{
    if (quizConfigURL == undefined || quizConfigURL == null || quizConfigURL == "") {
        window.alert("Quiz Config URL is not valid. Try again.");
        throw new Error("Quiz Config URL is not valid. Try again.");
    }
    quizAttributes.DataSourceURL = quizConfigURL;
}
//Get the anwer url from the quiz itself
try{
    quizAnswerURL = document.getElementById("main-Quiz").getAttribute("data-answer-url");
    quizAnswerURL = currentURL.origin + urlPath + quizAnswerURL;
}
catch (e){
    if (quizAnswerURL == undefined || quizAnswerURL == null || quizAnswerURL == "") {
        window.alert("Quiz Answer URL is not valid. Try again.");
        throw new Error("Quiz Answer URL is not valid. Try again.");
    }
    quizAttributes.DataSourceURL = quizAnswerURL;
}finally{
    quizAttributes.AnswerURL = quizAnswerURL;
}
//Use jQuery to load these data
$.ajax({
    url: quizConfigURL,
    dataType: "json",
    success: function (data) {
        quizAttributes.Name = data.Name;
        quizAttributes.Description = data.Description;
        quizAttributes.TimeLimit = data.TimeLimit;
        quizAttributes.AllowAway = data.AllowAway;
        quizAttributes.AllowReview = data.AllowReview;
        quizAttributes.AdditionTime = data.AdditinTime;
        //Load the quiz
        loadQuiz();
    },
    error: function (xhr, status, error) {
        console.log("Error: " + error.message);
    }
});
//Use jQuery to load quiz answers
$.ajax({
    url: quizAnswerURL,
    dataType: "json",
    success: function (data) {
        quizAttributes.Answers = data;
    },
    error: function (xhr, status, error) {
        console.log("Error: " + error.message);
    }
});
//Unhide the quiz

function loadQuiz() {
    //Load the Time Limit first. In seconds
    let timeLimit = quizAttributes.TimeLimit;
    timeLimit = timeLimit + quizAttributes.AdditionTime;
}



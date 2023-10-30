'use strict';
//Get basic information about the quiz
let quizForm = document.getElementById("quizArea");
//Setup for a prompt that will be used later


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
    "AllowChatbot": undefined,
    "AllowHints": undefined,
    "shuffleQuestions": false,
    "AdditionTime": 0,
}
let quizID = undefined;
let quizConfigURL = undefined;
let quizAnswerURL = undefined;
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
    async: false,
    success: function (data) {
        quizAttributes.shuffleQuestions = data.config.shuffleQuestions;
        quizAttributes.AllowAway = data.config.allowAway;
        quizAttributes.AllowReview = data.config.allowReview;
        quizAttributes.Name = data.config.quizName;
        quizAttributes.TimeLimit = data.config.timeLimit + 0; //Will be updated later with user account enabled
        quizAttributes.AllowChatbot = data.config.allowSupport;
        quizAttributes.AllowHints = data.config.allowHints;
        //Update the time limit
        quizAttributes.AdditionTime = data.config.additionTime;
        console.log(quizAttributes); //Should be removed in production
    },
    error: function (xhr, status, error) {
        console.log("Error: " + error.message);
    }
});
//Use jQuery to load quiz questions and answers
let MCquizQuestions = [];
let LQquizQuestions = [];
$.ajax({
    url: quizAnswerURL,
    dataType: "json",
    async: false,
    success: function (data) {
        MCquizQuestions = data.mcQuiz;
        console.log(MCquizQuestions); //Should be removed in production
        LQquizQuestions = data.LongQuiz;
        console.log(LQquizQuestions); //Should be removed in production
    },
    error: function (xhr, status, error) {
        console.log("Error: " + error.message);
    }
});
//Unhide the quiz

let counterArea_AllowedTime = document.getElementById("timer-allowed_Time");
let counterArea_RemainingTime = document.getElementById("timer-remaining_Time");
let quizFeatAway = document.getElementById("quiz-Away");
let mcIntro = document.getElementById("mcIntro");
let mcConunt = document.getElementById("mcCount");
let askChatbot = document.getElementById("quiz-Call-Chatbot");
let askHint = document.getElementById("quiz-Call-Hint");
let mcForm = document.getElementById("quiz-mc");


let loadQuizSuccess = false;
let countMC = 0;
function shuffle(array) {
    //Credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

function renderMCQuiz(QuizID, QuizName, QuizQuestions, QuizDescription, QuizImage, QuizImageAltText , QuizAnswers, isShuffleable) {
    let mcQuestion = document.createElement("p");
    mcQuestion.innerHTML = QuizName;
    mcForm.appendChild(mcQuestion);
    //Create the image
    if (QuizImage != undefined && QuizImage != null && QuizImage != "") {
        let mcImage = document.createElement("img");
        mcImage.setAttribute("src", QuizImage);
        try{
            mcImage.setAttribute("alt", QuizImageAltText);
        }catch(e){
            console.warn("Image alt text is not provided. Consider contact the admin to fix this issue.");
        }
        mcForm.appendChild(mcImage);
    }
    //Create the description
    if (QuizDescription != undefined && QuizDescription != null && QuizDescription != "") {
        let mcDescription = document.createElement("p");
        mcDescription.innerHTML = QuizDescription;
        mcForm.appendChild(mcDescription);
    }
    //Create br
    mcForm.appendChild(document.createElement("br"));
    //Create the options
    let mcOptions = QuizQuestions;
    if (isShuffleable) {
        mcOptions = shuffle(mcOptions);
    }
    mcOptions.forEach(function (option) {
        //Create the option
        let mcOption = document.createElement("input");
        mcOption.setAttribute("type", "radio");
        mcOption.setAttribute("name", "mc-" + QuizID + "-Ans");
        mcOption.setAttribute("value", option.id);
        mcForm.appendChild(mcOption);
        mcForm.appendChild(document.createTextNode(option.text));
        mcForm.appendChild(document.createElement("br"));
    }
    );
}
function loadMCQuiz() {
    //Count the number of questions
    countMC = MCquizQuestions.length;
    mcConunt.innerHTML = countMC;
    if (countMC <= 0) {
        mcIntro.style.display = "none";
        return false;
    }
    //Load the MC questions
    MCquizQuestions.forEach(function (question, index) {
        //Remove in production
        console.log(question);
        //Render the question, create the element in form first
        //MC Question always comes first stored in form id="quiz-mc"
        //Create the question
        renderMCQuiz(question.id, question.question, question.options, question.description, question.image, question.imageAltText, question.correctAnswerID, question.hint, question.shuffleable);
    }
    );
}
let countLQ = 0;
let lqIntro = document.getElementById("lqIntro");
function loadLQQuiz() {
    countLQ = LQquizQuestions.length;
    if (countLQ <= 0) {
        return false;
    }
    //Load the LQ questions, WIP
    console.warn("Long question is not supported yet.");
    return false;

}
function loadQuiz() {
    //Load the Time Limit first
    counterArea_AllowedTime.innerHTML = "Time allowed:" + quizAttributes.TimeLimit/60 + " minutes";
    //Check if away is allowed
    if (!(quizAttributes.AllowAway)) {
        quizFeatAway.style.display = "none";
    }
    //Check if the support and hint are allowed
    if (!(quizAttributes.AllowChatbot)) {
        askChatbot.style.display = "none";
    }
    if (!(quizAttributes.AllowHints)) {
        askHint.style.display = "none";  
    }
    //Call the function to load the quiz
    //MC Question always comes first stored in form id="quiz-mc"
    loadMCQuiz();
    //Long Question stored in form id="quiz-lq"
    loadLQQuiz();
    //Set the finish flag to true
    loadQuizSuccess = true;
}
//loadQuiz();
loadQuiz();

function gradeQuiz(){
    
}
//Grade the quiz after the user submit the quiz
quizForm.addEventListener("submit", function (event) {
    event.preventDefault();
    //Check if the quiz is loaded
    if (!loadQuizSuccess) {
        window.alert("Quiz is not loaded yet. Please try again.");
        return false;
    }
    gradeQuiz();
}
);

//Timer, Hint prompt, startup prompt, chatbot prompt, away prompt, submit prompt, grateing are WIP.
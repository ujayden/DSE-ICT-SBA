'use strict';
//Get basic information about the quiz
let quizForm = document.getElementById("quizArea");
//Setup for a prompt that will be used later
let mainQuiz = document.getElementById("main-Quiz");
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
    quizID = mainQuiz.getAttribute("data-Quiz-ID");
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
        LQquizQuestions = data.LongQuiz;
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
function addAccessiblityButton(sendTo, buttonID, buttonValue) {
    let button = document.createElement("button");
    button.setAttribute("id", buttonID);
    button.innerHTML = buttonValue;
    sendTo.appendChild(button);
    document.getElementById(buttonID).addEventListener("click", function () {
        console.warn("This feature is not supported yet.");
    }
    );
}
function renderImage(sendTo, imageURL, imageAltText) {
    let container = document.createElement("div");
    container.setAttribute("class", "quiz-image-container");
    let image = document.createElement("img");
    image.setAttribute("src", imageURL);
    try{
        image.setAttribute("alt", imageAltText);
    }catch(e){
        console.warn("Image alt text is not provided. Consider contact the admin to fix this issue.");
    }
    container.appendChild(image);
    //Add accessiblity button on RHS: 
    let containerRHS = document.createElement("div");
    containerRHS.setAttribute("class", "quiz-image-container-RHS");
    container.appendChild(containerRHS);
    sendTo.appendChild(container);
    addAccessiblityButton(containerRHS, "img-FullScreen-View", "Open in full screen");
    addAccessiblityButton(containerRHS, "img-NewPage-View", "Open in new page");
}

function renderMCQuiz(QuizID, QuizName, QuizQuestions, QuizDescription, QuizImage, QuizImageAltText , QuizAnswers, isShuffleable) {
    let mcQuestion = document.createElement("p");
    mcQuestion.innerHTML = "Q" + QuizID + ": "  + QuizName;
    mcForm.appendChild(mcQuestion);
    //Create the image
    if (QuizImage != undefined && QuizImage != null && QuizImage != "") {
        renderImage(mcForm, QuizImage, QuizImageAltText);
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
    let counter = 0;
    let AnswerABCD =  "A. "
    mcOptions.forEach(function (option) {
        //Create the option
        let mcOption = document.createElement("input");
        mcOption.setAttribute("type", "radio");
        mcOption.setAttribute("name", "mc-" + QuizID + "-Ans");
        mcOption.setAttribute("value", option.id);
        mcOption.setAttribute("id", "mc-" + QuizID + "-Ans-" + option.id);
        mcForm.appendChild(mcOption);
        //Create the label
        let mcOptionLabel = document.createElement("label");
        mcOptionLabel.setAttribute("for", "mc-" + QuizID + "-Ans-" + option.id);
        switch (counter) {
            case 0:
                AnswerABCD = "A. ";
                break;
            case 1:
                AnswerABCD = "B. ";
                break;
            case 2:
                AnswerABCD = "C. ";
                break;
            case 3:
                AnswerABCD = "D. ";
                break;
            case 4:
                AnswerABCD = "E. ";
            break;
            default:
                AnswerABCD = "A. ";
                break;
        }   
        mcOptionLabel.innerHTML = AnswerABCD + option.text;
        mcForm.appendChild(mcOptionLabel);
        //Create the br
        mcForm.appendChild(document.createElement("br"));
        counter++;
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
        //Render the question, create the element in form first
        //MC Question always comes first stored in form id="quiz-mc"
        //Create the question
        renderMCQuiz(question.id, question.question, question.options, question.description, question.image, question.imageAltText, question.correctAnswerID, question.hint, question.shuffleable);
    }
    );
}
let countLQ = 0;
let lqIntro = document.getElementById("lqIntro");
function startQuiz() {
    //Hide the prompt
    closePrompt();
    //Show the quiz
    quizArea.style.visibility = "visible";
    //Start the timer
    //WIP
}
function loadLQQuiz() {
    countLQ = LQquizQuestions.length;
    if (countLQ <= 0) {
        return false;
    }
    //Load the LQ questions, WIP
    console.warn("Long question is not supported yet.");
    return false;

}
let chatbotIframe = document.getElementById("chatbot-iFrame");
function toggleChatbotIframe(){
    if (chatbotIframe.style.visibility != "visible") {
        chatbotIframe.style.visibility = "visible";
    }else{
        chatbotIframe.style.visibility = "hidden";
    }
}

let quizArea = document.getElementById("quizArea");
const quizName = document.getElementById("quizName");
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
    }else{
        chatbotIframe.appendChild(document.createElement("iframe")).setAttribute("src", "/chatbot.html")   ;
        askChatbot.addEventListener("click", function () {
            toggleChatbotIframe();
        });
    }
    if (!(quizAttributes.AllowHints)) {
        askHint.style.display = "none";  
    }
    //Call the function to load the quiz
    //Prompt the user to start the quiz
    //function setupPrompt (pTitle, pContent, allowClose, closeFunc, allowCancel, cancelFunc, cancelBTNValue, allowConfirm, confirmFunc, confirmBTNValue)
    setupPrompt("Loading Quiz", "Please wait. The quiz is loading...", false, undefined, false, undefined, undefined, false, undefined, undefined);
    //Hide the quiz first
    quizArea.style.visibility = "hidden";
    //MC Question always comes first stored in form id="quiz-mc"
    loadMCQuiz();
    //Long Question stored in form id="quiz-lq"
    loadLQQuiz();    
    document.querySelectorAll('img').forEach(img => {
        img.draggable = false;
    });
    //Set the finish flag to true
    loadQuizSuccess = true;
    //Prepare to change the prompt content
    let pContent = "Quiz is loaded. <br> You have " + quizAttributes.TimeLimit/60 + " minutes to complete the quiz. <br> Click the start button to start the quiz.";
    //Change the prompt content
    setupPrompt(quizName.innerHTML, pContent, false, undefined, false, undefined, undefined, true, function(){
        startQuiz();
    }, "Start!");
}
//loadQuiz();
loadQuiz();
let totalScore = 0;
let mcTotalScore = 0;
let lqTotalScore = 0;
let userMCAnswer = [
        
]
let userLQAnswer = {

}
function gradeQuiz(){
    //Load the user answer with JQuery
    //MC Questions

    //Get the user answer
    for (let i = 0; i < countMC; i++) {
        let userAnswer = $("input[name='mc-" + MCquizQuestions[i].id + "-Ans']:checked").val();
        userMCAnswer[MCquizQuestions[i].id] = userAnswer;
    }
    userMCAnswer = userMCAnswer.filter(item => item !== '');
    //Get the correct answer
    let correctMCAnswer = [
    ]
    //Get correct answer from MCquizQuestions
    MCquizQuestions.forEach(function (question) {
        correctMCAnswer[question.id] = question.correctAnswerID;
    }
    );
    correctMCAnswer = correctMCAnswer.filter(item => item !== '');
    //Compare the MC answer
    for (let i = 0; i < userMCAnswer.length; i++) {
        if (userMCAnswer[i] != undefined && userMCAnswer[i] == correctMCAnswer[i]) {
            mcTotalScore++;
        }
    }
    //Skip for LQ
    //Calculate the total score
    totalScore = mcTotalScore + lqTotalScore;
}
function closeWindow(){
    //window.close();
}
//Post-quiz
function returnResult(){
    if (sendSuccess == false) {
        setupPrompt ("Error", "Sorry, something went wrong. Please try again later.", false, undefined, false, undefined, undefined, false, undefined, undefined);
        clearInterval(updateQuizPrompt);
        return false;
    }
    if (sendSuccess == true) {
        setupPrompt ("Congratulation!", "Your result is uploaded. <br> Your score is " + totalScore + " out of " + countMC + ". <br> You may check your performance in detail on Progress Tracking Report. <Br> Click the button below to return to the course.", false, undefined, false, undefined, undefined, true, function(){
            closeWindow();
        }
        , "Close the window and return to dashboard");
        clearInterval(updateQuizPrompt);
    return true;
    }
}
let sendSuccess = undefined;
function postQuiz(){
    let updateQuizPrompt = setInterval(returnResult, 1000);
    //Tell user the result is uploading, do not close the window
    setupPrompt ("Don't close the window", "Your result is uploading to the server. Please wait.", false, undefined, false, undefined, undefined, false, undefined, undefined);
    //Block browser from closing the window
    window.onbeforeunload = function() {
        return "Your result is uploading to the server. Please wait.";
    };
    //Upload the result to the server
    //Get what the user select and the relative option
    let userMCAnswerInWord = {

    }
    let userLQAnswerInWord = {
    }
    for (let i = 0; i < userMCAnswer.length; i++) {
        if (userMCAnswer[i] == undefined) {
            userMCAnswerInWord[i] = {
                "id": i+1,
                "text": "No answerd"
            }
        }else{
            //TODO: Extract the answer in readable word from MCquizQuestions
            userMCAnswerInWord[i] = {
                "id": i+1,
                "text": MCquizQuestions[i].options.find(option => option.id === userMCAnswer[i]).text
            }
        }
    }
        //Skip for LQ
        //Upload the result to the server
        //Get the user ID from local storage
        let userID = undefined;
        try{
            userID = localStorage.getItem("userID");
        }catch(e){
            console.Error("User ID is not found. Send to server as anonymous.");
            userID = "anonymous";
        }
        //Reminder: The quiz ID is already loaded in the beginning - quizAttributes.ID
        //Setup the data to send
        let data = {
            "userID": userID,
            "quizID": quizAttributes.ID,
            "mcQuiz": userMCAnswerInWord,
            "mcScore": mcTotalScore,
            "lqQuiz": userLQAnswerInWord,
            "lqScore": lqTotalScore,
            "totalScore": totalScore
            //TODO: Add the time used - WIP
        }
        console.log(data);
        data = JSON.stringify(data);
        //Send the data to the server
        let url = currentURL.origin + "/api/quizResult.php";
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function (data) {
                sendSuccess = true;
            },
            error: function (xhr, status, error) {
                sendSuccess = false;
                console.log("Error: " + error.message);
            }   
        });
}

//Grade the quiz after the user submit the quiz
document.getElementById("submitQuiz").addEventListener("click", function () {
    //Check if the quiz is loaded
    if (!loadQuizSuccess) {
        window.alert("Quiz is not loaded yet. Please try again.");
        return false;
    }
    gradeQuiz();
    //Post the result to the server
    postQuiz();
    //Tell the user the result is uploaded + show the result
        closeWindow();
    }, "Close");

//Timer, Hint prompt, away prompt, image viewer are WIP.
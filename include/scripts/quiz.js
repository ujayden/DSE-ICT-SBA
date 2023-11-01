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

let counterArea_AllowedTime = document.getElementById("quiz-cdTime");
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
    let currentIndex = array.length, randomIndex;
  
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
function accessibilityImage(imageURL, imageAlt, callElm) {
    //Check the button to do what
    if (callElm.getAttribute("data-Accessibility-Opt") == "img-FullScreen-View") {
        //Open in prompt
        let tempImg = document.createElement("img");
        tempImg.setAttribute("src", imageURL);
        tempImg.setAttribute("alt", imageAlt);
        tempImg.setAttribute("class", "quiz-image-container-fullscreen");
        tempImg.setAttribute("tabindex", "0");
        setupPrompt("Image", tempImg.outerHTML, true, closePrompt(), false, undefined, undefined, true, closePrompt(), "Close");
    }else if (callElm.getAttribute("data-Accessibility-Opt") == "img-NewPage-View") {
        window.open(imageURL, "_blank", "fullscreen=yes");
    }
}
function addAccessiblityButton(sendTo, buttonID, buttonValue, QuizID) {
    let button = document.createElement("button");
    button.setAttribute("data-Accessibility-Opt", buttonID);
    buttonID = buttonID + "-" + QuizID;
    button.setAttribute("id", buttonID);
    button.innerHTML = buttonValue;
    sendTo.appendChild(button);
    document.getElementById(buttonID).addEventListener("click", function (event) {
        event.preventDefault();
        let image = this.parentElement.parentElement.querySelector("img");
        let imageURL = image.getAttribute("src");
        let imageAlt = image.getAttribute("alt");
        let callElm = this;
        accessibilityImage(imageURL, imageAlt, callElm);
    }
    );
}
function renderImage(sendTo, imageURL, imageAltText, QuizID) {
    let container = document.createElement("div");
    container.setAttribute("class", "quiz-image-container");
    let image = document.createElement("img");
    image.setAttribute("src", imageURL);
    image.setAttribute("tabindex", "0");
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
    addAccessiblityButton(containerRHS, "img-FullScreen-View", "Open in full screen", QuizID);
    addAccessiblityButton(containerRHS, "img-NewPage-View", "Open in new page", QuizID);
}
//Add remain question card count
let remainingQuestionsArea = document.getElementById("remaining-Questions");
function remainingQuestionsAdd(questionType, questionID) {
    //<span id="remaining1" class="remaining-box">1</span>
    if (questionType == "mc") {
        let remaining = document.createElement("span");
        remaining.setAttribute("id", "remaining" + questionID);
        remaining.setAttribute("class", "remaining-box");
        remaining.setAttribute("data-Question-Type", "mc");
        remaining.setAttribute("aria-label", "Question " + questionID + " is not answered. Click or press Enter to go to question " + questionID + ".");
        remaining.setAttribute("tabindex", "0");
        remaining.innerHTML = questionID;
        remainingQuestionsArea.appendChild(remaining);
        //Add event listener
        remaining.addEventListener("click", function () {
            let targetQuestionID = remaining.innerHTML;
            if (this.attributes.getNamedItem("data-Question-Type").value == "mc") {
                targetQuestionID = "mc-" + targetQuestionID;
            }
            let targetQuestion = document.getElementById(targetQuestionID);
            targetQuestion.scrollIntoView();
        });

    }
}

function renderMCQuiz(QuizID, QuizName, QuizQuestions, QuizDescription, QuizImage, QuizImageAltText , QuizAnswers, isShuffleable) {
    let mcQuestion = document.createElement("p");
    mcQuestion.innerHTML = "Q" + QuizID + ": "  + QuizName;
    mcQuestion.setAttribute("id", "mc-" + QuizID);
    mcQuestion.setAttribute("tabindex", "0");
    mcForm.appendChild(mcQuestion);
    //Create the image
    if (QuizImage != undefined && QuizImage != null && QuizImage != "") {
        renderImage(mcForm, QuizImage, QuizImageAltText, QuizID);
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
    loadedQuizCount++;
    remainingQuestionsAdd("mc", loadedQuizCount);
}

let loadedQuizCount = 0;
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
//Countdown timer
let remainingTime = undefined;
let counterDisplay = document.getElementById("quiz-cdReamining");
let timeLimit = undefined;
let timerRunning = false;
function updateCDTimer(){
    let cdMin = Math.floor(remainingTime/60);
    let cdSec = remainingTime - cdMin * 60;
    if (cdSec < 10) {
        cdSec = "0" + cdSec;
    }
    if (cdMin < 10) {
        cdMin = "0" + cdMin;
    }
    //Update the display
    counterDisplay.innerHTML = cdMin + ":" + cdSec;
    if (timerRunning == true) {
        remainingTime--;
    }else{
        return false;
    }
    counterDisplay.setAttribute("aria-label", "Time remaining: " + cdMin + " minutes " + cdSec + " seconds");
    //Check if the time is up
    if (remainingTime <= 20) {
        if (remainingTime <= 0) {
            clearInterval(cdTimerInterval);
            setupPrompt("Time is up!", "Your time is up.");
            toggleGrayOut(true);
            gradeQuiz();
            postQuiz();
        }
    if (remainingTime.Math.floor(remainingTime/2) == 0) {
        counterDisplay.style.color = "red";
    }else{
        counterDisplay.style.color = "black";
    }
    //Update quiz-cdReamining - aria-label for screen reader
}
}
function countDownTimer(timeLimit){
    timeLimit = parseInt(quizAttributes.TimeLimit);
    remainingTime = timeLimit;
    //Update time before the timer starts
    let cdMin = Math.floor(remainingTime/60);
    let cdSec = remainingTime - cdMin * 60;
    if (cdSec < 10) {
        cdSec = "0" + cdSec;
    }
    if (cdMin < 10) {
        cdMin = "0" + cdMin;
    }
    counterDisplay.innerHTML = cdMin + ":" + cdSec;
}

let countLQ = 0;
let lqIntro = document.getElementById("lqIntro");
let timeIntervalRunning = false;
let cdTimerInterval;
function startQuiz() {
    //Hide the prompt
    closePrompt();
    //Show the quiz
    quizArea.style.visibility = "visible";
    //Start the timer
    timerRunning = true;
    cdTimerInterval = setInterval(updateCDTimer, 1000);
}
function resumeQuiz() {
    timeLimit--;
    //Hide the prompt
    closePrompt();
    //Show the quiz
    quizArea.style.visibility = "visible";
    //Start the timer
    timerRunning = true;
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
        askChatbot.innerHTML = "Hide Chatbot";
    }else{
        chatbotIframe.style.visibility = "hidden";
        askChatbot.innerHTML = "Ask Chatbot";
    }
}
//Making hint Prompt only generate once only.
let hintPrompt = (function () {
    if (!(quizAttributes.AllowHints)){
        return false;
    }
    let MChintRelation = [

    ]
    let LQhintRelation = [
    ]
    //Get the hint relation
    for (let i = 0; i < MCquizQuestions.length; i++) {
        let hint = MCquizQuestions[i].hint;
        if (hint != undefined || hint != null || hint != "") {
            MChintRelation[i] = {
                "id": i+1,
                "hint": hint
            }
        }
    }
    //Skip for LQ
    //Create the hint prompt
    let hintPromptString;
    if (MChintRelation.length > 0) {
        hintPromptString = "<h2>MC Questions</h2>";
        MChintRelation.forEach(function (hint) {
            hintPromptString += "<h3>Q" + hint.id + ":<h3>";
            hintPromptString += "<p>" + hint.hint + "</p>";
        }
        );
        hintPromptString = "<div class='hintPromptContainer'>" + hintPromptString + "</div>";
        hintPromptString += "<br>";
    }
    return hintPromptString;
})();
function toggleHintPrompt(){
    setupPrompt("Hint", hintPrompt, true, closePrompt(), false, undefined, undefined, true, closePrompt(), "Okay");
}
let quizArea = document.getElementById("quizArea");
const quizName = document.getElementById("quizName");
function loadQuiz() {
    //Load the Time Limit first
    counterArea_AllowedTime.innerHTML = quizAttributes.TimeLimit/60;
    countDownTimer();
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
    }else{
        askHint.addEventListener("click", function () {
            toggleHintPrompt();
        });
    }
    //Call the function to load the quiz
    //Prompt the user to start the quiz
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
let MCresultDisplay = [
]
/**
 * {
 *  "id": 1,
 *  "isCorrect": true
 *  "correctAnswerInWord": "Wireless Router",
 * }
 */
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
        //Send to MCresultDisplay for later use
        MCresultDisplay[i] = {
            "id": i+1,
            "isCorrect": (userMCAnswer[i] == correctMCAnswer[i]),
            "correctAnswerInWord": MCquizQuestions[i].options.find(option => option.id === correctMCAnswer[i]).text
        }

    }
    //Skip for LQ
    //Calculate the total score
    totalScore = mcTotalScore + lqTotalScore;
}
function closeWindow(){
    window.close();
}
let userData = undefined;
//Post-quiz
function constructResult(){
    //TODO: Construct a div with diff color for every question to show user correct or wrong.
    //MC Questions
    MCquizQuestions.forEach(function (question) {
        let setItem = $('#mc-'+ question.id).get(0);
        let resultContainer = document.createElement("div");
        resultContainer.setAttribute("class", "resultContainer");
        let result = document.createElement("p");
        result.setAttribute("class", "result");
        //Check if the user answer is correct
        if (MCresultDisplay[question.id-1].isCorrect) {
            result.innerHTML = "✅ Correct";
            resultContainer.classList.add("correct");
        }else{
            result.innerHTML = "❌ Wrong";
            resultContainer.classList.add("incorrect");
            //Show the correct answer
            result.innerHTML += "<br> Correct answer: " + MCresultDisplay[question.id-1].correctAnswerInWord;
        }
        resultContainer.appendChild(result);
        setItem.appendChild(resultContainer);
    }
    );
}
    //Skip for LQ
function returnResult(){
    //Allow the user to close the window
    window.onbeforeunload = null;
    constructResult();
    if (sendSuccess == false) {
        setupPrompt ("Error", "Your result is not uploaded. Please try again.", true, closePrompt(), true, closePrompt(), "Back to see result", true, function(){
            closeWindow();
        }
        , "Exit");
        clearInterval(updateQuizPrompt);
        return false;
    }
    if (sendSuccess == true) {
        //function setupPrompt (pTitle, pContent, allowClose, closeFunc, allowCancel, cancelFunc, cancelBTNValue, allowConfirm, confirmFunc, confirmBTNValue){
        setupPrompt ("Congratulation!", "Your result is uploaded. <br> Your score is " + totalScore + " out of " + countMC + ". <br> You may check your performance in detail on Progress Tracking Report. <Br> Click the button below to return to the course.", true, closePrompt(), true, closePrompt(), "Back to see result", true, function(){
            closeWindow();
        }
        , "Exit");
        clearInterval(updateQuizPrompt);
    return true;
    }
}
let sendSuccess = undefined;
let updateQuizPrompt = undefined;
function postQuiz(){
    updateQuizPrompt = setInterval(returnResult, 1000);
    //Lock all the text input and radio button
    let allInput = document.querySelectorAll("input");
    allInput.forEach(function (input) {
        input.disabled = true;
    }
    );
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
            "totalScore": totalScore,
            "remainTime": remainingTime
        }
        console.log(data);
        userData = data;
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
                //sendSuccess = false;
                sendSuccess = false;
                console.log("Error: " + error.message);
            }   
        });
}

//Grade the quiz after the user submit the quiz
const submitQuiz = document.querySelectorAll(".submitQuiz");
submitQuiz.forEach(function (button) {
    button.addEventListener("click", function () {
        //Check if the quiz is loaded
        if (!loadQuizSuccess) {
            window.alert("Quiz is not loaded yet. Please try again.");
            return false;
        }
        clearInterval(cdTimerInterval);
        gradeQuiz();
        //Post the result to the server
        postQuiz();
        //Tell the user the result is uploaded + show the result
        closeWindow();
    },);
}
);
document.getElementById("submitQuizIntro").addEventListener("click", function () {
    //Check if the quiz is loaded
    if (!loadQuizSuccess) {
        window.alert("Quiz is not loaded yet. Please try again.");
        return false;
    }
    clearInterval(cdTimerInterval);
    gradeQuiz();
    //Post the result to the server
    postQuiz();
    //Tell the user the result is uploaded + show the result
    closeWindow();
}
);

document.getElementById("quiz-GoDown").addEventListener("click", function () {
    window.scrollTo(0, document.body.scrollHeight);
}
);
document.getElementById("quiz-Exit").addEventListener("click", function () {
    setupPrompt("Exit Quiz", "Are you sure you want to exit the quiz? Your progress will not be saved.", true, closePrompt(), true, closePrompt(), "No", true, function(){
        closeWindow();
    }, "Yes");
}
);
let quizInfoContainer = document.getElementById("quiz-Info-Container");
function toggleQuizInfoOnTop(){
    if (!(quizInfoContainer.classList.contains("forced-OnTop"))) {
        quizInfoContainer.classList.add("forced-OnTop");
        toggleGrayOut(true);
        document.getElementById('checkQuizInfo').classList.add('cqi-active');
        
    }else{
        quizInfoContainer.classList.remove("forced-OnTop");
        toggleGrayOut(false);
        document.getElementById('checkQuizInfo').classList.remove('cqi-active');
    }
}
document.getElementById("checkQuizInfo").addEventListener("click", function () {
    toggleQuizInfoOnTop();
}
);
function pauseQuiz(){
    //Pause the timer
    timerRunning = false;
    //Hide the quiz
    quizArea.style.visibility = "hidden";
    //Pause the quiz
    clearInterval(cdTimerInterval);
    setupPrompt("Quiz Paused", "Your quiz is paused. Click the button below to resume the quiz.", false, undefined, false, undefined, undefined, true, function(){
        resumeQuiz();
    }, "Resume");

    toggleGrayOut(true);
}
document.getElementById("quiz-Away").addEventListener("click", function () {
    pauseQuiz();
}
);
//Change the number of not answered questions
let dispalyCounterNAQ = document.getElementById("quiz-Progress-Content-Body-Question-Number");
let totalQuestion = loadedQuizCount;
let counterNAQ = 0;
let counterAQ = 0;
let userAnswered = [
]
function updateNAQ(){
    //Get the number of answered questions
    //Update userAnswered with their id if they are answered
    for (let i = 0; i < countMC; i++) {
        let userAnswer = $("input[name='mc-" + MCquizQuestions[i].id + "-Ans']:checked").val();
        if (userAnswer != undefined) {
            userAnswered[i] = MCquizQuestions[i].id;
        }
    }
    //Make remainingX to be green if the question is answered
    let allRemaining = document.querySelectorAll(".remaining-box");
    allRemaining.forEach(function (remaining) {
        if (userAnswered.includes(parseInt(remaining.innerHTML))) {
            remaining.classList.add("remaining-box-answered");
        }else{
            remaining.classList.remove("remaining-box-answered");
        }
    }
    );
    //Update the counter
    dispalyCounterNAQ.innerHTML = totalQuestion - userAnswered.filter(function(answer) {return answer !== '' && answer !== null && answer !== undefined;}).length;
}
updateNAQ();
//Check when there is an update on the user answer status for every user input
let allInput = document.querySelectorAll("input");
allInput.forEach(function (input) {
    input.addEventListener("change", function () {
        updateNAQ();
    });
}
);
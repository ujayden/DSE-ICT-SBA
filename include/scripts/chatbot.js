'use strict';

let windowURL;
let xhr;
try{
    windowURL = new URL(window.location.origin);
}catch(e){
    console.warn(e);
    windowURL.origin = "https://ictmasterhub.com";
}

try{
    xhr = new XMLHttpRequest();
}catch(e){
    console.warn(e);
    console.warn("The browser does not support XMLHttpRequest, is it IE?");
    if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }else{
        console.error("The browser does not support both XMLHttpRequest and ActiveXObject??");
        xhr = false;
    }
}
let chatInput = document.getElementById("chatbot-input");

let chatContainer = document.getElementById('chatbot-real-chat');
let chatCounter = 0;
function updateChat(chatmessage, chatfrom) {
    let chatmessageElem = document.createElement("div");
    chatmessageElem.id = "chatbot-chat-message";
    /* Alert! The chatfrom only accept 'client' or 'server' */
    switch (chatfrom) {
        case "client":
            chatmessageElem.className = "chatbot-chat-message-client-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            /* Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/after */
            chatContainer.insertAdjacentElement("beforeend", chatmessageElem);
            break;
        case "server":
            chatmessageElem.className = "chatbot-chat-message-server-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            chatContainer.insertAdjacentElement("beforeend", chatmessageElem);
            /* Reference: You should see it on the upper part */
            break;
        default:
            throw new Error(
                'The "chatfrom" can only accept "client" or "server", check the parameter?'
            );
    }
}

/* The feature is abandoned, because there is not enough time to implement it.
function updateClientSuggestAction(action, n, command) {

}
*/

function callServer(msg){
    //Send a POST to the server backend on /api/chatbot
    //Reference: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send, book: <<Java script第一次學就上手>>, https://stackoverflow.com/a/50066247
    xhr.open("POST", windowURL.origin + "/api/chatbot", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ message: msg }));
    xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        let chatmessage = response.message;
        let chatfrom = "server";
        updateChat(chatmessage, chatfrom);
        //Check if the response has suggested actions - This feature is abandoned.
    } else if (xhr.readyState == 4 && xhr.status != 200) {
        console.error("Error: " + xhr.status + " " + xhr.statusText);
        updateChat("Something went wrong, please try again?", "server");
        }
    }
}
function sendMessage(msg) {
    //The server will return a message and may include a list of suggested actions.
    //Check message is not empty
    if (msg == "" || msg == null || msg == undefined) {
        //Do nothing
        return;
    }
    //Update the chat UI
    updateChat(msg, "client");
    //Send the message to the server
    callServer(msg);
}
function clickSendButton() {
    let msg = chatInput.value;
    chatInput.value = "";
    sendMessage(msg);
}

function pressKeyBoard(event) {
    if (event.keyCode === 13) { // Enter key
        clickSendButton();
    }
}
//chatInput.addEventListener("keydown", clickSendButton);
let chatSendButton = document.getElementById("chatbot-send-btn");
console.log(chatSendButton);
chatSendButton.addEventListener("click", clickSendButton);
chatInput.addEventListener("keydown", pressKeyBoard);
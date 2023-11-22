'use strict';
let windowURL;
let xhr;
windowURL = new URL(window.location.origin);
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
        window.alert("Something went wrong, but the chatbot will not work, please use another browsers.");
    }
}

let chatInput = document.getElementById("chatbot-input");
let chatRealContainer = document.getElementById('chatbot-real-chat');
let chatContainer = document.getElementById('chatbot-chat-container');
function updateChat(chatmessage, chatfrom) {
    let chatmessageElem = document.createElement("div");
    chatmessageElem.id = "chatbot-chat-message";
    /* Alert! The chatfrom only accept 'client' or 'server' */
    switch (chatfrom) {
        case "client":
            chatmessageElem.className = "chatbot-chat-message-client-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            /* Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/after */
            chatRealContainer.insertAdjacentElement("beforeend", chatmessageElem);
            break;
        case "server":

            chatmessageElem.className = "chatbot-chat-message-server-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            chatRealContainer.insertAdjacentElement("beforeend", chatmessageElem);
            /* Reference: You should see it on the upper part */
            break;
        default:
            throw new Error(
                'The "chatfrom" can only accept "client" or "server", check the parameter?'
            );
    }
    //Scroll to the bottom
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth"
    });}

/* The feature is abandoned, because there is not enough time to write it.
function updateClientSuggestAction(action, n, command) {

}
*/

let suggestedActions_container = document.getElementById("chatbot-chat-suggest");
function callServer(msg){
    waitMessage.style.display = "block";

    $.ajax({
      type: "POST",
      url: windowURL.origin + "/api/chatbot.php",
      //url: windowURL.origin + "/debug/chatbot_res.json",
      data: JSON.stringify({ chatMsg: msg }),
      contentType: "application/json",
      success: function(response) {
        let chatmessage = response.chatMsg;
        let chatfrom = "server";
        updateChat(chatmessage, chatfrom);
      
        // Check if the response has suggested actions - This feature is abandoned.
        let suggestedActions = false;
        if (suggestedActions) {
          // Handle suggested actions
        } else {
          suggestedActions_container.style.display = "none";
        }
      },
      error: function(xhr, status, error) {
        console.error("Error: " + xhr.status + " " + xhr.statusText);
        updateChat("Something went wrong, please try again?", "server");
        suggestedActions_container.style.display = "none";
      },
      complete: function() {
        waitMessage.style.display = "none";
      }
    });
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
let waitMessage = document.getElementById("chatbot-chat-wait");
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

let chatSendButton = document.getElementById("chatbot-send-btn");
console.log(chatSendButton);
chatSendButton.addEventListener("click", clickSendButton);
chatInput.addEventListener("keydown", pressKeyBoard);

let chatbotCloseButton = document.getElementById("chatbot-close-btn");
function closeChatbot() {
    window.close();
    setTimeout(() => {
        window.alert("The chatbot will not close itself if you open it in a new tab with its link, please close it manually.");
    }
    , 1000);
}
chatbotCloseButton.addEventListener("click", closeChatbot);
//Check iFrame
let inIframe;
try{
    inIframe = window.self !== window.top;
}catch{
    inIframe = true;
}finally{
    if (inIframe) {
        chatbotCloseButton.style.display = "none";
        document.querySelector('header').style.display = "none";
        document.getElementById('chatbot-chat-container').style.height = "calc(100vh - 54px)";
    }
}
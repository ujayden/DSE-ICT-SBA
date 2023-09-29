'use strict';
let chatContainer = document.getElementById('chatbot-real-chat');
function updateChat(chatmessage, chatfrom) {
    let chatmessageElem = document.createElement("div");
    chatmessageElem.id = "chatbot-chat-message";
    /* Alert! The chatfrom only accept 'client' or 'server' */
    switch (chatfrom) {
        case "client":
            chatmessageElem.className = "chatbot-chat-message-client-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            /* Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/after */
            chatContainer.after(chatmessageElem);
            break;
        case "server":
            chatmessageElem.className = "chatbot-chat-message-server-comm chatbot-chat-message";
            chatmessageElem.innerHTML = "<p class='chatbot-chat-message-text'>" + chatmessage +"</p>";
            chatContainer.after(chatmessageElem);
            /* Reference: You should see it on the upper part */
            break;
        default:
            throw new Error(
                'The "chatfrom" can only accept "client" or "server", check the parameter?'
            );
    }
}
updateChat('w', 'server');
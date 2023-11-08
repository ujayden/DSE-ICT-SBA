'use strict';
let focusOnHeaderDropDownMenuElem = document.getElementById('unfocus');
let promptTitleElem = document.getElementById('prompt-Title');
let promptContentElem = document.getElementById('prompt-Body');
let promptCloseButtonElem = document.getElementById('prompt-Close');
let promptConfirmButtonElem = document.getElementById('prompt-Confirm');
let promptCancelButtonElem = document.getElementById('prompt-Cancel');

function toggleGrayOut(grayStatus){
    if (grayStatus == true) {
        focusOnHeaderDropDownMenuElem.style.visibility = 'visible';
    }else{
        focusOnHeaderDropDownMenuElem.style.visibility = 'hidden';
    }
}
let promptContainer = document.getElementById('prompt');
function closePrompt(){
    toggleGrayOut(false);
    promptContainer.style.display = 'none';

}
function openPrompt(){
    toggleGrayOut(true);
    promptContainer.style.display = 'flex';
    //Focus on the prompt
    promptContainer.focus();
}
function toggleButton (buttonElem, allowButton, buttonFunc, buttonValue) {
    if (allowButton == true) {
        console.log(buttonElem);
        console.log(buttonFunc);
        console.log(allowButton);
        buttonElem.style.display = 'block';
        if (buttonFunc == null || buttonFunc == undefined) {
            buttonFunc = closePrompt();
        }
        //Remove all existing event listeners
        $(buttonElem).off('click');
        //Add the new event listener with jQuery
        $(buttonElem).on('click', buttonFunc)
        if (buttonValue != null || buttonValue != undefined || buttonValue != '') {
            buttonElem.innerHTML = buttonValue;
        }else {
            buttonElem.innerHTML = 'OK';
        }
    } else {
        buttonElem.style.display = 'none';
    }
}

promptCloseButtonElem.addEventListener('click', closePrompt);
promptCancelButtonElem.addEventListener('click', closePrompt);
function setupPrompt (pTitle, pContent, allowClose, closeFunc, allowCancel, cancelFunc, cancelBTNValue, allowConfirm, confirmFunc, confirmBTNValue){
    promptTitleElem.innerHTML = pTitle;
    promptContentElem.innerHTML = pContent;
    toggleButton(promptCloseButtonElem, allowClose, closeFunc, "&times;");
    toggleButton(promptCancelButtonElem, allowCancel, cancelFunc, cancelBTNValue);
    toggleButton(promptConfirmButtonElem, allowConfirm, confirmFunc, confirmBTNValue);
    openPrompt();
}

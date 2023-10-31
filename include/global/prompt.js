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
        console.log('hidden');
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
}
function toggleButton (buttonElem, allowButton, buttonFunc, buttonValue) {
    if (allowButton == true) {
        buttonElem.style.visibility = 'visible';
        buttonElem.addEventListener('click', buttonFunc);
        if (buttonValue != null || buttonValue != undefined || buttonValue != '') {
            buttonElem.innerHTML = buttonValue;
        }else {
            buttonElem.innerHTML = 'OK';
        }
    } else {
        buttonElem.style.visibility = 'hidden';
    }
}
function setupPrompt (pTitle, pContent, allowClose, closeFunc, allowCancel, cancelFunc, cancelBTNValue, allowConfirm, confirmFunc, confirmBTNValue){
    promptTitleElem.innerHTML = pTitle;
    promptContentElem.innerHTML = pContent;
    toggleButton(promptCloseButtonElem, allowClose, closeFunc, null);
    toggleButton(promptCancelButtonElem, allowCancel, cancelFunc, cancelBTNValue);
    toggleButton(promptConfirmButtonElem, allowConfirm, confirmFunc, confirmBTNValue);

    openPrompt();
}

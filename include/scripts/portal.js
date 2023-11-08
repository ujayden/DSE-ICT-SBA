'use strict';

let loginBtn = document.getElementById('login');
let loginForm = document.getElementById('login-form');
let loginForm_username = loginForm.querySelector('#username');
let loginForm_password = loginForm.querySelector('#password');
let loginForm_rememberMe = loginForm.querySelector('#rememberMe');
let loginForm_passwordToggle = loginForm.querySelector('#password-toggle');

loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
});
// For rememberMe checkbox, add an event listener to save the state of the checkbox
//
function storeRememberMeState() {
    localStorage.setItem('rememberMe', loginForm_rememberMe.checked);
}
loginForm_rememberMe.addEventListener('change', function (e) {
    storeRememberMeState();
});
function success(inMode){
    if(inMode === 'login'){
        window.location.href = '/learning/dashboard.html';
    }
}
function warningPrompt(promptHeader, message){

}
function switchForm(inMode) {

}
function submitLoginInfo() {
    let username = loginForm_username.value;
    let password = loginForm_password.value;
    let loginInfo = {
        mode: 'login',
        username: username,
        password: password,
        recaptchaToken: null
    };
    $.ajax({
        url: '/api/user.php',
        method: 'POST',
        data: loginInfo,
        success: function (data) {
            let response = JSON.parse(data);
            if (response.success === true) {
                success(loginInfo.mode);
            } else if (response.mfa_enabled === true) {
                switchForm('mfa');
            }
        },
        error: function (data) {
            let response = JSON.parse(data);
            console.error("Error logging in: " + response.error + " (" + errorMsg + ")");
            warningPrompt("Sorry, there was an error logging in.", "Please try again later." + errorMsg + ".");
        }
    });
}

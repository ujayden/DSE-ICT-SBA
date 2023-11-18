'use strict';

let loginBtn = document.getElementById('login');
let loginForm = document.getElementById('portalForm');
let loginForm_username = loginForm.querySelector('#username');
let loginForm_password = loginForm.querySelector('#password');
let loginForm_rememberMe = loginForm.querySelector('#rememberMe');
let loginForm_passwordToggle = loginForm.querySelector('#password-toggle');
let loginForm_formPoster = loginForm.querySelector('#form-poster');
let regForm = document.getElementById('regForm');
let regForm_username = regForm.querySelector('#regFormUsername');
let regForm_password = regForm.querySelector('#regFormPassword');
let regForm_passwordVerify = regForm.querySelector('#regFormPasswordVaildation');
let regFormTOTPVerify = regForm.querySelector('#regForm-MFA-Code');
let regFormQRCode = document.getElementById('regForm-MFA-Image');
let formContainer = document.getElementById('form-container'); 
let formPosterLogin = document.getElementById('form-poster-detail');
let regFormMFA = document.getElementById('regForm-MFA');
let toggleShowPassword = document.getElementById('show_password');
let toggleShowPasswordReg = document.getElementById('show_passwordRegForm');
let forgetPasswordBtn = document.getElementById('forgetPasswordFormBtn');
let formBreadcrumb = document.getElementById('portal-Breadcrumb');
let resetPasswordForm = document.getElementById('resetPassword');
let resetPasswordForm_username = resetPasswordForm.querySelector('#resetPasswordUsername');
let resetPasswordForm_password = resetPasswordForm.querySelector('#resetPasswordPassword');

loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
});
forgetPasswordBtn.addEventListener('click', function (e) {
    e.preventDefault();
    displayForgotPasswordForm();
});
//Make a accessibility toast first to ask if the user wants to remove fancy effects
const accessibilityToast = document.getElementById('portal-Accessibility-Toast');
//Display after 1 second of DOM loaded.
document.addEventListener('DOMContentLoaded', function () {
    let accessibilityToastBootstrap = bootstrap.Toast.getOrCreateInstance(accessibilityToast);
    setTimeout(function () {
        //Check if the accessibilityToast has been shown today
        let accessibilityToastShownToday = sessionStorage.getItem('accessibilityToastShownToday');
        if (accessibilityToastShownToday === null || accessibilityToastShownToday === false) {
            accessibilityToastBootstrap.show();
            sessionStorage.setItem('accessibilityToastShownToday', true);
        }
    }, 1000);
    }
);
// For rememberMe checkbox, add an event listener to save the state of the checkbox

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
    switch (inMode) {
        case 'login':
            break;
        case 'mfa':
            break;
    }
}
function displayRegisterForm() {
    //Set display to none for all forms
    //Container: login-form
    document.querySelectorAll('#login-form > *').forEach(function (e) {
        //Not id #portal-Breadcrumb
        if (e.id !== 'portal-Breadcrumb') {
            e.style.display = 'none';
        }
    }
    );
    formContainer.style.height = 'auto';
    regForm.style.display = 'block';
    formPosterLogin.style.display = 'none';
    regFormMFA.style.display = 'block';
    //Update breadcrumb
    formBreadcrumb.innerHTML = '<a href="/">ICT Master Hub</a> > Register';
}
function displayLoginForm() {
    //Set display to none for all forms
    //Container: login-form
    document.querySelectorAll('#login-form > *').forEach(function (e) {
        //Not id #portal-Breadcrumb
        if (e.id !== 'portal-Breadcrumb') {
            e.style.display = 'none';
        }
    }
    );
    formContainer.style.height = 'auto';
    loginForm.style.display = 'block';
    formPosterLogin.style.display = 'block';
    regFormMFA.style.display = 'none';
    //Update breadcrumb
    formBreadcrumb.innerHTML = '<a href="/">ICT Master Hub</a> > Login';
}
function displayForgotPasswordForm() {
    //Set display to none for all forms
    //Container: login-form
    document.querySelectorAll('#login-form > *').forEach(function (e) {
        //Not id #portal-Breadcrumb
        if (e.id !== 'portal-Breadcrumb') {
            e.style.display = 'none';
        }
    }
    );
    formContainer.style.height = 'auto';
    resetPasswordForm.style.display = 'block';
    formPosterLogin.style.display = 'block';
    regFormMFA.style.display = 'none';
    //Update breadcrumb
    formBreadcrumb.innerHTML = '<a href="/">ICT Master Hub</a> > Forgot Password';
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


//Check the mode of the form
let currentURL = new URL(window.location.href);
let mode = currentURL.searchParams.get('mode');
if (mode === null) {
    mode = 'login';
}else if(mode === 'register'){
    displayRegisterForm();
}else if(mode === 'forgotPassword'){
    displayForgotPasswordForm();
}


//Show password toggle
toggleShowPassword.addEventListener('click', function (e) {
    if (loginForm_password.type === 'password') {
        loginForm_password.type = 'text';
    } else {
        loginForm_password.type = 'password';
    }
});
toggleShowPasswordReg.addEventListener('click', function (e) {
    if (regForm_password.type === 'password') {
        regForm_password.type = 'text';
    } else {
        regForm_password.type = 'password';
    }
});

//TOTP time :/
//For every update of regForm_username, generate a totp qr code with new secret.

let totpAttributes = {
    secret: '',
    issuer: '',
    label: '',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 0
};
function generateTOTPsecret(){

}
regForm_username.addEventListener('change', function(e){
    regFormUserNameChange(e.target.value);
});
function regFormUserNameChange(username){
    totpAttributes.issuer = "ICT Master Hub" + currentURL.hostname;
    totpAttributes.secret = otplib.authenticator.generateSecret();
    totpAttributes.label = username;
    generateTOTPImg();
}   
function generateTOTPImg(){
    //Return dataURL for the QR code to set the src of the img
    //First, generate the otpauth:// url
    let otpauthURL = otplib.authenticator.keyuri(totpAttributes.label, totpAttributes.issuer, totpAttributes.secret);
    console.log(otpauthURL);
    //Generate QR code with jquery-qrcode
    //Create a virtual element to store the QR code
    let virtualElement = document.createElement('div');
    $(virtualElement).qrcode(otpauthURL);
    //Convert the virtual element to a dataURL
    let dataURL = $(virtualElement).find('canvas')[0].toDataURL();
    //Set the src of the QR code img
    regFormQRCode.src = dataURL;
}
regFormUserNameChange()
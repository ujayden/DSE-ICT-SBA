'use strict';

let loginBtn = document.getElementById('login');
let loginForm = document.getElementById('portalForm');
let loginForm_userID = loginForm.querySelector('#userID');
let loginForm_password = loginForm.querySelector('#password');
let loginForm_rememberMe = loginForm.querySelector('#rememberMe');
let loginForm_passwordToggle = loginForm.querySelector('#password-toggle');
let loginForm_formPoster = loginForm.querySelector('#form-poster');
let regForm = document.getElementById('regForm');
let regFormBtn = document.getElementById('register');
let regForm_userID = regForm.querySelector('#regFormUserID');
let regForm_password = regForm.querySelector('#regFormPassword');
let regForm_passwordVerify = regForm.querySelector('#regFormPasswordVaildation');
let regFormTOTPVerify = document.getElementById('regForm-MFA-Code');
let regFormQRCode = document.getElementById('regForm-MFA-Image');
let regFormTOTPToggle = document.getElementById('regForm-MFA-Checkbox');
let formContainer = document.getElementById('form-container'); 
let formPosterLogin = document.getElementById('form-poster-detail');
let regFormMFA = document.getElementById('regForm-MFA');
let toggleShowPassword = document.getElementById('show_password');
let toggleShowPasswordReg = document.getElementById('show_passwordRegForm');
let forgetPasswordBtn = document.getElementById('forgetPasswordFormBtn');
let formBreadcrumb = document.getElementById('portal-Breadcrumb');
let resetPasswordForm = document.getElementById('resetPassword');
let resetPasswordForm_userID = resetPasswordForm.querySelector('#resetPasswordFormUserID');
let resetPasswordForm_password = resetPasswordForm.querySelector('#resetPasswordFormPassword');
let resetPasswordForm_passwordVerify = resetPasswordForm.querySelector('#resetPasswordFormVaildation');
let resetPasswordForm_passwordToggle = resetPasswordForm.querySelector('#show_passwordresetPasswordForm');
let totpPassedVerification = false;
let regFormMFAVerifyBtn = document.getElementById('regForm-MFA-Verify');

loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    submitLoginInfo();
});
forgetPasswordBtn.addEventListener('click', function (e) {
    e.preventDefault();
    displayForgotPasswordForm();
});
regFormBtn.addEventListener('click', function (e) {
    e.preventDefault();
    submitRegisterInfo();
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
    }else{
        warningPrompt("Success!", "Now you can login with your new account.");
        setTimeout(function(){
            displayLoginForm();
        }, 3000);
    }
}


let warningPromptContainer = document.getElementById('loginFormWarningContainer');
let warningPromptText = document.getElementById('loginFormWarning');
let warningPromptContainerHiddenTimeout;

/**
 * @param {string} promptHeader //Title of the prompt, not required, but null or undefined will required to be passed in
 * @param {string} message //Message of the prompt, do not ask user to enter anything!
 * @returns {boolean} //Useless
 */
function warningPrompt(promptHeader, message){
    //Force revert to original state
    clearTimeout(warningPromptContainerHiddenTimeout);    
    //Set the prompt message
    let promptMessage;
    if (promptHeader === null || promptHeader === undefined) {
        promptMessage = message;
    }else{
        promptMessage = "<strong>" + promptHeader + "</strong>  " + message;
    }
    warningPromptText.innerHTML = promptMessage;
    //Show the warning prompt with animation
    //First, set visibility to visible
    warningPromptContainer.style.visibility = 'visible';
    //Trigger reflow/repaint
    void warningPromptContainer.offsetTop;
    //Add the animation class
    warningPromptContainer.classList.add('loginFormWarningContainer-animation');
    //Wait for the animation to end, then remove the animation class
    setTimeout(function(){
        warningPromptContainer.classList.remove('loginFormWarningContainer-animation');
    }, 500);
    //Set the visibility to hidden after 3 seconds
    warningPromptContainerHiddenTimeout = setTimeout(function(){
        warningPromptContainer.style.visibility = 'hidden';
    }, 3000);
}
//Check the mode of the form
let currentURL = new URL(window.location.href);
function switchForm(inMode) {
    switch (inMode) {
        case 'login':
            displayLoginForm();
            break;
        case 'mfa':
            displayMFAPrompt();
            break;
        case 'register':
            displayRegisterForm();
            break;
        case 'forgotPassword':
            displayForgotPasswordForm();
            break;
        default:
            mode = 'login';
            displayLoginForm();
    }
}
let mode = currentURL.searchParams.get('mode');
switchForm(mode);

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
    replayLoadAnimation()
    //Change history bar
    window.history.replaceState(null, null, '?mode=register');
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
    replayLoadAnimation()
    //Change history bar
    window.history.replaceState(null, null, '?mode=login');
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
    replayLoadAnimation()
    //Change history bar
    window.history.replaceState(null, null, '?mode=forgotPassword');
}

let loginMFACodeValue = document.getElementById('loginMFACode').value;

function submitLoginInfo() {
    let userID = loginForm_userID.value;
    let password = loginForm_password.value;
    let recaptchaToken = null;
    //Check if any of the fields are empty
    if (userID === '' || password === '') {
        warningPrompt("There are empty fields", "Please fill out all fields.");
        return false;
    }
    let loginInfo = {
        mode: 'login',
        userID: userID,
        password: password,
        recaptchaToken: recaptchaToken,
        mfaCode: null
    };
    //If mfaCode is not null, set the mfaCode
    if (loginMFACodeValue !== '') {
        loginInfo.mfaCode = loginMFACodeValue;
    }
    
    loginInfo = JSON.stringify(loginInfo);
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
            warningPrompt("Sorry, there was an error logging in.", "Please try again later.");
            console.error("Error logging in");

        }
    });
}
let regFormEmail = document.getElementById('email');
function submitRegisterInfo() {
    let userID = regForm_userID.value;
    let password = regForm_password.value;
    let passwordVerify = regForm_passwordVerify.value;
    let email = regFormEmail.value;
    let recaptchaToken = null;
    if (password !== passwordVerify) {
        warningPrompt("Passwords do not match", "Please check your passwords and try again.");
        return false;
    }
    //Check if any of the fields are empty
    if (userID === '' || password === '' || passwordVerify === '') {
        warningPrompt("There are empty fields", "Please fill out all fields.");
        return false;
    }
    let regInfo = {
        mode: 'register',
        userID: userID,
        password: password,
        email: email,
        useTOTP: false,
        totpSecret: null,
        recaptchaToken: recaptchaToken
    };
    //Check if the user has enabled TOTP
    if (regFormTOTPToggle.checked === true) {
        regInfo.useTOTP = true;
        //Check if the user has entered the TOTP code
        if (regFormTOTPVerify.value !== '') {
            //Check if the TOTP code passed the verification
            if (totpPassedVerification){
                //Continue
            }else{
                warningPrompt("The TOTP code is incorrect", "Please click the verify button to verify the TOTP code.");
                return false;
            }
        } else {
            warningPrompt("Please enter the TOTP code to verify", "Please try again.");
            return false;
        }
    }
    regInfo = JSON.stringify(regInfo);
    $.ajax({
        url: '/api/user.php',
        method: 'POST',
        data: regInfo,
        success: function (data) {
            let response = JSON.parse(data);
            if (response.success === true) {
                success(regInfo.mode);
            } else if (response.mfa_enabled === true) {
                switchForm('mfa');
            }
        },
        error: function (data) {
            warningPrompt("Sorry, there was an error while registering.", "Please try again later.");
            console.error("Error while registering.");

        }
    });
}
regFormTOTPToggle.addEventListener('change', function (e) {
    if (e.target.checked === true) {
        //Ungrey the QR code
    } else {
        //Grey out the QR code
    }
});
let resetPasswordFormEmailVerificationCode = document.getElementById('resetPasswordFormEmailCode');
let resetPasswordFormTOTPVerificationCode = document.getElementById('resetPasswordFormTOTP');
let resetPasswordFormSecurityQuestionVerificationCode = document.getElementById('resetPasswordFormSecurityQuestion');
function submitForgotPasswordInfo() {
    debugger
    let userID = resetPasswordForm_userID.value;
    let password = resetPasswordForm_password.value;
    let recaptchaToken = null;
    let verifyCode = null;
    //Get the verify code based on the mode
    let currentSelectElementID = new bootstrap.Tab(document.querySelector('.nav-link.active'));
    currentSelectElementID =  currentSelectElementID._config.target;
    switch (currentSelectElementID) {
        case '#resetPasswordModeEmail':
            verifyCode = resetPasswordFormEmailVerificationCode.value;
            break;
        case '#resetPasswordModeTOTP':
            verifyCode = resetPasswordFormTOTPVerificationCode.value;
            break;
        case '#resetPasswordModeSecurityQuestion':
            verifyCode = resetPasswordFormSecurityQuestionVerificationCode.value;
            break;
        default:
            throw new Error('Unknown verifyMode');
    }
    //Check if the user has entered all the fields
    if (userID === '' || password === '' || verifyCode === '' || resetPasswordForm_passwordVerify.value === '') {
        warningPrompt("There are empty fields", "Please fill out all fields.");
        return false;
    }
    //Check if the passwords match
    console.log(resetPasswordForm_password.value);
    if (password !== resetPasswordForm_passwordVerify.value) {
        warningPrompt("Passwords do not match", "Please check your passwords and try again.");
        return false;
    }
    let forgotPasswordInfo = {
        mode: 'forgotPassword',
        userID: userID,
        password: password,
        recaptchaToken: recaptchaToken,
        verifyMode: 'email',
        verifyCode: null
    };
    //Check verifyMode
    console.log(currentSelectElementID);
    if (currentSelectElementID === '#resetPasswordModeEmail') {
        forgotPasswordInfo.verifyMode = 'email';
    } else if (currentSelectElementID === '#resetPasswordModeTOTP') {
        forgotPasswordInfo.verifyMode = 'totp';
    } else if (currentSelectElementID === '#resetPasswordModeSecurityQuestion') {
        forgotPasswordInfo.verifyMode = 'securityQuestion';
    } else {
        throw new Error('Unknown verifyMode');
    }
    forgotPasswordInfo.verifyCode = verifyCode;
    forgotPasswordInfo = JSON.stringify(forgotPasswordInfo);
    $.ajax({
        url: '/api/user.php',
        method: 'POST',
        data: forgotPasswordInfo,
        success: function (data) {
            let response = JSON.parse(data);
            success(forgotPasswordInfo.mode);
        },
        error: function (data) {
            warningPrompt("Sorry, there was an error while resetting your password.", "Please try again later.");
            console.error("Error resetting password.");
        }
    });
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
resetPasswordForm_passwordToggle.addEventListener('click', function (e) {
    if (resetPasswordForm_password.type === 'password') {
        resetPasswordForm_password.type = 'text';
    } else {
        resetPasswordForm_password.type = 'password';
    }
});

//Check email validity
/**
 * 
 * @param {string} email //Email to be validated
 * @returns {boolean} //True if valid, false if not valid
 */
function validateEmail(email){
    console.log(email);
        let regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\])');
        let result = regex.test(email);
        console.log(result);
        return result;
    }

//Reset password form with email
let resetPasswordFormEmailVerificationCodeBtn = document.getElementById('sendVerificationCode');
let resetPasswordFormEmail = document.getElementById('resetPasswordFormEmail');
function sendEmailVerificationCode(){
    let email = resetPasswordFormEmail.value;
    let userID = resetPasswordForm_userID.value;
    if(!validateEmail(email)){
        warningPrompt("Please enter a valid email address", "Check your email address and try again.");
        return false;
    }
    let resetPasswordInfo = {
        mode: 'forgotPasswordSendEmailGetCode',
        userID: userID,
        email: email,
        recaptchaToken: null
    };
    resetPasswordInfo = JSON.stringify(resetPasswordInfo);
    $.ajax({
        url: '/api/user.php',
        method: 'POST',
        data: resetPasswordInfo,
        success: function (data) {
            let response = JSON.parse(data);
            if (response.success === true) {
                //Prompt success, and ask user to check email
                warningPrompt("Email sent", "Please check your email for the verification code.");
            }else {
                warningPrompt("An error occured", "Please try again later.");
            }
        },
        error: function (data) {
            warningPrompt("Sorry, there was an error while resetting your password.", "Please try again later.");
            console.error("Error while resetting password.");
        }
    });
}
resetPasswordFormEmailVerificationCodeBtn.addEventListener('click', function(e){
    e.preventDefault();
    sendEmailVerificationCode();
});

function replayLoadAnimation(){
    //.form-containerAmination{animation: floatDown 0.5s ease;}
    formContainer.classList.remove('form-containerAmination');
    // Trigger reflow/repaint
    void formContainer.offsetTop;
    formContainer.classList.add('form-containerAmination');
}

//Prevent link redirection
let loginNowLink = document.getElementById('loginNowLink');
loginNowLink.addEventListener('click', function(e){
    e.preventDefault();
    displayLoginForm();
});
let registerNowLink = document.getElementById('registerNowLink');
registerNowLink.addEventListener('click', function(e){
    e.preventDefault();
    displayRegisterForm();
});
let loginNowInForgotPasswordLink = document.getElementById('loginNowForgetPasswordLink');
loginNowInForgotPasswordLink.addEventListener('click', function(e){
    e.preventDefault();
    displayLoginForm();
});


//TOTP time :/
//For every update of regForm_userID, generate a totp qr code with new secret.

let totpAttributes = {
    secret: '',
    issuer: '',
    label: '',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 0
};
regForm_userID.addEventListener('change', function(e){
    regFormUserIDChange(e.target.value);
});
function regFormUserIDChange(userID){
    totpAttributes.issuer = "ICT Master Hub" + currentURL.hostname;
    totpAttributes.secret = otplib.authenticator.generateSecret();
    totpAttributes.label = userID;
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
    //Reset the totpPassedVerification
    totpPassedVerification = false;
    //Reenable to input
    regFormTOTPVerify.disabled = false;
    regFormMFAVerifyBtn.disabled = false;
}
regFormUserIDChange()

//User click verify button
regFormMFAVerifyBtn.addEventListener('click', function(e){
    e.preventDefault();
    debugger
    verifyTOTPCode();
});
function verifyTOTPCode(){
    //Check if the user has entered the TOTP code to verify
    //Check if the user has enabled TOTP
    if (regFormTOTPToggle.checked === true) {
        //Check if the user has entered the TOTP code
        if (regFormTOTPVerify.value !== '') {
            //Check if the TOTP code passed the verification
            if (otplib.authenticator.check(regFormTOTPVerify.value, totpAttributes.secret)){
                //Continue
                totpPassedVerification = true;
                warningPrompt("Success!", "The TOTP code is correct.");
                //Disable the input
                regFormTOTPVerify.disabled = true;
                regFormMFAVerifyBtn.disabled = true;
            }else{
                warningPrompt("The TOTP code is incorrect", "Please try again.");
                return false;
            }
        } else {
            warningPrompt("Please enter the TOTP code to verify", "Please try again.");
            return false;
        }
    }
}
let resetPasswordTryResetBtn = document.getElementById('tryReset');
resetPasswordTryResetBtn.addEventListener('click', function(e){
    e.preventDefault();
    submitForgotPasswordInfo();
});

let loginFormMFACodeContainer = new bootstrap.Modal(document.getElementById('loginFormMFAPrompt'));
function showMfaCodePrompt() {
    loginFormMFACodeContainer.show();
}
let submitLoginWithMFACodeBtn = document.getElementById('submitMfaCodeBtn');
submitLoginWithMFACodeBtn.addEventListener('click', function(e){
    e.preventDefault();
    submitLoginInfo();
});
function closeMfaCodePrompt(){
    loginFormMFACodeContainer.hide();
}
let closeMfaCodeContainer = document.getElementById('closeMfaCodeContainer');
let closeMfaCodeContainer2 = document.getElementById('closeMfaCodeContainer2');
closeMfaCodeContainer.addEventListener('click', function(e){
    e.preventDefault();
    closeMfaCodePrompt();
});
closeMfaCodeContainer2.addEventListener('click', function(e){
    e.preventDefault();
    closeMfaCodePrompt();
});
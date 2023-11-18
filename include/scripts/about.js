'use strict';
let openFAQbtn = document.getElementById('openFAQ');
let openChatbotbtn = document.getElementById('openChatbot');

let currentURL = new URL(window.location.href).origin;
openChatbotbtn.addEventListener('click', () => {
    window.open(currentURL + '/chatbot.html', '_blank');
    }
);
openFAQbtn.addEventListener('click', () => {
    window.open(currentURL + '/faq.html', '_blank');
    }
);
let contactForm = document.getElementById('contactFormContainer');
let contactFormSubmit = document.getElementById('contactFormSubmit');
contactFormSubmit.addEventListener('click', (event) => {
    event.preventDefault();
    submitContactForm();
});
let contactFormOnCooldown = false;
let contactFormWarning = document.getElementById('contactFormWarning');
let contactFormContainer = document.getElementById('contactFormWarningContainer');
function submitContactForm(){
    //Get the values from the form
    let name = document.getElementById('contactFormName').value;
    let email = document.getElementById('contactFormEmail').value;
    let subject = document.getElementById('contactFormSubject').value;
    let message = document.getElementById('contactFormMessage').value;
    //Check if the values are empty
    if(name == "" || email == "" || subject == "" || message == ""){
        warnUser("Please fill out all fields!");
        return false;
    }
    //Check if the email is valid
    if(!validateEmail(email)){
        warnUser("Please enter a valid email address!");
        return false;
    }
    //Check if in cooldown
    if (contactFormOnCooldown) {
        warnUser("Please wait before sending another message!");
        return false;
    }
    $.ajax({
        url: '/api/userfeedback.php',
        type: 'POST',
        data: {
            mode: 'submitContactForm',
            name: name,
            email: email,
            subject: subject,
            message: message
        },
        success: function(response) {
            setTimeout(() => {
                contactFormOnCooldown = false;
            }
            , 5000);
            contactFormOnCooldown = true;
            warnUser("Message sent!");
        },
        error: function(error) {
            console.error('Error:', error);
            warnUser("An error occured, please try again later.");
        }
    });
}
function validateEmail(email){
    console.log(email);
        let regex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\])');
        let result = regex.test(email);
        console.log(result);
        return result;
    }
function warnUser(text){
    contactFormWarning.innerHTML = text;
    //Add style contactFormWarningDisplay
    contactFormContainer.style.visibility = 'visible';
    contactFormContainer.classList.add('contactFormWarningDisplay');
    setTimeout(() => {
        contactFormContainer.classList.remove('contactFormWarningDisplay');
        contactFormContainer.style.visibility = 'hidden';
    }
    , 3000);
}
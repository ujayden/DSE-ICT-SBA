'use strict';
//Fetch the user data from the server, must provide the user id and sessionToken

let scriptHandleUserData = true;

let successRunFlag = false;
let userInfo = undefined;
let userAchievements = undefined;
//Check if currentURL is inatialized by other scripts
if (typeof currentURL === 'undefined') {
    let currentURL = new URL(window.location.href);
    globalThis.currentURL = currentURL; //I don't know why, but this is the only way to make it work, but why dont just use var?
}

/**
 * 
 * @param {string} userId //The user id, which usually is the user Name without spaces
 * @param {string} sessionToken //The session token, which is a string that is generated when the user logs in
 * @returns {object} //Returns the user data as an object
 * @example getUserData("ChrisWong", "sessionToken") //Returns the user data of the user with the id "ChrisWong
 */
function getUserData(userId, sessionToken) {
    return new Promise((resolve, reject) => {
        let urlParams = "?userID=" + userId + "&sessionToken=" + sessionToken;
        $.ajax({
            type: 'GET',
            url: currentURL.origin + "/api/getuserinfo.php" + urlParams,
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function (data) {
                let response = data;
                console.log(response);
                //Update sessionToken first
                localStorage.setItem('sessionToken', response.sessionToken);
                localStorage.setItem('sessionTokenExpDate', response.sessionTokenExpDate);

                let userInfo = {
                    lastFetchTime: response.fetchTime,
                    expireTime: new Date(new Date(response.fetchTime).getTime() + 24 * 60 * 60 * 1000),
                    sessionToken: response.sessionToken,
                    sessionTokenExpDate: response.sessionTokenExpDate,
                    userId: response.userID,
                    userName: response.userName,
                    userEmail: response.userEmail,
                    level: response.level,
                    detailedLevelPercentage: response.detailedLevelPercentage,
                    nextTask: response.nextTask
                };

                let userAchievements = response.achievements;

                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                localStorage.setItem('userAchievements', JSON.stringify(userAchievements));

                resolve(userInfo);
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
                reject(error);
            }
        });
    });
}

async function checkUserData() {
    if (window.location.href.includes("portal.html")){
        return true;
    }
    let userID
    let sessionToken
    let sessionTokenExpDate
    try{
        userID = JSON.parse(localStorage.getItem('userInfo')).userId;
        sessionToken = JSON.parse(localStorage.getItem('userInfo')).sessionToken;
        sessionTokenExpDate = JSON.parse(localStorage.getItem('userInfo')).sessionTokenExpDate;

    }catch(error){
        console.error(error);
    }

    if (userID == null || sessionToken == null || new Date(sessionTokenExpDate) < new Date()) {
        console.error("Please log in first!");
        window.alert("Please log in first!");
        return false;
    }

    let userInfo = localStorage.getItem('userInfo');
    let userAchievements = localStorage.getItem('userAchievements');

    if (userInfo == null || userAchievements == null || new Date(JSON.parse(userInfo).expireTime) < new Date()) {
        try {
            userInfo = await getUserData(userID, sessionToken);
        } catch (error) {
            console.error("Please log in again!");
            window.alert("Please log in again!");
            return false;
        }
    }
    localStorage.setItem('userID', userInfo.userId);
    localStorage.setItem('sessionToken', userInfo.sessionToken);
    localStorage.setItem('sessionTokenExpDate', userInfo.sessionTokenExpDate);
    successRunFlag = true;
}
// Run the function
checkUserData();

//Debug on, force successRunFlag to be true
successRunFlag = true;


//Use function to fill all userinfo based on class name

/**
 * 
 * @param {JSON} UserInfo //Note that accept string and auto convert to JSON, but it is not recommended. If undefined, it will use the local storage
 * @example fillUserInfo(UserInfo)
 * @returns {boolean} //Returns true if success, false if failed
 * @description This function will fill all the user info based on the class name, it will return false if the function failed to run
 * 
 */
function fillUserInfo(UserInfo){
    if(UserInfo == undefined){
        UserInfo = JSON.parse(localStorage.getItem('userInfo'));
    }
    if(UserInfo == undefined){
        console.error("Cannot load user info.");
        return false;
    }
    let userName = UserInfo.userName;
    let userID = UserInfo.userId;
    let userNameElements = document.getElementsByClassName('fillUserName');
    let userIDElements = document.getElementsByClassName('fillUserID');
    for(let i = 0; i < userNameElements.length; i++){
        userNameElements[i].innerHTML = userName;
    }
    for(let i = 0; i < userIDElements.length; i++){
        userIDElements[i].innerHTML = userID;
    }
}

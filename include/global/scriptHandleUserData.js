'use strict';
//Fetch the user data from the server, must provide the user id and sessionToken

let scriptHandleUserData = true;

let successRunFlag = false;
let currentURL = new URL(window.location.href);
let userInfo = undefined;
let userAchievements = undefined;

/**
 * 
 * @param {string} userId //The user id, which usually is the user Name without spaces
 * @param {string} sessionToken //The session token, which is a string that is generated when the user logs in
 * @returns {object} //Returns the user data as an object
 * @example getUserData("ChrisWong", "sessionToken") //Returns the user data of the user with the id "ChrisWong
 */
function getUserData(userId, sessionToken) {
    return new Promise((resolve, reject) => {
        let urlParams = "?userId=" + userId + "&sessionToken=" + sessionToken;
        $.ajax({
            type: 'GET',
            url: currentURL.origin + "/debug/userinfo.json",
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function (data) {
                let response = data;
                console.log(response);

                let userInfo = {
                    lastFetchTime: response.featchTime,
                    expireTime: new Date(new Date(response.featchTime).getTime() + 24 * 60 * 60 * 1000),
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
    let userID = localStorage.getItem('userID');
    let sessionToken = localStorage.getItem('sessionToken');
    let sessionTokenExpDate = localStorage.getItem('sessionTokenExpDate');

    if (userID == null || sessionToken == null || new Date(sessionTokenExpDate) < new Date()) {
        console.error("Please log in first!");
        return false;
    }

    let userInfo = localStorage.getItem('userInfo');
    let userAchievements = localStorage.getItem('userAchievements');

    if (userInfo == null || userAchievements == null || new Date(JSON.parse(userInfo).expireTime) < new Date()) {
        try {
            userInfo = await getUserData(userID, sessionToken);
        } catch (error) {
            console.error("Please log in again!");
            return false;
        }
    }
    localStorage.setItem('userID', userInfo.userId);
    localStorage.setItem('sessionToken', userInfo.sessionToken);
    localStorage.setItem('sessionTokenExpDate', userInfo.sessionTokenExpDate);
    successRunFlag = true;
}
//Debug on, force successRunFlag to be true
successRunFlag = true;
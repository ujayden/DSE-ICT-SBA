'use strict';
//This script will load globally
/** Display drop down list when clicking, to make sure the menu can be run on tablet.  */
function toggleDropDownMenu(callElm, menuElm) {
    //The menuElm should be the element it self, not the id of the element.
    if (!(menuElm.style.display == 'block')) {
        menuElm.style.display = 'block';
    }else{
        //Use removeAttribute to remove the style attribute => Make sure css of hover menu can be run.
        //Update: Change to none to make sure the menu can be run on tablet.
        //menuElm.removeAttribute('style');
        menuElm.style.display = 'none';
        function DDM_handleMouseOver() {
            menuElm.removeAttribute('style');
            callElm.removeEventListener('mouseover', DDM_handleMouseOver);
          }
          
        callElm.addEventListener('mouseover', DDM_handleMouseOver);
        }
}

//Use JavaScript selector to select the element of menu content.
let menu_Courses_btn = document.getElementById('dropdownMenu_Courses');
let meun_Courses = document.getElementById('dropdownMenu_Courses-List');
let menu_Explore_btn = document.getElementById('dropdownMenu_Explore');
let menu_Explore = document.getElementById('dropdownMenu_Explore-List');
let menu_About_btn = document.getElementById('dropdownMenu_About');
let menu_About = document.getElementById('dropdownMenu_About-List');

//Add event listener to the header-nav button.
menu_Courses_btn.addEventListener('click', function() {
    toggleDropDownMenu(menu_Courses_btn, meun_Courses);
}
);
menu_Explore_btn.addEventListener('click', function() {
    toggleDropDownMenu(menu_Explore_btn, menu_Explore);
}
);
menu_About_btn.addEventListener('click', function() {
    toggleDropDownMenu(menu_About_btn, menu_About);
}
);
menu_Courses_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenu(menu_Courses_btn, meun_Courses);
    }
}
);
menu_Explore_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenu(menu_Explore_btn, menu_Explore);
    }
}
);
menu_About_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenu(menu_About_btn, menu_About);
    }
}
);
//The menu will be hidden when clicking outside the menu.
document.addEventListener('click', function(event) {
    //If the click is not on the menu, hide the menu.
    if (!(event.target.matches('#dropdownMenu_Courses *'))){
        meun_Courses.removeAttribute('style');
    }
    if (!(event.target.matches('#dropdownMenu_Explore *'))){
        menu_Explore.removeAttribute('style');
    }
    if (!(event.target.matches('#dropdownMenu_About *'))){
        menu_About.removeAttribute('style');
    }
}
);
//Grey out the menu when it is not focus.
let focusOnHeaderDropDownMenuElem = document.getElementById('unfocus');
function toggleGrayOut(grayStatus){
    if (grayStatus == true) {
        focusOnHeaderDropDownMenuElem.style.visibility = 'visible';
    }else{
        focusOnHeaderDropDownMenuElem.style.visibility = 'hidden';
    }
}

focusOnHeaderDropDownMenuElem.addEventListener('click', function() {
    toggleHeaderDropDownMenu(menu_Header);
}
);
//For drop-down menu of header
let headerDropDownMenu_Logo = document.getElementById('headerDropDownMenu-Logo');
let menu_Header = document.getElementById('headerDropDownMenu');
function toggleHeaderDropDownMenu(menuElm) {
    //The menuElm should be the element it self, not the id of the element.
    if (menuElm.classList.contains('headerDDM-close-vertical')) {
        menuElm.classList.add('headerDDM-open-vertical');
        menuElm.classList.remove('headerDDM-close-vertical');
        toggleGrayOut(true);
        headerDropDownMenu_Logo.setAttribute('alt', 'Close the menu');
        //Accessiblity: Make sure the menu can be access by tab when menu is opening.
        menuElm.querySelectorAll('*').forEach(function(elm) {
            if (elm.hasAttribute('tabindex')) {
                elm.setAttribute('tabindex', '0');
            }
        }
        );  
    }else{
        menuElm.classList.remove('headerDDM-open-vertical');
        menuElm.classList.add('headerDDM-close-vertical');
        setTimeout(function() {
            toggleGrayOut(false);
        }, 300);
        headerDropDownMenu_Logo.setAttribute('alt', 'Open the menu');
        //Accessiblity: Make sure the menu can not be access by tab right now.
        menuElm.querySelectorAll('*').forEach(function(elm) {
            if (elm.hasAttribute('tabindex')) {
                elm.setAttribute('tabindex', '-1');
            }
        }
        );
    }
    //Toggle the image of the logo for 0 to 90 degree.
    if (headerDropDownMenu_Logo.style.transform == 'rotate(-90deg)') {
        headerDropDownMenu_Logo.style.transform = 'rotate(0deg)';
    }else{
        headerDropDownMenu_Logo.style.transform = 'rotate(-90deg)';
    }
    
}

//Add event listener to the #headerDropDownMenu-Logo
document.getElementById('headerDropDownMenu-Logo').addEventListener('click', function() {
    toggleHeaderDropDownMenu(menu_Header);

}
);
document.getElementById('headerDropDownMenu-Logo').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleHeaderDropDownMenu(menu_Header);
    }
}
);

//Only function for menu.
function toggleDropDownMenuFlex_headerDDMenu(menuElm, callElm) {
    //The menuElm should be the element it self, not the id of the element.
    if (!(menuElm.style.display == 'flex')) {
        menuElm.style.display = 'flex';
        //Change the Status from "Close" to "Open"
        //.headerDropDownMenu-Title:after rotate 90 degree
        callElm.classList.add('active');

    }else{
        //Use removeAttribute to remove the style attribute => Make sure css of hover menu can be run.
        menuElm.removeAttribute('style');
        //Change the Status from "Open" to "Close"
        //.headerDropDownMenu-Title:after rotate 0 degree
        callElm.classList.remove('active');
    }
}

let headerDDMenu_Course_btn = document.getElementById('headerDropDownMenu-Link-Courses');
let headerDDMenu_Course_list = document.getElementById('headerDropDownMenu-Link-Courses-List');
let headerDDMenu_Explore_btn = document.getElementById('headerDropDownMenu-Link-Explore');
let headerDDMenu_Explore_list = document.getElementById('headerDropDownMenu-Link-Explore-List');
let headerDDMenu_About_btn = document.getElementById('headerDropDownMenu-Link-About');
let headerDDMenu_About_list = document.getElementById('headerDropDownMenu-Link-About-List');
headerDDMenu_Course_btn.addEventListener('click', function() {
    toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_Course_list, headerDDMenu_Course_btn);
}
);
headerDDMenu_Course_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_Course_list, headerDDMenu_Course_btn);
    }
}
);
headerDDMenu_Explore_btn.addEventListener('click', function() {
    toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_Explore_list, headerDDMenu_Explore_btn);
}
);
headerDDMenu_Explore_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_Explore_list, headerDDMenu_Explore_btn);
    }
}
);
headerDDMenu_About_btn.addEventListener('click', function() {
    toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_About_list, headerDDMenu_About_btn);
}
);
headerDDMenu_About_btn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_About_list, headerDDMenu_About_btn);
    }
}
);

const searchBox = document.querySelectorAll('.searchbox');

function redirectSearchPage(searchBoxValue) {
    window.location.href = 'search.html?q=' + searchBoxValue;
}

searchBox.forEach(function(targetElement) {
    targetElement.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            redirectSearchPage(this.value);
        }
    }
    );
})
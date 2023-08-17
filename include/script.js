'use strict';
//This script will load globally
/** Display drop down list when clicking, to make sure the menu can be run on tablet.  */
function toggleDropDownMenu(menuElm) {
    console.log(menuElm);
    //The menuElm should be the element it self, not the id of the element.
    if (!(menuElm.style.display == 'block')) {
        menuElm.style.display = 'block';
    }else{
        //Use removeAttribute to remove the style attribute => Make sure css of hover menu can be run.
        menuElm.removeAttribute('style');
    }
}
//Use JavaScript selector to select the element of menu content.
let menu_ResLibrary_btn = document.getElementById('dropdownMenu_ResLibrary');
let menu_Courses_btn = document.getElementById('dropdownMenu_Courses');
let menu_ResLibrary = document.getElementById('dropdownMenu_ResLibrary-List');
let meun_Courses = document.getElementById('dropdownMenu_Courses-List');

//Add event listener to the header-nav button.
menu_ResLibrary_btn.addEventListener('click', function() {
    toggleDropDownMenu(menu_ResLibrary);
}
);
menu_Courses_btn.addEventListener('click', function() {
    toggleDropDownMenu(meun_Courses);
}
);
//The menu will be hidden when clicking outside the menu.
document.addEventListener('click', function(event) {
    //If the click is not on the menu, hide the menu.
    if (!(event.target.matches('#dropdownMenu_ResLibrary *') || event.target.matches('#dropdownMenu_Courses *'))) {
        menu_ResLibrary.removeAttribute('style');
        meun_Courses.removeAttribute('style');
    }
}
);
//For drop-down menu of header
let menu_Header = document.getElementById('headerDropDownMenu');

//Add event listener to the #headerDropDownMenu-Logo
document.getElementById('headerDropDownMenu-Logo').addEventListener('click', function() {
    toggleDropDownMenu(menu_Header);
}
);
document.getElementById('headerDropDownMenu-Close').addEventListener('click', function() {
    toggleDropDownMenu(menu_Header);
}
);
//Only function for menu.
function toggleDropDownMenuFlex_headerDDMenu(menuElm, callElm) {
    console.log(menuElm);
    //The menuElm should be the element it self, not the id of the element.
    if (!(menuElm.style.display == 'flex')) {
        menuElm.style.display = 'flex';
        //Change the Status from "Close" to "Open"
        callElm.querySelector('.headerDropDownMenu-Link-Status').innerHTML = '&#9660;';
    }else{
        //Use removeAttribute to remove the style attribute => Make sure css of hover menu can be run.
        menuElm.removeAttribute('style');
        //Change the Status from "Open" to "Close"
        callElm.querySelector('.headerDropDownMenu-Link-Status').innerHTML = '&#9654;';
    }
}

let headerDDMenu_Course_btn = document.getElementById('headerDropDownMenu-Link-Courses');
let headerDDMenu_Course_list = document.getElementById('headerDropDownMenu-Link-Courses-List');
let headerDDMenu_ResLibrary_btn = document.getElementById('headerDropDownMenu-Link-ResLibrary');
let headerDDMenu_ResLibrary_list = document.getElementById('headerDropDownMenu-Link-ResLibrary-List');
headerDDMenu_Course_btn.addEventListener('click', function() {
    toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_Course_list, headerDDMenu_Course_btn);
}
);
headerDDMenu_ResLibrary_btn.addEventListener('click', function() {
    toggleDropDownMenuFlex_headerDDMenu(headerDDMenu_ResLibrary_list, headerDDMenu_ResLibrary_btn);
}
);
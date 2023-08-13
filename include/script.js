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
let menu_ResLibrary = document.querySelector('#dropdownMenu_ResLibrary .dropdownContent');
let meun_Courses = document.querySelector('#dropdownMenu_Courses .dropdownContent');

//Add event listener to the header-nav button.
document.getElementById('dropdownMenu_ResLibrary').addEventListener('click', function() {
    toggleDropDownMenu(menu_ResLibrary);
}
);
document.getElementById('dropdownMenu_Courses').addEventListener('click', function() {
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
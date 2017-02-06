//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
    "use strict";
}

Config.endpoint = "https://lrs.adlnet.gov/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

// Local Storage email names -- should / cloud be unique across apps
var storageKeyName = "xapi-jqm/name";
var storageKeyEmail = "xapi-jqm/email";

// jqm's submission process is the reason I'm doing it this way
function userRegisterSubmit() {
    if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
        userRegister($("#reg-name").val(), $("#reg-email").val());
        
        window.location = "../index.html"
    }
}

//Handle manual login

function userRegister( name, email ) {
    // should error check this
    setActor(name, email);
}

function setActor( name, email ) {
    setUserName(name);
    setUserEmail(email);
}

function setUserName(name) {
    localStorage.setItem(storageKeyName, name);
}

function setUserEmail(email) {
    localStorage.setItem(storageKeyEmail, email);
}

// Clear the stored user values.
function userLogout() {
    localStorage.removeItem(storageKeyName);
    localStorage.removeItem(storageKeyEmail);
    window.location = "00-account.html"
}
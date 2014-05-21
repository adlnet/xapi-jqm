/* in progress */
var actor = getActor();

if ( actor == false ) {
    checkLoggedIn();
} else { // silly thing to wrap in an else but I need to restructure the code to handle a missing actor on login page

    Config.actor = actor;
    ADL.XAPIWrapper.changeConfig(Config);

    // Abstracted page changing logic
    $( window ).on("pagechange", function(event) {

        var chapter = $("body").attr("data-chapter");
        var pagename = $.mobile.activePage.attr("id");
        var activityID = "http://adlnet.gov/xapi/samples/xapi-jqm/changedpage/" + chapter + "/" + pagename;

        var stmt = { "actor": getActor(),
            "verb": ADL.verbs.experienced,
            "context": {
                "contextActivities": {
                    "parent": [
                        {
                            "id": courseID,
                            "definition": {
                                "name": {
                                    "en-US": "xAPI for jQuery Demo"
                                },
                                "description": {
                                    "en-US": "A sample HTML5 mobile app with xAPI tracking."
                                }
                            },
                            "objectType": "Activity"
                        }
                    ]
                }
            },
            "object": {
                "id" : activityID,
                "objectType": "Activity",
                "definition": {
                    "name": {
                        "en-US": "xAPI jQuery Mobile " + chapter + " " + pagename
                    },
                    "type": linkType
                }
            }
        };

        // Send a statement
        ADL.XAPIWrapper.sendStatement(stmt);

        // Saving the state
        ADL.XAPIWrapper.sendState(courseID, getActor(), "session-state", null, { "info": "reading", "chapter": chapter, "page": pagename });

    });
} // end silly else

function getState() {
    ADL.XAPIWrapper.getState(activityID, getActor(), "session-state");
}

function getPage() {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
}

function checkLoggedIn() {
    // If the actor doesn't exist, send them to the login page
    if ( getPage() != "00-account.html" ) {
        userLogin();
    }
}

function userLogin() {
    // Should get the page root
    window.location = "chapters/00-account.html#login";
}

function userLogout() {
    clearActor();
    window.location = "../../"; // lol
}

// jqm's submission process is the reason I'm doing it this way
function userRegisterSubmit() {
    if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
        userRegister($("#reg-name").val(), $("#reg-email").val());
        window.location = "../index.html"
    }
}

function userRegister(name, email) {
    // should error check this
    setActor(name, email);
}

/* Name, Email, Actor, gets and sets */

// Actor
function getActor() {
    var name = localStorage.getItem("xapi-jqm/name");
    var email = localStorage.getItem("xapi-jqm/email");
    if ( name == null || email == null ) {
        return false;
    } else {
        var actor = { "mbox": "mailto:" + email, "name": name };
        return actor;
    }
}
function setActor(name, email) {
    setUserName(name);
    setUserEmail(email);
}

// Name
function getUserName() {
    return localStorage.getItem("xapi-jqm/name");
}
function setUserName(name) {
    localStorage.setItem("xapi-jqm/name", name);
}

// Email
function getUserEmail() {
    return localStorage.getItem("xapi-jqm/email");
}
function setUserEmail(email) {
    localStorage.setItem("xapi-jqm/email", email);
}

// Destroy all the things
function clearActor() {
    localStorage.removeItem("xapi-jqm/name");
    localStorage.removeItem("xapi-jqm/email");
}

// statement for launching content -- reserved for when login logic is complete
/*var stmt = { "actor": actor,
    "verb": ADL.verbs.launched,
    "context": {
        "contextActivities": {
            "parent": [
                { "id": courseID,
                    "definition": {
                        "name": { "en-US": "xAPI for jQuery Demo" },
                        "description": { "en-US": "A sample HTML5 mobile app with xAPI tracking." }
                    },
                    "objectType": "Activity"
                }
            ]
        }
    },
    "object": {
        "id": "http://adlnet.gov/xapi/samples/xapi-jqm/glossary/",
        "objectType": "Activity",
        "definition": {
            "name": {
                "en-US": "xAPI jQuery Demo Glossary"
            },
            "type": linkType
        }
    }
};*/

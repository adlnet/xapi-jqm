/* in progress */
var actor = getActor();

if ( actor == false ) {
    checkLoggedIn();
} else { // silly thing to wrap in an else but I need to restructure the code to handle a missing actor on login page

    doConfig();

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

/* State functions */
function getState() {
    return ADL.XAPIWrapper.getState(courseID, getActor(), "session-state");
}

/* Helpers */
function doConfig() { // sorry
    Config.actor = actor;
    ADL.XAPIWrapper.changeConfig(Config);
}

function getPage() {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
}

/* Login / Logout functions */
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
    courseExited();
    clearActor();
    window.location = "../"; // lol
}

function userRegister(name, email) {
    // should error check this
    setActor(name, email);
    courseRegistered();
}

// jqm's submission process is the reason I'm doing it this way
function userRegisterSubmit() {
    if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
        userRegister($("#reg-name").val(), $("#reg-email").val());
        courseLaunched();
        window.location = "../index.html"
    }
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

/* SCORMy
 * verbose for now until login logic / config is cleaner
 */
 
function courseRegistered() {
    
    doConfig();

    // statement for launching content
    var stmt = { "actor": getActor(),
        "verb": ADL.verbs.registered,
        "context": {
            "contextActivities": {
                "parent": [
                    { "id": courseID,
                        "definition": {
                            "name": { "en-US": "xAPI for jQuery Mobile Demo" },
                            "description": { "en-US": "A sample HTML5 app with xAPI tracking." }
                        },
                        "objectType": "Activity"
                    }
                ]
            }
        },
        "object": {
            "id": "http://adlnet.gov/xapi/samples/xapi-jqm/registered",
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast xapi-jqm"
                },
                "type": linkType
            }
        }
    };

    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function courseLaunched() {
    
    doConfig();

    // statement for launching content
    var stmt = { "actor": getActor(),
        "verb": ADL.verbs.launched,
        "context": {
            "contextActivities": {
                "parent": [
                    { "id": courseID,
                        "definition": {
                            "name": { "en-US": "xAPI for jQuery Mobile Demo" },
                            "description": { "en-US": "A sample HTML5 app with xAPI tracking." }
                        },
                        "objectType": "Activity"
                    }
                ]
            }
        },
        "object": {
            "id": "http://adlnet.gov/xapi/samples/xapi-jqm/launched",
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast xapi-jqm"
                },
                "type": linkType
            }
        }
    };

    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function courseExited() {

    doConfig();

    // statement for launching content
    var stmt = { "actor": getActor(),
        "verb": ADL.verbs.exited,
        "context": {
            "contextActivities": {
                "parent": [
                    { "id": courseID,
                        "definition": {
                            "name": { "en-US": "xAPI for jQuery Mobile Demo" },
                            "description": { "en-US": "A sample HTML5 app with xAPI tracking." }
                        },
                        "objectType": "Activity"
                    }
                ]
            }
        },
        "object": {
            "id": "http://adlnet.gov/xapi/samples/xapi-jqm/exited",
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast xapi-jqm"
                },
                "type": linkType
            }
        }
    };

    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

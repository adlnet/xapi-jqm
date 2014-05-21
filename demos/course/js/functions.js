// Apply setttings from config.js
ADL.XAPIWrapper.changeConfig(Config);

// Abstracted page changing logic
$( window ).on("pagechange", function(event) {
    var chapter = $("body").attr("data-chapter");
    var pagename = $.mobile.activePage.attr("id");
    var activityId = "http://adlnet.gov/xapi/samples/xapi-jqm/changedpage/" + chapter + "/" + pagename;

    var stmt = { "actor": actor,
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
            "id" : activityId,
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
    ADL.XAPIWrapper.sendState(courseID, actor, "session-state", null, { "info": "reading", "chapter": chapter, "page": pagename });

});

function getState() {
    ADL.XAPIWrapper.getState(activityId, actor, "session-state");
}

function registerUser() {
    window.location = "chapters/00-account.html#register";
}

// Yeah they say user but use email
function getUser() {
    //var email = localStorage.getItem("xapi-jqm/email");
    return email;
}

function setUser(email) {
    //localStorage.setItem("xapi-jqm/email", email);
}

function clearUser() {
    //localStorage.setItem("xapi-jqm/email", "");
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

/* in progress */

// Global Actor
actor = getActor();

if ( actor  == false ) {
    checkLoggedIn();
} else { // silly thing to wrap in an else but I need to restructure the code to handle a missing actor on login page

    doConfig();

    // Abstracted page changing logic
    $( window ).on("pagechange", function(event) {

        var chapter = $("body").attr("data-chapter");
        var pageID = $.mobile.activePage.attr("id");
        var activityID = "http://adlnet.gov/xapi/samples/xapi-jqm/changedpage/" + chapter + "/" + pageID;

        var stmt = {
            "actor": actor,
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
                        "en-US": "How to Make French Toast Chapter: " + chapter + ", page: " + pageID
                    },
                    "type": linkType
                }
            }
        };

        // Send a statement
        ADL.XAPIWrapper.sendStatement(stmt);
        ADL.XAPIWrapper.sendState(courseID, actor, "session-state", null, { "info": "reading", "chapter": chapter, "page": pageID });

        // initialize youtube video for the video chapter only
        if (chapter === "04-video"){
            var video = Popcorn.youtube("#How-to-make-french-toast-xapi-jqm-video", TUTORIAL_VIDEO_URL);
            video.media.src = TUTORIAL_VIDEO_URL;
            video.autoplay(false);
            ADL.XAPIVideo.addVideo(video, "", true, false, false, false);            
        }
    });
} // end silly else

/* State functions */
function getState() {
    return ADL.XAPIWrapper.getState(courseID, actor, "session-state");
}

/* Course Progress */
// find from DOM
function findChaptersCompleted() {
    return $.map($("#toc-list li.ui-icon-check"), function(n, i) { return n.id; });
}

// Get from State API
function getChaptersCompleted() {
    var chaptersCompleted = ADL.XAPIWrapper.getState(courseID, actor, "chapters-completed");
    return chaptersCompleted.chapters;
}

// Set in State API
function setChapterComplete() {
    var chapterID = $("body").attr("data-chapter");
    var currentCompletedChapters = getChaptersCompleted();   
    var chapterCompleted = [ chapterID ];

    var hash = {}, union = [];

    // #thatHappened
    $.each($.merge($.merge([], currentCompletedChapters), chapterCompleted), function (index, value) { hash[value] = value; });
    $.each(hash, function (key, value) { union.push(key); } );
    
    ADL.XAPIWrapper.sendState(courseID, actor, "chapters-completed", null, { "chapters": union });

    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.completed,
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
            "id": "http://adlnet.gov/xapi/samples/xapi-jqm/completedchapter/" + chapterCompleted,
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast Chapter: " + chapterCompleted
                },
                "type": linkType
            }
        }
    };

    // Send registered statement
    ADL.XAPIWrapper.sendStatement(stmt);

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
    // Set global actor var so other functions can use it
    actor = getActor();
    courseRegistered();
    // Setup chapters-complete
    ADL.XAPIWrapper.sendState(courseID, actor, "chapters-completed", null, { "chapters": [] });
}

// jqm's submission process is the reason I'm doing it this way
function userRegisterSubmit() {
    if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
        userRegister($("#reg-name").val(), $("#reg-email").val());
        courseLaunched();
        window.location = "../index.html"
    }
}

/* SCORMy
 * verbose for now until login logic / config is cleaner
 */
function courseRegistered() {
    
    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
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

    // Send registered statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function courseLaunched() {
    
    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
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

    // Send launched statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function courseExited() {

    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
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

    // Send exited statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function gradeQuestion() {
    var pageID = $.mobile.activePage.attr("id");
    var quiz_name = "q" + pageID[1]
    var questionID = "http://adlnet.gov/xapi/samples/xapi-jqm/quiz/" + quiz_name;

    var q_form = $("#" + pageID + "_form :input")
    var question_type = q_form[0].type
    var correct_answer = CORRECT_QUIZ_ANSWERS[parseInt(pageID[1]) - 1];
    var correct_answer_display = [];

    switch ( question_type ) {
        case 'radio':
        case 'checkbox':
            var user_answer = [];
            var user_answer_display = [];
            
            //loop through radio/checkboxex and push ones that were selected
            $("#" + pageID + "_form input").each(function(idx, val) {
                    if ( val.checked ){
                        user_answer.push(idx + 1);
                        user_answer_display.push(this.previousSibling.textContent);
                    }
                    if ( $.inArray(idx+1, correct_answer ) > -1) {
                        correct_answer_display.push(this.previousSibling.textContent);
                    }
                });

            //compare radio/checkbox selections 
            var success = false;
            if (correct_answer.join(',') === user_answer.sort().join(',')){
                success = true;
            }

            var stmt = {
                "actor": actor,
                "verb": ADL.verbs.answered,
                "object": {
                    "id" : questionID,
                    "objectType": "Activity",
                    "definition": {
                        "name": {
                            "en-US": "How to Make French Toast quiz question " + quiz_name
                        },
                        "type": quizType
                    }
                },
                "result": {
                    "success": success,
                    "response": user_answer.toString() + " " + user_answer_display.toString(),
                    "extensions":{
                        "answer:correct_answer": correct_answer.toString() + " " + correct_answer_display.toString()
                    }
                },
                "context":{
                    "contextActivities": {
                        "parent":[
                            {
                                "id": courseID
                            },
                            {
                                "id": quizID
                            }
                        ]
                    }
                }
            };            
            break;
        case 'text':
            user_answer = q_form.val();
            success = false;
            if ( user_answer === correct_answer ){
                success = true;
            }
            var stmt = {
                "actor": actor,
                "verb": ADL.verbs.answered,
                "object": {
                    "id" : questionID,
                    "objectType": "Activity",
                    "definition": {
                        "name": {
                            "en-US": "How to Make French Toast quiz question " + quiz_name
                        },
                        "type": quizType
                    }
                },
                "result": {
                    "success": success,
                    "response": user_answer,
                    "extensions":{
                        "answer:correct_answer": correct_answer
                    }
                },
                "context":{
                    "contextActivities": {
                        "parent":[
                            {
                                "id": courseID
                            },
                            {
                                "id":quizID
                            }
                        ]
                    }
                }
            };
            break;
    }
    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);
    localStorage.setItem("xapi-jqm/" + actor["name"] + "/" + quiz_name, success);
}

function makeAssessment() { 
    var results = [];
    var correct = 0;

    for ( var i=0; i < CORRECT_QUIZ_ANSWERS.length; i++ ) {
        results.push(localStorage.getItem("xapi-jqm/" + actor['name'] + "/" + "q" + (i+1)));
        localStorage.removeItem("xapi-jqm/" + actor['name'] + "/" + "q" + (i+1));
    }

    $.each(results, function(idx, val) {
        if (val === "true"){
            correct++;
        }
    });

    var verb = ADL.verbs.failed;
    var percentage = Math.round((correct/CORRECT_QUIZ_ANSWERS.length) * 100)
    var display = "";
    if ( percentage > 60 ) {
        verb = ADL.verbs.passed;
        display = "You passed the quiz! You scored " + percentage + "%"
    } else {
        display = "You failed the quiz! You scored " + percentage + "%"        
    }
    var stmt = {
        "actor": actor,
        "verb": verb,
        "object": {
            "id" : quizID,
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast quiz"
                },
                "type": quizType
            }
        },
        "result": {
            "score":{
                "min": 0,
                "raw": correct,
                "max": CORRECT_QUIZ_ANSWERS.length
            }
        },
        "context":{
            "contextActivities": {
                "parent":[
                    {
                        "id": courseID
                    }
                ]
            }
        }
    };
    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);
    $("#quiz_results").html(display)
}

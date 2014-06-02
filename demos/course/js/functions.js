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

function gradeQuestion(){
    var pagename = $.mobile.activePage.attr("id");
    var quiz_name = "q" + pagename[1]
    var quizID = "http://adlnet.gov/xapi/samples/xapi-jqm/quiz/"
    var questionID = "http://adlnet.gov/xapi/samples/xapi-jqm/quiz/" + quiz_name;

    var q_form = $("#"+pagename+"_form :input")
    var question_type = q_form[0].type
    var correct_answer = CORRECT_QUIZ_ANSWERS[parseInt(pagename[1]) - 1];
    var correct_answer_display = [];
    var actor = getActor()

    switch (question_type){
        case 'radio':
        case 'checkbox':
            var user_answer = [];
            var user_answer_display = [];
            //loop through radio/checkboxex and push ones that were selected
            $("#"+pagename+"_form input").each(function(idx, val){
                    if (val.checked){
                        user_answer.push(idx + 1);
                        user_answer_display.push(this.previousSibling.textContent);
                    }
                    if ($.inArray(idx+1, correct_answer) > -1){
                        correct_answer_display.push(this.previousSibling.textContent);
                    }
                });

            //compare radio/checkbox selections 
            var success = false;
            if (correct_answer.sort().join(',') === user_answer.sort().join(',')){
                success = true;
            }

            var stmt = new ADL.XAPIStatement({
                "actor": actor,
                "verb": ADL.verbs.answered,
                "object": {
                    "id" : questionID,
                    "objectType": "Activity",
                    "definition": {
                        "name": {
                            "en-US": "xAPI jQuery Mobile quiz question " + quiz_name
                        },
                        "type": quizType
                    }
                },
                "result": {
                    "success": success,
                    "response": user_answer.toString() + user_answer_display.toString(),
                    "extensions":{
                        "answer:correct_answer": correct_answer.toString() + correct_answer_display.toString()
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
            });            
            break;
        case 'text':
            user_answer = q_form.val();
            success = false;
            if (user_answer === correct_answer){
                success = true;
            }
            var stmt = new ADL.XAPIStatement({
                "actor": actor,
                "verb": ADL.verbs.answered,
                "object": {
                    "id" : questionID,
                    "objectType": "Activity",
                    "definition": {
                        "name": {
                            "en-US": "xAPI jQuery Mobile quiz question" + quiz_name
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
            });
            break;
    }
    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);
    localStorage.setItem("xapi-jqm/"+actor["name"]+"/"+quiz_name, success);
}

function makeAssessment(){
    var actor = getActor();
    var quizID = "http://adlnet.gov/xapi/samples/xapi-jqm/quiz/";    
    var results = [];
    var correct = 0;

    for(var i=0; i<CORRECT_QUIZ_ANSWERS.length;i++){
        results.push(localStorage.getItem("xapi-jqm/"+actor['name']+"/"+"q"+(i+1)));
        localStorage.removeItem("xapi-jqm/"+actor['name']+"/"+"q"+(i+1));
    }

    $.each(results, function(idx, val){
        if (val === "true"){
            correct++;
        }
    });

    var verb = ADL.verbs.failed;
    var percentage = Math.round((correct/CORRECT_QUIZ_ANSWERS.length) * 100)
    var display = "";
    if (percentage > 60){
        verb = ADL.verbs.passed;
        display = "You passed the quiz! You scored " + percentage + "%"
    }
    else{
        display = "You failed the quiz! You scored " + percentage + "%"        
    }
    var stmt = new ADL.XAPIStatement({
                "actor": actor,
                "verb": verb,
                "object": {
                    "id" : quizID,
                    "objectType": "Activity",
                    "definition": {
                        "name": {
                            "en-US": "xAPI jQuery Mobile quiz"
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
            });
    // Send a statement
    ADL.XAPIWrapper.sendStatement(stmt);
    $("#quiz_results").html(display)
}
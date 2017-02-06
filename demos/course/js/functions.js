/* in progress */

// Global Actor
actor = getActor();

/* Page Change Logic */
if ( actor  == false ) {
    checkLoggedIn();
} else { // silly thing to wrap in an else but I need to restructure the code to handle a missing actor on login page

    doConfig();

    // Handle chapter clicks to send launch statements
    $( document ).on("vclick", "a.chapter", function() {
        $chapter = $(this);
        var chapter = $chapter.parent("li").attr("id");
        var name = $chapter.text();
        chapterLaunched(chapter, name);
    });

    // Abstracted page changing logic -- catch-all
    $( window ).on("pagechange", function(event) {

        var chapter = $("body").attr("data-chapter");
        var pageID = $.mobile.activePage.attr("id");
        var activityID = moduleID + chapter + "/" + pageID;
        var context = createContext(chapter);

        var stmt = {
            "actor": actor,
            "verb": ADL.custom.verbs.read,
            "context": context,
            "object": {
                "id" : activityID,
                "objectType": "Activity",
                "definition": {
                    "name": {
                        "en-US": moduleName + ": " + chapter + ", page: " + pageID
                    }
                }
            }
        };

        // Send a statement
        ADL.XAPIWrapper.sendStatement(stmt);
        ADL.XAPIWrapper.sendState(moduleID, actor, "session-state", null, { "info": "reading", "chapter": chapter, "page": pageID });

    });
} // end silly else

/* State functions */
function getState() {
    return ADL.XAPIWrapper.getState(moduleID, actor, "session-state");
}

/* Course Progress */

// Get from State API
function getChaptersCompleted() {
    var chaptersCompleted = ADL.XAPIWrapper.getState(moduleID, actor, "chapters-completed");
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
    
    ADL.XAPIWrapper.sendState(moduleID, actor, "chapters-completed", null, { "chapters": union });

    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.completed,
        "context": createContext(),
        "object": {
            "id": moduleID + chapterCompleted,
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": moduleName + ": " + chapterCompleted
                }
            }
        }
    };

    // Send chapterComplete statement
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
    var name = localStorage.getItem(storageKeyName);
    var email = localStorage.getItem(storageKeyEmail);
    if ( name == null || email == null ) {
        return false;
    } else {
        var actor = { "mbox": "mailto:" + email, "name": name };
        return actor;
    }
}
function setActor( name, email ) {
    setUserName(name);
    setUserEmail(email);
}

// Name
function getUserName() {
    return localStorage.getItem(storageKeyName);
}
function setUserName(name) {
    localStorage.setItem(storageKeyName, name);
}

// Email
function getUserEmail() {
    return localStorage.getItem(storageKeyEmail);
}
function setUserEmail(email) {
    localStorage.setItem(storageKeyEmail, email);
}

// Destroy all the things
function clearActor() {
    localStorage.removeItem(storageKeyName);
    localStorage.removeItem(storageKeyEmail);
}

/* Login / Logout functions */
function checkLoggedIn() {
    // If the actor doesn't exist, send them to the login page
    if ( getPage() != "00-account.html" ) {
        userLogin();
    }
}

/*
function getBaseURL() {
    // silly regex hack for now #helpWanted
    var regex = new RegExp("(index.html|.*\/chapters\/.*|.*\/glossary.html)");
    var location = window.location.href;
    if ( regex.test(location) ) {
        var str = location.split("/").pop();
        var baseurl = location.replace(str, "");
        var str = "chapters/"
        var baseurl = baseurl.replace(str, "");
    } else {
        // otherwise give up and send them to the github version
        var baseurl = "http://adlnet.github.io/xapi-jqm/demos/course/";
    }
    return baseurl;
}*/

function userLogin() {
    // Should get the page root
    window.location = "chapters/00-account.html#login";
}

function userLogout() {
    courseExited();
    clearActor();
    window.location = "../"; // lol
}

function userRegister( name, email ) {
    // should error check this
    setActor(name, email);
    // Set global actor var so other functions can use it
    actor = getActor();
    courseRegistered();
    // Setup chapters-complete
    ADL.XAPIWrapper.sendState(moduleID, actor, "chapters-completed", null, { "chapters": [] });
}

// jqm's submission process is the reason I'm doing it this way
function userRegisterSubmit() {
    if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
        userRegister($("#reg-name").val(), $("#reg-email").val());
        courseLaunched();
        window.location = "../index.html"
    }
}

/*
 * xAPIy
 */
function checkboxClicked(chapter, pageID, checkboxID, checkboxName) {
    
    doConfig();
    
    // Figure out if it was checked or unchecked
    var isChecked = $("#"+checkboxID).prop('checked');
    var checkedVerb = (isChecked) ? ADL.custom.verbs.checked : ADL.custom.verbs.unchecked;

    var baseActivity = {
        "id": moduleID + "/" + chapter + "/" + pageID + "#" + checkboxID,
        "definition": {
            "name": {
                "en-US": checkboxName
            },
            "description": {
                "en-US": "The " + checkboxName + " checkbox from chapter " + chapter + "; page " + pageID
            }
        },
        "objectType": "Activity"
    };

    // statement for checking content
    var stmt = {
        "actor": actor,
        "verb": checkedVerb,
        "object": baseActivity,
        "context": createContext(chapter, pageID, undefined, true)
    };

    // Send statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

/* 
 * SCORMy
 */
function courseRegistered() {
    
    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.registered,
        "object": baseActivity
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
        "object": baseActivity
    };

    // Send launched statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

function chapterLaunched(chapter, name) {
        var activityID = moduleID + chapter;

        var stmt = {
            "actor": actor,
            "verb": ADL.verbs.launched,
            "context": createContext(),
            "object": {
                "id":  activityID,
                "objectType": "Activity",
                "definition": {
                    "name": {
                        "en-US": moduleName + ": " + chapter
                    }
                }
            }
        };

        // Send a statement
        ADL.XAPIWrapper.sendStatement(stmt);
}


function courseMastered() {
    
    doConfig();

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.mastered,
        "object": baseActivity
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
        "object": baseActivity
    };

    // Send exited statement
    ADL.XAPIWrapper.sendStatement(stmt);

}

// supply the chapter, the page, and any sub-activity in that chapter and page. add both if you want the parentChapter activity
// added as a separate activity in the context from the parentChapter/parentPage activity
function createContext( parentChapter, parentPage, subParentActivity, both ) {
    var baseContext = {
        "contextActivities": {
            "parent": [
                baseActivity
            ]
        }
    };

    // set both
    if ( typeof both === "undefined") {
        both = false;
    }

    // if parent chapter make the chapterActivity
    if ( typeof parentChapter !== "undefined" ) {
        var chapterActivity = {
            "id": moduleID + parentChapter,
            "definition": {
                "name": {
                    "en-US": moduleName + ": " + parentChapter
                }
            },
            "objectType": "Activity"
        };
        
        // if parent page and don't want both, just append the parent page to the end of the parentChapter activity
        if ( typeof parentPage !== "undefined" && !both ) {
            chapterActivity["id"] = chapterActivity["id"] + "/" + parentPage;
            chapterActivity["definition"]["name"]["en-US"] = chapterActivity["definition"]["name"]["en-US"]  + ", page: " + parentPage;
        }
        // else they want both
        else if ( typeof parentPage !== "undefined" && both ) {
            var chapterParentActivity = {
                "id": moduleID + parentChapter + "/" + parentPage,
                "definition": {
                    "name": {
                        "en-US": moduleName + ": " + parentChapter + ", page: " + parentPage
                    }
                },
                "objectType": "Activity"
            };
            baseContext.contextActivities.parent.push(chapterParentActivity);            
        }
        baseContext.contextActivities.parent.push(chapterActivity);
    
        // if there is a sub activity, add it
        if ( typeof subParentActivity !== "undefined" ) {
            var subActivity = {
                "id": moduleID + parentChapter + "/" + parentPage + "#" + subParentActivity,
                "definition": {
                    "name": {
                        "en-US": moduleName + ": " + parentChapter + ", page: " + parentPage + " " + subParentActivity
                    }
                },
                "objectType": "Activity"
            };
            baseContext.contextActivities.parent.push(subActivity);
        }
    }
    return baseContext;
}


/*
    Quiz code
*/
var quizID = moduleID;
var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];

function gradeQuestion() {
    var chapter = $("body").attr("data-chapter");
    var pageID = $.mobile.activePage.attr("id");
    var quiz_name = "q" + pageID[1]
    var questionID = quizID + "#" + quiz_name;

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
            if ( correct_answer.join(',') === user_answer.sort().join(',') ) {
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
                            "en-US": moduleName + " " + quiz_name
                        }
                    }
                },
                "result": {
                    "success": success,
                    "response": user_answer.toString() + " " + user_answer_display.toString(),
                    "extensions":{
                        "answer:correct_answer": correct_answer.toString() + " " + correct_answer_display.toString()
                    }
                },
                "context":createContext(chapter, pageID, "quiz")
            };            
            break;
        case 'text':
            user_answer = q_form.val();
            success = false;
            if ( user_answer.toLowerCase() === correct_answer.toLowerCase() ) {
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
                            "en-US": moduleName + " " + quiz_name
                        }
                    }
                },
                "result": {
                    "success": success,
                    "response": user_answer,
                    "extensions":{
                        "answer:correct_answer": correct_answer
                    }
                },
                "context":createContext(chapter, pageID, "quiz")
            };
            break;
    }

    // Send a statement
    updateLRS(stmt);

    //??
    localStorage.setItem("xapi-jqm/" + actor["name"] + "/" + quiz_name, success);
}

function makeAssessment() { 
    var chapter = $("body").attr("data-chapter");    
    var results = [];
    var correct = 0;

    var quizActivity = {
        "id": quizID  + chapter,
        "definition": {
            "name": {
                "en-US": "xAPI for jQuery Mobile French Toast Demo quiz"
            }
        },
        "objectType": "Activity"
    };

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
    var percentage = Math.round( (correct/CORRECT_QUIZ_ANSWERS.length) * 100 )
    var display = "";
    if ( percentage > 60 ) {
        verb = ADL.verbs.passed;
        setChapterComplete();
        display = "You passed the quiz! You scored " + percentage + "%"
    } else {
        display = "You failed the quiz! You scored " + percentage + "%"        
    }
    var stmt = {
        "actor": actor,
        "verb": verb,
        "object": quizActivity,
        "result": {
            "score":{
                "min": 0,
                "raw": correct,
                "max": CORRECT_QUIZ_ANSWERS.length
            }
        },
        "context": createContext()
    };
    // Send a statement
    updateLRS(stmt);

    

    // Mastered statement
    var chaptersCompleted = getChaptersCompleted();
    if ( percentage == 100 && chaptersCompleted.length > 4 ) {
        courseMastered();
        // show a badge by appending to display -- PoC
        display += '<p><img src="../media/488px-badge-french-toast.jpg" alt="French Toast Badge" title="French Toast Badge" style="width:100%;max-width:488px" /></p><h4>French Toast Master</h4><p>Congratulations, you have mastered the course in How to Make French Toast</p>';
    }

    $("#quiz_results").html(display);
}

// End Quiz Code


// Video Code

function initYT() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('How-to-make-french-toast-xapi-jqm-video', {
    height: '360',
    width: '640',
    videoId: video,
    playerVars: { 'autoplay': 0 },
    events: {
      'onReady': ADL.XAPIYoutubeStatements.onPlayerReady,
      'onStateChange': ADL.XAPIYoutubeStatements.onStateChange
    }
  });
}

// End Video Code

$( document ).ready(function() {
    // Handle checkbox clicks -- basic no knowledge of context or checked
    $(":checkbox").change(function(event) {
        $checkbox = $(this);
        var checkboxID = $checkbox.attr("id");
        var checkboxName = $checkbox.siblings("label").text();
        var chapter = $("body").attr("data-chapter");
        var pageID = $.mobile.activePage.attr("id");
        checkboxClicked(chapter, pageID, checkboxID, checkboxName);
    });
});

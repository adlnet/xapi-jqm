/* in progress */

// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/course/"; // trailing slash
var moduleName = "How to Make French Toast xapi-jqm Course Demo";
var courseType = "http://adlnet.gov/xapi/activities/course";
var mediaType = "http://adlnet.gov/xapi/activities/media";
var baseActivity = {
    "id": moduleID,
    "definition": {
        "name": {
            "en-US": moduleName
        },
        "description": {
            "en-US": "A sample HTML5 mobile app with xAPI tracking that teaches you how to make french toast."
        }
    },
    "objectType": "Activity"
};
var video = "vPrtNzvDS5M"; // Change this to your video ID
var actor;
var wrapper;
var customContextID;

ADL.launch(function(err,launchData,xAPIWrapper){

    // No launch server, so configure manually.
    if(err){
        wrapper = ADL.XAPIWrapper;

        if(!getUserName()){
            // No user so login.
            window.location = "chapters/00-account.html";

        } else {            
            actor = getActor();
            Config.actor = actor;
            wrapper.changeConfig(Config);
        }

    } else {            

        wrapper = xAPIWrapper;
        actor = launchData.actor;
        if (launchData.customData.content) {
            customContextID = launchData.customData.content;
        }
    }

    // Only call when the video is loaded.
    if(window.location.pathname.includes("/chapters/04-video.html")) {
        var options = {    
            "actor":  actor,
            "videoActivity": {"id":"https://www.youtube.com/watch?v=" + video, "definition":{"name": {"en-US":video}} },
            "context": createContext('04-video')
        };
        ADL.XAPIYoutubeStatements.changeConfig(options, wrapper);

        initYT();

        /*
         * Custom Callbacks
         */
        ADL.XAPIYoutubeStatements.onPlayerReadyCallback = function(stmt) {
          console.log("on ready callback");
        }
        // Dispatch Youtube statements with XAPIWrapper
        ADL.XAPIYoutubeStatements.onStateChangeCallback = function(event, stmt) {
          console.log(stmt);
          if (stmt) {
            stmt['timestamp'] = (new Date()).toISOString();
            wrapper.sendStatement(stmt, function(){});
          } else {
            console.warn("no statement found in callback for event: " + event);
          }
        }
    }

    var chapter = $("body").attr("data-chapter");
    var activityID = moduleID + chapter
    var context = createContext();

    if(chapter == "toc"){
        var stmt = {
            "actor": actor,
            "verb": ADL.verbs.launched,
            "context": context,
            "object": {
                "id" : activityID,
                "objectType": "Activity",
                "definition": {
                    "name": {
                        "en-US": moduleName + ": " + chapter
                    }
                }
            }
        };

        updateLRS(stmt);
    }   

    wrapper.sendState(moduleID, actor, "session-state", null, { "info": "reading", "chapter": chapter});
    

    var chaptersCompleted = getChaptersCompleted()
    $("#toc-list li").each(function() {
        if ( $.inArray( $(this).attr("id"), chaptersCompleted ) !== -1 ) {
            $(this).addClass("ui-icon-check");
        }
    });

},false);


//Send statements to the LRS.
function updateLRS(stmnt){

    wrapper.sendStatement(stmnt);
}

// A callback for the sendStatement.
var outputResults = function (resp, thing) {
    var spanclass = "text-info";
    var text = "";
    if (resp.status >= 400) {
        spanclass = "text-danger";
        text = (thing.totalErrors > 1) ? "Errors: " : "Error: ";
        for ( var res in thing.results ) {
            text += "<br>" + ((thing.results[res].instance.id) ? thing.results[res].instance.id : "Statement " + res);
            for ( var err in thing.results[res].errors ) {
                text += "<br>&nbsp;&nbsp;" + thing.results[res].errors[err].trace;
                text += "<br>&nbsp;&nbsp;&nbsp;&nbsp;" + thing.results[res].errors[err].message;
            }
        }
    } else {
        if ( resp.responseText )
            text = "Successfully sent " + resp.responseText;
        else
            text = thing;
    }

    console.log(text);
};

/* State functions */
function getState() {
    return wrapper.getState(moduleID, actor, "session-state");
}

/* Course Progress */

// Get from State API
function getChaptersCompleted() {
    var chaptersCompleted = wrapper.getState(moduleID, actor, "chapters-completed");

    if(!chaptersCompleted){
        chaptersCompleted = {"chapters": []};
    }
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
    
    wrapper.sendState(moduleID, actor, "chapters-completed", null, { "chapters": union });

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
    updateLRS(stmt);
   
}

function setRead(chapter, id, parentChapter){
    stmt = {
        "actor": actor,
        "verb": ADL.custom.verbs.read,
        "context": createContext(parentChapter),
        "object": {
            "id" : moduleID + chapter +'/'+id,
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": moduleName + ": " + chapter + ', ' + id 
                }
            }
        }
    };

    updateLRS(stmt);
}

// Abstracted page changing logic -- for xapi read of glossary
$( window ).on("click", function(event) {
    var chapter = $("body").attr("data-chapter");
    var pageID = $.mobile.activePage.attr("id");

    if(chapter == "glossary" && pageID != 'list'){
        setRead(chapter, pageID, chapter);
    }
});

/* Helpers */
function getPage() {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
}

/* Name, Email, Actor, gets */

// Actor
function getActor() {
    var name = localStorage.getItem(storageKeyName);
    var email = localStorage.getItem(storageKeyEmail);
    if ( name == null  ) {
        return false;
    } else {
        var actor = { "mbox": "mailto:" + email, "name": name };
        return actor;
    }
}
// Name
function getUserName() {
    return localStorage.getItem(storageKeyName);
}

// Email
function getUserEmail() {
    return localStorage.getItem(storageKeyEmail);
}


/*
 * xAPIy
 */
function checkboxClicked(chapter, pageID, checkboxID, checkboxName) {
    
    // Figure out if it was checked or unchecked
    var isChecked = $("#"+checkboxID).prop('checked');
    var checkedVerb = (isChecked) ? ADL.custom.verbs.checked : ADL.custom.verbs.unchecked;

    var baseActivity = {
        "id": moduleID  + chapter + "/" + pageID + "#" + checkboxID,
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
    updateLRS(stmt);

}

function radioButtonClicked(chapter, pageID, btnID, btnName) {
    
    // Figure out if it was checked or unchecked
    var isChecked = $("#"+btnID).prop('checked');
    var checkedVerb = (isChecked) ? ADL.custom.verbs.checked : ADL.custom.verbs.unchecked;

    var baseActivity = {
        "id": moduleID  + chapter + "/" + pageID + "#" + btnID,
        "definition": {
            "name": {
                "en-US": btnName
            },
            "description": {
                "en-US": "The " + btnName + " radio button from chapter " + chapter + "; page " + pageID
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
    updateLRS(stmt);

}

/* 
 * SCORMy
 */
function courseRegistered() {

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.registered,
        "context": createContext(),
        "object": baseActivity
    };

    // Send statement
    updateLRS(stmt);

}

function courseLaunched() {

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.launched,
        "context": createContext(),
        "object": baseActivity
    };

    // Send launched statement
    updateLRS(stmt);

}

function chapterLaunched(chapter) {
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
    updateLRS(stmt);
}


function courseMastered() {

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.mastered,
        "context": createContext(),
        "object": baseActivity
    };

    // Send statement
    updateLRS(stmt);

}

function courseExited() {

    // statement for launching content
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.exited,
        "context": createContext(),
        "object": baseActivity
    };

    // Send exited statement
    updateLRS(stmt);

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

    // if there is a custom context ID, add it
    if ( typeof customContextID !== "undefined" ) {
        
        var customContext = {
            "id": customContextID,
        };
        
        if(baseContext.contextActivities.grouping !== "undefined"){
            baseContext.contextActivities['grouping'] = customContext;                
        } else {
            baseContext.contextActivities.grouping.push(customContext);
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

    // Handle checkbox clicks -- basic no knowledge of context or checked
    $(":radio").change(function(event) {
        $radio = $(this);
        var btnID = $radio.attr("id");
        var btnName = $radio.siblings("label").text();
        var chapter = $("body").attr("data-chapter");
        var pageID = $.mobile.activePage.attr("id");
        radioButtonClicked(chapter, pageID, btnID, btnName);
    });

});

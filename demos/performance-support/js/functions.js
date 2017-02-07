/* in progress */

// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/ps/"; // trailing slash
var moduleName = "How to Make French Toast xapi-jqm Performance Support Demo";
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
                    "en-US": moduleName + ": " + id 
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

    if(chapter == "05-glossary" && pageID != 'list'){
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

/* set global variable id of video or media */ 
var vidID;

// set the id to the value of the parent div from the onclick event handler
function setVideoID(val) {
    vidID = val;
}

function videoViewed() {
    var chapter = $("body").attr("data-chapter");
    // statement for viewing video or media
    var stmt = {
        "actor": actor,
        "verb": ADL.custom.verbs.viewed,
        "context": createContext(chapter),
        "object": {
            "id" : moduleID + chapter +'/'+vidID,
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast Video: " + vidID + ".",
                },
            "type": mediaType,
            "moreInfo": "http://xapi.adlnet.mobi/demos/ps/media/" + vidID + ".gif",
            }
        }
    };

    // Send viewed statement
    wrapper.sendStatement(stmt);

}

/* Responsive background image - fix vertical when not overflow
call fullscreenFix() if .fullscreen content changes */
function fullscreenFix(){
    var h = $('body').height();
    // set .fullscreen height
    $(".content-b").each(function(i){
        if($(this).innerHeight() <= h){
            $(this).closest(".fullscreen").addClass("not-overflow");
        }
    });
}
$(window).resize(fullscreenFix);
fullscreenFix();

/* resize background images */
function backgroundResize(){
    var windowH = $(window).height();
    $(".background").each(function(i){
        var path = $(this);
        // variables
        var contW = path.width();
        var contH = path.height();
        var imgW = path.attr("data-img-width");
        var imgH = path.attr("data-img-height");
        var ratio = imgW / imgH;
        // overflowing difference
        var diff = parseFloat(path.attr("data-diff"));
        diff = diff ? diff : 0;
        // remaining height to have fullscreen image only on parallax
        var remainingH = 0;
        if(path.hasClass("parallax")){
            var maxH = contH > windowH ? contH : windowH;
            remainingH = windowH - contH;
        }
        // set img values depending on cont
        imgH = contH + remainingH + diff;
        imgW = imgH * ratio;
        // fix when too large
        if(contW > imgW){
            imgW = contW;
            imgH = imgW / ratio;
        }
        //
        path.data("resized-imgW", imgW);
        path.data("resized-imgH", imgH);
        path.css("background-size", imgW + "px " + imgH + "px");
    });
}
$(window).resize(backgroundResize);
$(window).focus(backgroundResize);
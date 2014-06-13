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

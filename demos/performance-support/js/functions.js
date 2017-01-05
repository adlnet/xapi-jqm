/* in progress */


// Generate UUID for unique id requirement in object ids
var generateGUID = (typeof(window.crypto) != 'undefined' && 
                    typeof(window.crypto.getRandomValues) != 'undefined') ?
        function() {
            // If we have a cryptographically secure PRNG, use that
            // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
            var buf = new Uint16Array(8);
            window.crypto.getRandomValues(buf);
            var S4 = function(num) {
                var ret = num.toString(16);
                while(ret.length < 4){
                    ret = "0"+ret;
                }
                return ret;
            };
            return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-"+S4(buf[3])+"-"+S4(buf[4])+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
        }
    
        :
    
        function() {
            // Otherwise, just use Math.random
            // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };
		
var wrapper;
var actor = { "mbox": "mailto:randy.neatrour.ctr@adlnet.gov", "name": 'Neat' };

ADL.launch(function(err,apiData,xAPIWrapper){


        if(err){
            console.log(err);
            ADL.XAPIWrapper.changeConfig({
                endpoint: "https://lrs.adlnet.gov/xapi/",
                user: 'Neat',
                password: 'p356a012'
            });
            wrapper = ADL.XAPIWrapper;
            
            var stmt = new ADL.XAPIStatement(actor,"http://adlnet.gov/expapi/verbs/initialized","http://localhost:8081"+window.location.pathname);

            
            updateLRS(stmt);

        } else {            
            console.log("--- Launch ---");
            lData = apiData;
            wrapper = xAPIWrapper;
            actor = lData.actor;
            console.log(lData.actor);

            var stmt = new ADL.XAPIStatement(actor,"http://adlnet.gov/expapi/verbs/initialized","http://localhost:8081"+window.location.pathname);

            updateLRS(stmt);


        }

    },false);


function updateLRS(stmnt){
    console.log("--- send stmnt ---");
    console.log(stmnt);
    wrapper.sendStatement(stmnt, outputResults);
}

//The callback for the LRS.
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

// // Global Actor
// actor = getActor();

// /* Page Change Logic */

// if ( actor == false ) {
//     checkLoggedIn();
// } else { // silly thing to wrap in an else but I need to restructure the code to handle a missing actor on login page

//     doConfig();
    
//     // handle chapter clicks to send launch statements
//     $( document ).on( "vclick", "a.chapter", function() {
//         $chapter = $(this);
//         var chapter = $chapter.parent("li").attr("id");
//         var name = $chapter.text();
//         chapterLaunched(chapter, name);
//     });

//     // Abstracted page changing logic -- catch-all
//     $( window ).on("pagechange", function(event) {

//         var chapter = $("body").attr("data-chapter");
//         var pageID = $.mobile.activePage.attr("id");
//         var activityID = "http://adlnet.gov/xapi/samples/xapi-jqm/ps/" + chapter + "/" + pageID;

//         var stmt = {
//             "actor": actor,
//             "verb": ADL.verbs.experienced,
//             "context": jobaidContext,
//             "object": {
//                 "id" : activityID,
//                 "objectType": "Activity",
//                 "definition": {
//                     "name": {
//                         "en-US": "How to Make French Toast Chapter: " + chapter + ", page: " + pageID
//                     },
//                     "type": linkType
//                 }
//             }
//         };

//         // Send a statement
//         ADL.XAPIWrapper.sendStatement(stmt);
//         ADL.XAPIWrapper.sendState(jobaidID, actor, "session-state", null, { "info": "reading", "chapter": chapter, "page": pageID });


//     });
// } // end silly else

/* State functions */
function getState() {
    return wrapper.getState(jobaidID, actor, "session-state");
}

// /* Helpers */
// function doConfig() { // sorry
//     // Config.actor = actor;
//     // ADL.XAPIWrapper.changeConfig(Config);
// }

function getPage() {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    return filename;
}

// /* Name, Email, Actor, gets and sets */

// // Actor
// function getActor() {
//     var name = localStorage.getItem("xapi-jqm/name");
//     var email = localStorage.getItem("xapi-jqm/email");
//     if ( name == null || email == null ) {
//         return false;
//     } else {
//         var actor = { "mbox": "mailto:" + email, "name": name };
//         return actor;
//     }
// }
// function setActor(name, email) {
//     setUserName(name);
//     setUserEmail(email);
// }

// // Name
// function getUserName() {
//     return localStorage.getItem("xapi-jqm/name");
// }
// function setUserName(name) {
//     localStorage.setItem("xapi-jqm/name", name);
// }

// // Email
// function getUserEmail() {
//     return localStorage.getItem("xapi-jqm/email");
// }
// function setUserEmail(email) {
//     localStorage.setItem("xapi-jqm/email", email);
// }

// // Destroy all the things
// function clearActor() {
//     localStorage.removeItem("xapi-jqm/name");
//     localStorage.removeItem("xapi-jqm/email");
// }

// /* Login / Logout functions */
// function checkLoggedIn() {
//     // If the actor doesn't exist, send them to the login page
//     if ( getPage() != "00-account.html" ) {
//         userLogin();
//     }
// }

// function userLogin() {
//     // Should get the page root
//     window.location = "chapters/00-account.html#login";
// }

// function userLogout() {
//     jobaidExited();
//     clearActor();
//     window.location = "../"; // lol
// }

// function userRegister(name, email) {
//     // should error check this
//     setActor(name, email);
//     // Set global actor var so other functions can use it
//     actor = getActor();
//     jobaidRegistered();
//     // Setup chapters-complete
//     ADL.XAPIWrapper.sendState(jobaidID, actor, "chapters-completed", null, { "chapters": [] });
// }

// // jqm's submission process is the reason I'm doing it this way
// function userRegisterSubmit() {
//     if ( $("#reg-name").val() != "" && $("#reg-email").val() != "" ) {
//         userRegister($("#reg-name").val(), $("#reg-email").val());
//         jobaidLaunched();
//         window.location = "../index.html"
//     }
// }

// /* SCORMy
//  * verbose for now until login logic / config is cleaner
//  */
// function jobaidRegistered() {
    
//     doConfig();

//     // statement for launching content
//     var stmt = {
//         "actor": actor,
//         "verb": ADL.verbs.registered,
//         "context": jobaidContext,
//         "object": {
//             "id": "http://adlnet.gov/xapi/samples/xapi-jqm/ps/registered",
//             "objectType": "Activity",
//             "definition": {
//                 "name": {
//                     "en-US": "How to Make French Toast Job Aid"
//                 },
//                 "type": linkType
//             }
//         }
//     };

//     // Send registered statement
//     updateLRS(stmt);

// }

// function jobaidLaunched() {
    
//     doConfig();

//     // statement for launching content
//     var stmt = {
//         "actor": actor,
//         "verb": ADL.verbs.launched,
//         "context": jobaidContext,
//         "object": {
//             "id": "http://adlnet.gov/xapi/samples/xapi-jqm/ps/launched",
//             "objectType": "Activity",
//             "definition": {
//                 "name": {
//                     "en-US": "How to Make French Toast Job Aid"
//                 },
//                 "type": linkType
//             }
//         }
//     };

//     // Send launched statement
//     updateLRS(stmt);

// }

// function jobaidExited() {

//     doConfig();

//     // statement for launching content
//     var stmt = {
//         "actor": actor,
//         "verb": ADL.verbs.exited,
//         "context": jobaidContext,
//         "object": {
//             "id": "http://adlnet.gov/xapi/samples/xapi-jqm/ps/exited",
//             "objectType": "Activity",
//             "definition": {
//                 "name": {
//                     "en-US": "How to Make French Toast xapi-jqm"
//                 },
//                 "type": linkType
//             }
//         }
//     };

//     // Send exited statement
//     updateLRS(stmt);

// }

/* set global variable id of video or media */ 
var vidID;

// set the id to the value of the parent div from the onclick event handler
function setVideoID(val) {
	vidID = val;
}

function videoViewed() {
    
    // doConfig();
	//alert(vidID);
    // statement for viewing video or media
    var stmt = {
        "actor": actor,
        "verb": ADL.verbs.viewed,
        "object": {
            "id": "http://xapi.adlnet.mobi/demos/ps/media/" + generateGUID() + "",
            "objectType": "Activity",
            "definition": {
                "name": {
                    "en-US": "How to Make French Toast Video: " + vidID + ".",
                },
            "moreInfo": "http://xapi.adlnet.mobi/demos/ps/media/" + vidID + ".gif",
            }
        }
    };

    // Send viewed statement
    updateLRS(stmt);

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
backgroundResize();

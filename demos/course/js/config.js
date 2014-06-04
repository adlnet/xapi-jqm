//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}
// these have been deprecated by getUserName, getUserEmail, and getActor functions
/*
var email = "tyler.mulligan.ctr@adlnet.gov";
var username = "French Toaster";
var actor = { "mbox": "mailto:" + email, "name": username };
*/
Config.endpoint = "https://lrs.adlnet.gov/xapi/";
//Config.endpoint = "http://10.100.21.46:8080/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

//Config.actor = actor;

// "global" variables
var courseID = "http://adlnet.gov/xapi/samples/xapi-jqm";
var quizID = "http://adlnet.gov/xapi/samples/xapi-jqm/quiz/"

var courseType = "http://adlnet.gov/xapi/activities/course";
var linkType = "http://adlnet.gov/xapi/activities/link";
var quizType = "http://adlnet.gov/xapi/activities/quiz";

var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];
var TUTORIAL_VIDEO_URL = "http://www.youtube-nocookie.com/embed/vPrtNzvDS5M?rel=0";
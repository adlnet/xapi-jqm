//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}

Config.endpoint = "https://lrs.adlnet.gov/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/course/"; // trailing slash
var courseType = "http://adlnet.gov/xapi/activities/course";

var baseActivity = {
    "id": moduleID,
    "definition": {
        "name": {
            "en-US": "xAPI for jQuery Mobile French Toast Demo"
        },
        "description": {
            "en-US": "A sample HTML5 mobile app with xAPI tracking that teaches you how to make french toast."
        }
    },
    "objectType": "Activity"
};

var quizID = moduleID + "chapters/05-quiz#quiz"
var quizActivity = {
    "id": quizID,
    "definition": {
        "name": {
            "en-US": "xAPI for jQuery Mobile French Toast Demo quiz"
        }
    },
    "objectType": "Activity"
};

var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];
var TUTORIAL_VIDEO_URL = "http://www.youtube-nocookie.com/embed/vPrtNzvDS5M?rel=0";

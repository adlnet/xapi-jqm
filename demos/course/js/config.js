//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}

// Config.endpoint = "https://lrs.adlnet.gov/xapi/";
// Config.user = "jqm";
// Config.password = "xapijqm";
Config.endpoint = "http://localhost:8000/xapi/";
Config.user = "lou";
Config.password = "password";
// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/";
var courseType = "http://adlnet.gov/xapi/activities/course";

var baseActivity = {
    "id": moduleID,
    "definition": {
        "name": {
            "en-US": "xAPI for jQuery French Toast Demo"
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
            "en-US": "xAPI for jQuery French Toast Demo quiz"
        }
    },
    "objectType": "Activity"
};

// simplify the repetition of this context for course statements
var courseContext = {
    "contextActivities": {
        "parent": [
            baseActivity
        ]
    }
};

// simplify the repetition of this context for video statements
var videoContext = {
    "contextActivities": {
        "parent": [
            baseActivity,
            {
                "id": moduleID + "chapters/04-video",
                "definition": {
                    "name": {
                        "en-US": "xAPI for jQuery Mobile Demo - video chapter"
                    },
                    "description": {
                        "en-US": "A chapter within the xAPI frech toast mobile demo that contains a video showing how to make french toast."
                    }
                },
                "objectType": "Activity"
            },

        ]
    }
};

// simplify the repetition of this context for quiz statements
var quizContext = {
    "contextActivities": {
        "parent": [
            baseActivity,
            {
                "id": moduleID + "chapters/05-quiz",
                "definition": {
                    "name": {
                        "en-US": "How to Make French Toast Chapter: 05, page: quiz"
                    },
                },
                "objectType": "Activity"
            }
        ]
    }
};

// simplify the repetition of this context for quiz question statements
var quizQuestionContext = {
    "contextActivities": {
        "parent": [
            baseActivity,
            {
                "id": moduleID + "chapters/05-quiz",
                "definition": {
                    "name": {
                        "en-US": "How to Make French Toast Chapter: 05, page: quiz"
                    },
                },
                "objectType": "Activity"
            },
            quizActivity            
        ]
    }
};


var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];
var TUTORIAL_VIDEO_URL = "http://www.youtube-nocookie.com/embed/vPrtNzvDS5M?rel=0";

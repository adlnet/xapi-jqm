//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}
Config.endpoint = "https://lrs.adlnet.gov/xapi/";
//Config.endpoint = "http://10.100.21.46:8080/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

//Config.actor = actor;

// "global" variables
var jobaidID = "http://adlnet.gov/xapi/samples/xapi-jqm/ps/";
var jobaidType = "http://adlnet.gov/xapi/activities/interaction";
var linkType = "http://adlnet.gov/xapi/activities/link";
var mediaType = "http://adlnet.gov/xapi/activities/media";

// simplify the repetition of this context for performance support statements
var jobaidContext = {
    "contextActivities": {
        "parent": [
            {
                "id": jobaidID,
                "definition": {
                    "name": {
                        "en-US": "xAPI Performance Support Demo"
                    },
                    "description": {
                        "en-US": "A sample HTML5 app with xAPI tracking using how to make french toast as an example job aid."
                    }
                },
                "objectType": "Activity"
            }
        ]
    }
};


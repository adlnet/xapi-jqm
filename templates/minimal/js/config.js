//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}

Config.endpoint = "https://lrs.adlnet.gov/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/minimal/"; // trailing slash

var baseActivity = {
    "id": moduleID,
    "definition": {
        "name": {
            "en-US": "Minimal starter xapi-jqm template"
        },
        "description": {
            "en-US": "Great starting point with a blank slate. Read more about templates to learn how to integrate and track."
        }
    },
    "objectType": "Activity"
};

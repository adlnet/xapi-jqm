//globals: equal, responseText, statement, ok, deepEqual, QUnit, module, asyncTest, Util, start, golfStatements, console
/*jslint bitwise: true, browser: true, plusplus: true, maxerr: 50, indent: 4 */
function Config() {
	"use strict";
}

Config.endpoint = "https://lrs.adlnet.gov/xapi/";
Config.user = "jqm";
Config.password = "xapijqm";

// "global" variables
var moduleID = "http://adlnet.gov/xapi/samples/xapi-jqm/minimal-greenish/"; // trailing slash
var moduleName = "Minimal Greenish starter xapi-jqm template";

var baseActivity = {
    "id": moduleID,
    "definition": {
        "name": {
            "en-US": moduleName
        },
        "description": {
            "en-US": "Great starting point with a blank slate. Read more about templates to learn how to integrate and track."
        }
    },
    "objectType": "Activity"
};

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
Config.user = "jqm";
Config.password = "xapijqm";
//Config.actor = actor;

// "global" variables
var courseID = "http://adlnet.gov/xapi/samples/xapi-jqm";
var courseType = "http://adlnet.gov/xapi/activities/course";

var linkType = "http://adlnet.gov/xapi/activities/link";

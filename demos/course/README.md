xapi-jqm based course demo
--------------------------

This is a fully functional course that teaches a learner about the process of making french toast and quizes their knowledge. It uses jQuery Mobile for layout and interactions, combined with xapiwrapper.js to send, and retrieve data from a Learning Record Store (LRS).

The [functions.js](js/functions.js) file does all the heavy lifting by pulling values from the HTML to build statements.

You can find isolated examples for specific functionality in the demos/templates directory.

### Setup

This course was designed to run both on a web server or a local file system. If you're unfamiliar with using git to clone the repository, you can [download a zip file](https://github.com/adlnet/xapi-jqm/zipball/master) with the latest changes.

#### Config

The default credentials are setup to work with and account on the ADL LRS in the [config.js](js/config.js) file. You can edit this file to point to your own LRS and/or user.

### Statements Built from Attributes in HTML

#### An Overview of a Statement

```javascript
var stmt = { "actor": getActor(),
    "verb": ADL.verbs.experienced,
    "context": {
        "contextActivities": {
            "parent": [
                {
                    "id": courseID,
                    "definition": {
                        "name": {
                            "en-US": "xAPI for jQuery Demo"
                        },
                        "description": {
                            "en-US": "A sample HTML5 mobile app with xAPI tracking."
                        }
                    },
                    "objectType": "Activity"
                }
            ]
        }
    },
    "object": {
        "id" : activityID,
        "objectType": "Activity",
        "definition": {
            "name": {
                "en-US": "xAPI jQuery Mobile " + chapter + " " + pagename
            },
            "type": linkType
        }
    }
};
```

#### The HTML Attributes Used to Build the Statements

The ```data-chapter``` attribute defines what chapter you're in

```html
<body data-chapter="steps">
```

Pages in jQuery Mobile (jQM) are defined as divs with a ```data-role="page"```

```html
<div data-role="page" id="p2">
  <h2>My Content</h2>
</div>
```

### The State API


### Functions and "Global Variables"


*in progress*

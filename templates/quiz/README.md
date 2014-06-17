quiz
----

Quizzes can be built from three types of inputs:

- Checklist (multiple choice selection)
- Radio (single choice selection)
- Text Box (string comparison)

The HTML is consists of jQuery Mobile Widgets, a ```gradeQuestion()``` function is triggered in the [quiz-functions.js](js/quiz-functions.js) file in an ```onclick``` attribute of the next button.

Answers for quizzes are defined in by an array ```CORRECT_QUIZ_ANSWERS```. The example below has answers that correspond with the input types listed above: checklist, radio, textbox.


### Configuration

Most configuration is handled in the [quiz-functions.js](js/quiz-functions.js) file.

The quiz should have a unique ID that identifies the statements in the LRS, in this example, the moduleID is pulled from the [config.js](js/config.js) and we append a quiz specific string to it:

```js
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
```

As mentioned above, the answers are defined in a javascript array:

```js
var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];
```


### Widgets

Lets dig a little deeper into these types with examples from the template.


#### Checkboxes (multiple choice selection)

**HTML**:

```html
    <div data-role="content">    
        <div class="infoblock">
            <h2>1. What ingredients are required to make french toast?</h2>
        </div>

        <form id="p1_form">
            <fieldset data-role="controlgroup">
                <input type="checkbox" name="quiz-q1[]" id="q1-chocolate"><label for="q1-chocolate">Chocolate</label>
                <input type="checkbox" name="quiz-q1[]" id="q1-bread"><label for="q1-bread">Bread</label>
                <input type="checkbox" name="quiz-q1[]" id="q1-eggs"><label for="q1-eggs">Eggs</label>
                <input type="checkbox" name="quiz-q1[]" id="q1-hose"><label for="q1-hose">Fire Hose</label>
                <input type="checkbox" name="quiz-q1[]" id="q1-rice"><label for="q1-rice">Rice</label>
                <input type="checkbox" name="quiz-q1[]" id="q1-butter"><label for="q1-butter">Butter / Oil or Non-stick Spray</label>
            </fieldset>
        </form>

    </div><!-- /content -->
    
    <div data-role="footer" data-theme="b" data-position="fixed">
        <div data-role="navbar">
            <ul>
                <li><a href="../index.html#toc" data-theme="b" data-rel="back" data-icon="carat-l" data-iconpos="top" data-transition="slide" data-direction="reverse" data-ajax="false">Previous</a></li>
                <li><a onclick="gradeQuestion()" href="#p2" id="next" data-theme="b" data-icon="carat-r" data-iconpos="top" data-transition="slide" data-ajax="false">Next</a></li>
            </ul>
        </div><!-- /navbar -->
    </div><!-- /footer -->
```

**Javascript**:

Make note of the ```onclick``` that is firing the javascript function to compare the user's answers to the ```CORRECT_QUIZ_ANSWERS``` array.

The answer array for this first question, has an array of ids that correspond with the index of the item in the list, ```[2,3,6]``` -- which translates into "bread, eggs, and butter" being the 2nd, 3rd and 6th list items.


#### Radio Selection (single choice selection)

**HTML**:

```html
    <div data-role="content">    
        <div class="infoblock">
            <h2>2. Which cooking tool is required to make french toast?</h2>
        </div>

        <form id="p2_form">
            <fieldset data-role="controlgroup">
                <input type="radio" name="quiz-q2[]" id="q2-pot" value="A Pot"><label for="q2-pot">A Pot</label>
                <input type="radio" name="quiz-q2[]" id="q2-toaster" value="A Toaster"><label for="q2-toaster">A Toaster</label>
                <input type="radio" name="quiz-q2[]" id="q2-oven" value="An Oven"><label for="q2-oven">An Oven</label>
                <input type="radio" name="quiz-q2[]" id="q2-pan" value="A Pan or an electric skillet"><label for="q2-pan">A Pan or an electric skillet</label>
                <input type="radio" name="quiz-q2[]" id="q2-blender" value="A Blender"><label for="q2-blender">A Blender</label>
            </fieldset>
        </form>

    </div><!-- /content -->
    
    <div data-role="footer" data-theme="b" data-position="fixed">
        <div data-role="navbar">
            <ul>
                <li><a href="#p1" data-theme="b" data-rel="back" data-icon="carat-l" data-iconpos="top" data-transition="slide" data-direction="reverse" data-ajax="false">Previous</a></li>
                <li><a onclick="gradeQuestion()" href="#p3" id="next" data-theme="b" data-icon="carat-r" data-iconpos="top" data-transition="slide" data-ajax="false">Next</a></li>
            </ul>
        </div><!-- /navbar -->
    </div><!-- /footer -->
```

**Javascript**:

Referencing the ```CORRECT_QUIZ_ANSWERS``` array, we'll notice the second item is ```[4]``` which means the 4th list item, "pan" as the correct answer.


#### Text Box (string comparison)

**HTML**:

```html
    <div data-role="content">    
        <div class="infoblock">
            <h2>3. What is the main ingredient of french toast?</h2>
        </div>

        <form id="p3_form">
                <input type="text" data-clear-btn="true" name="quiz-q3[]" id="q3-text">
        </form>

    </div><!-- /content -->
    
    <div data-role="footer" data-theme="b" data-position="fixed">
        <div data-role="navbar">
            <ul>
                <li><a href="#p2" data-theme="b" data-rel="back" data-icon="carat-l" data-iconpos="top" data-transition="slide" data-direction="reverse" data-ajax="false">Previous</a></li>
                <li><a onclick="gradeQuestion();makeAssessment()" href="#results" id="results" data-theme="b" data-icon="carat-r" data-iconpos="top" data-transition="slide" data-ajax="false">Get Results</a></li>
            </ul>
        </div><!-- /navbar -->
    </div><!-- /footer -->
```

**Javascript**:

Referencing the ```CORRECT_QUIZ_ANSWERS``` array, ```"bread"``` is the defined string, which is case-insensitive; "Bread" would also be a valid answer to the question.

As the last question in the quiz, one other function is called in the ```onclick``` of the "next" or "get results" button, ```makeAssessment()``` which will calculate a score based on the number of questions answered correctly.

Optionally, this function can also fire ```courseMastered()```. In this template, "mastered" is defined by having completed all the steps and scoring 100% on the quiz. This also displays a french toast master badge. This function can be customized to fit the needs of what "mastered" means in the context of your app.

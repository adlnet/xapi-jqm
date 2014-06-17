quiz
----

Quizzes can be built from three types of inputs:

- Checklist (multiple choice)
- Radio (single choice)
- Text Box (string comparison)

The HTML is consists of jQuery Mobile Widgets, a ```gradeQuestion()``` function is triggered in the [quiz-functions.js](js/quiz-functions.js) file in an ```onclick``` attribute of the next button.

Answers for quizzes are defined in by an array ```CORRECT_QUIZ_ANSWERS```. The example below has answers that correspond with the input types listed above: checklist, radio, textbox.

```js
var CORRECT_QUIZ_ANSWERS = [ [2,3,6], [4], "bread" ];
```

Lets dig a little deeper into these types with examples from the template.


### Checkboxes

HTML:

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

Make note of the ```onclick``` that is firing the javascript function to compare the user's answers to the ```CORRECT_QUIZ_ANSWERS``` array.

The answer array for this first question, has an array of ids that correspond with the index of the item in the list, ```[2,3,6]``` -- which translates into "bread, eggs, and butter" being the 2nd, 3rd and 6th list items.

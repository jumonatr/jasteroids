/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿//DISCLAIMER: I am not a javascript (or web in general) programmer, the following may be considered horrendous by many.

//Usage: Write functions starting with Test_ in global scope or in scopes passed into the main SimpleTest.Execute
//to have it run when opening test.html
//dont forget to add script references to tested javascript in test.html
/* ### Example ###

//write a function like this in any file
//add said file to test.html with <script src="myFile.js" type="text/javascript"></script>
//function will automatically be executed when opening test.html
//and results and callstacks will be displayed in pages (tested in chrome and firefox)

function Test_MyTest()
{
    //tests whether totest equals 1
    var totest = 1;
    SimpleTest.Equals(1, totest);

    //tests whether totest is identical to [1, 2, 4]
    totest = [1, 2, 4];
    SimpleTest.Equals([1, 2, 4], totest);
}

*/

// Licence at end


SimpleTest = {};
SimpleTest.ChecksDone = 0;

//function used to compare values for equality
//this function is the basis for testing, use it EVERYWHERE! ;)
SimpleTest.Equals = function (desired, received, msg)
{
    SimpleTest.ChecksDone++;

    if (desired instanceof Array && received instanceof Array)
    {
        if (desired.length == received.length)
        {
            for(var i = 0; i < desired.length; ++i)
                SimpleTest.Equals(desired[i], received[i], " " + ("with index " + String(i) + (msg ? " " + msg : "")).trim());

            //if we get passed the recursion it means the arrays are equal
            return true;
        }
    }

    if (typeof desired == "number" && typeof received == "number")
    {
        //check up to 10 decimal places
        desired = (Math.round(desired * 10000000000)/10000000000);
        received = (Math.round(received * 10000000000)/10000000000);
    }

    if (desired == received)
        return true;

    throw new Error( "Was expecting " + MakeObvious(desired) + " of type " + SimpleTest.TakeUntil(desired.constructor.toString(), '{') +
                     " but received " + MakeObvious(received) + " of type " + SimpleTest.TakeUntil(received.constructor.toString(), '{') +
                     (msg ? msg : ""));

    function MakeObvious(string)
    {
        return ["<span class=\"value\">", "</span>"].join(String(string));
    }
}

/*
description: Main Function Called onload in test.html
params: the scopes to test + window scope
*/

SimpleTest.Execute = function ()
{
    SimpleTest.ChecksDone = 0;

    arguments[arguments.length] = window;
    arguments.length++;

    var succeeded = 0;
    var failed = 0;

    for(var scopeItr = 0; scopeItr < arguments.length; ++scopeItr)
    {
        var scope = arguments[scopeItr];
        for(var key in scope)
        {
            if (key.indexOf("Test_") != 0)
                continue;

            var error = undefined;
            var dt = new Date().getTime();
            try
            {
                scope[key]();
                dt = new Date().getTime() - dt;
                succeeded++;
            }
            catch(e)
            {
                error = e;
                failed++;
            }

            if (error)
            {
                SimpleTest.Output(false, WrapTest(key, dt), WrapError(error.toString()), WrapStack( StackToArray(error.stack) ) );
            }
            else
            {
                SimpleTest.Output(true, WrapTest(key, dt));
            }
        }
    }

    var result = document.getElementById("result");
    result.className  = (failed == 0 ? "success" : "failure");
    result.innerHTML = "Passed " + succeeded + " out of " + (succeeded + failed) + " tests. With " + SimpleTest.ChecksDone + " checks.";

    function StackToArray(stack)
    {
        var first = stack.split('\n');
        var second = [];
        for(var i = 0; i < first.length; ++i)
        {
            var otherSplit = first[i].split(' at ');
            for(var j = 0; j < otherSplit.length; ++j)
            {
                var trace = otherSplit[j].trim();
                if (trace.length > 0)
                    second.push(trace);
            }
        }

        return second.slice(1);
    }

    function WrapTest(testName, dt)
    {
        return CreateElement("div", "test", testName + " ( " + dt + " ms )");
    }

    function WrapError(errorString)
    {
        return CreateElement("div", "error", errorString);
    }

    function WrapStack(stack)
    {
        var stackList = CreateElement("ol", "stack");
        for(var i = 0; i < stack.length; ++i)
        {
            stackList.appendChild( CreateElement("li", "trace", stack[i]) );
        }
        return stackList;
    }
}

//Helper functions

SimpleTest.TakeUntil = function(string, character)
{
    return string.split(character)[0].trim();
}

SimpleTest.Output = function(passed)
{
    var outputElement = document.getElementById("output");
    var listItem = CreateListItem(passed);
    outputElement.appendChild(listItem);

    for(var i = 1; i < arguments.length; ++i)
        listItem.appendChild(arguments[i]);

    function CreateListItem(success)
    {
        return CreateElement("li", success ? "success" : "failure");
    }
}

function CreateElement(type, classname, innerHtml)
{
    var element = document.createElement(type);
    if (classname)
        element.className = classname;

    if (innerHtml)
        element.innerHTML = innerHtml;

    return element;
}


/*
Copyright (C) 2012 Julien Monat-Rodier

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

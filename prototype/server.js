var express = require('express');
var app = express();
//THIS REQUIRES "npm install jquery + jsdom"
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

//Variables
var url1



app.get("/Join_Host_Game.html", function(req, res) {
    url1 = createURL()
    console.log(url1)
    getQuestions();
})

function getQuestions() {
    console.log("Loading data from JSON source...")
    $.ajax({
        type: "GET",
        url: url1,
        success: function(result) {
            console.log("Response Code: " + result.response_code)
            console.log(result)
            if (result.response_code == 0) {
                response = result.results;
                console.log("Loaded")
                qCount = -1;
            }
        }
    })
    //console.log(result.results);
}

function createURL() {
    console.log("HERE")
    var url1 = "https://opentdb.com/api.php"
    var selectedAmount = $("#amount").children("option:selected").val();
    console.log(selectedAmount)
    globAmount = selectedAmount;
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    console.log(selectedCat)
    console.log(selectedDiff)
    var amount = "?amount=" + selectedAmount;
    url1 = url1 + amount;
    if (selectedCat !== 0) {
        var category = "&category=" + selectedCat;
        url1 = url1 + category
    }
    var difficulty = "&difficulty=" + selectedDiff;
    url1 = url1 + difficulty;
    url1 = url1 + "&type=multiple";
    console.log(url1)
    return url1;
}

app.use(express.static('public'))
app.listen(8080); 
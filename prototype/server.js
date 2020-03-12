var express = require('express');
var app = express();
//THIS REQUIRES "npm install jQuery"
var $ = require('jQuery');
//THIS REQUIRES "npm install jsdom"
var jsdom = require('jsdom')

app.get("/Join_Host_Game.html", function(req, res) {
    getQuestions();
})

function getQuestions() {
    console.log("Loading data from JSON source...")
    url1 = createURL()
    $.ajax({
        type: "GET",
        url: url1,
        success: function(result) {
            console.log("Response Code: " + result.response_code)
            if (result.response_code == 0) {
                response = result.results;
                console.log("Loaded")
                qCount = -1;
            }
        }
    })
    console.log(result.results);
}

function createURL() {
    var url1 = "https://opentdb.com/api.php"
    var selectedAmount = $("#amount").children("option:selected").val();
    globAmount = selectedAmount;
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var amount = "?amount=" + selectedAmount;
    url1 = url1 + amount;
    if (selectedCat !== 0) {
        var category = "&category=" + selectedCat;
        url1 = url1 + category
    }
    var difficulty = "&difficulty=" + selectedDiff;
    url1 = url1 + difficulty;
    url1 = url1 + "&type=multiple";
    return url1;
}

app.use(express.static('public'))
app.listen(8080); 
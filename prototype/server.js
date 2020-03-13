var express = require('express');
var app = express();
//THIS REQUIRES "npm install jquery, npm install jsdom, npm install body-parser, npm install socket.io"
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);
var bodyParser = require('body-parser')
app.use(bodyParser.json());


const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', () => { console.log("connected") });
server.listen(8080);

//Global Variables
var response;
var qCounter = 0;

app.post('/Join_Host_Game.html', function (req, res) {
    console.log("we did it reddit")
    url1 = createURL(req.body.AMOUNT, req.body.DIFFICULTY, req.body.CATEGORY)
    QAPIRESPONSE = getQuestions(url1);
    res.send(QAPIRESPONSE[qCounter])
})

function getQuestions(url1) {
    console.log("Loading The Q's & the A's")
    $.ajax({
        type: "GET",
        url: url1,
        success: function(result) {
            console.log("Response Code: " + result.response_code)
            if (result.response_code == 0) {
                response = result.results;
                console.log("Loaded")
            }
        }
    })
    return response
}

function createURL(amount, difficulty, category) {
    var url1 = "https://opentdb.com/api.php"
    var amount = "?amount=" + amount;
    url1 = url1 + amount;
    if (category !== 0) {
        var categoryUrl = "&category=" + category;
        url1 = url1 + categoryUrl
    }
    var difficultyUrl = "&difficulty=" + difficulty;
    url1 = url1 + difficultyUrl;
    url1 = url1 + "&type=multiple";
    return url1;
}

/*
function createURL() {
    console.log("HERE")
    var url1 = "https://opentdb.com/api.php"
    var selectedAmount = $("#amount").children("option:selected").val();
    console.log($("#amount"))
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
*/

app.use(express.static('public'))
//app.listen(8080); 
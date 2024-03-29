var express = require('express');
//THIS REQUIRES "npm install jquery, npm install jsdom, npm install body-parser, npm install socket.io"
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);
var bodyParser = require('body-parser')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//Global Variables
var response;
var qCounter = 0;
let hosts = new Set();
var questions;
var ROOMCODE;

app.use(bodyParser.json());
app.use(express.static('public'))

server.listen(8080);

io.on('connection', function (socket) {
    socket.emit('getSelects', { Host: 'Becoming Host' });
    socket.on('sendSelects', function (data) {
        var selects = JSON.parse(data.selections);
        console.log("SERVER ID" + socket.id)
        hosts.add(selects.ROOMCODE.toString());
        ROOMCODE = selects.ROOMCODE.toString();
        url1 = createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)
        questions = getQuestions(url1);
        console.log(questions)
        socket.join(selects.ROOMCODE)
        console.log("pre emitted")
        io.sockets.in(ROOMCODE.toString()).emit('joinedGame')
        console.log(selects.ROOMCODE)
    });
    socket.emit('joinGame', { Client: 'joining' });
    socket.on('sendRoomCode', function (data) {
        var clientRoomCode = JSON.parse(data.roomCode).toString();
        console.log(clientRoomCode)
        if (hosts.has(clientRoomCode)) {
            console.log("connecting")
            socket.join(clientRoomCode);
            io.sockets.in(ROOMCODE.toString()).emit('joinedGame')
            console.log(clientRoomCode)
            console.log(io.sockets.adapter.rooms)
        }
        else {
            console.log("no such host exists")
        }
    });
    socket.on('joinedGame', function () {
        console.log("Whats up, we joined here")
    })
    socket.on('begin', function (data) {
        console.log(data);
        console.log("Sending question")
        console.log(questions[qCounter])
        console.log(ROOMCODE.toString())
        io.sockets.in(ROOMCODE.toString()).emit('questionSent', questions[qCounter])
        qCounter += 1;
        console.log("Sent question")
    })
});

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

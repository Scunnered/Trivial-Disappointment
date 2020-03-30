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

//ADDED THIS FOR MONGODB. CHECK FOR NECCESITY
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/coloured-animals";

//Global Variables
var response;
var qCounter = 0;
let hosts = new Set();
var rooms = new Map();
var questions;
var ROOMCODE;
var currQAnswer;

app.use(bodyParser.json());
app.use(express.static('public'))

server.listen(8080);

io.on('connection', function (socket) {
    socket.emit('getSelects', { Host: 'Becoming Host' });
    socket.on('sendSelects', function (data) {
        var selects = JSON.parse(data.selections);
        console.log("SERVER ID" + socket.id)
        hosts.add(selects.ROOMCODE.toString());
        rooms.set(selects.ROOMCODE.toString(), [socket.id])
        ROOMCODE = selects.ROOMCODE.toString();
        url1 = createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)
        questions = getQuestions(url1);
        console.log(questions)
    });
    socket.emit('joinGame', { Client: 'joining' });
    socket.on('sendRoomCode', function (data) {
        var clientRoomCode = JSON.parse(data.roomCode).toString();
        console.log(clientRoomCode)
        if (hosts.has(clientRoomCode)) {
            console.log("connecting")
            console.log("Before!!\n" + rooms)
            users = rooms.get(clientRoomCode.toString())
            users.push(socket.id)
            console.log(users)
            rooms.set(clientRoomCode.toString(), users)
            console.log("After!!\n" + rooms)
        }
        else {
            console.log("no such host exists")
        }
    });
    socket.on('begin', function (data) {
        console.log(data);
        console.log("Sending question")
        console.log(questions[qCounter])
        console.log(ROOMCODE.toString())
        sendQuestion(questions[qCounter], ROOMCODE)
        qCounter += 1;
        console.log("Sent question")
    })
    socket.on('answer', function (data) {
        console.log("Data given: " + data.answer)
        console.log("Server data given: " + currQAnswer)
        if (data.answer !== currQAnswer) {
            users = rooms.get(ROOMCODE)
            updatedUsers = removeFromArray(users, socket.id)
            rooms.set(ROOMCODE, updatedUsers)
            io.to(socket.id).emit("loseGame");
        }
    })
});

function sendQuestion(question, roomCode) {
    users = rooms.get(roomCode)
    currQAnswer = question.correct_answer;
    for (user in users) {
        console.log("Sending to: " + users[user])
        io.to(users[user]).emit('questionSent', question)
    }
}

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

function removeFromArray(array1, toRemove) {
    var retArray = [];
    console.log("To Remove: " + toRemove)
    for (item in array1) {
        if (array1[item] != toRemove) {
            retArray.push(array1[item]);
        }
    }
    return retArray
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
    return url1;
}

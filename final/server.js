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

MongoClient.connect(url, function(err, database){
    if(err) throw err;
    db = database;
});

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
    socket.emit('joinGame', { Client: 'joining', username: generateUsername() });
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

//This function generates & returns a username, and puts it in the alreadyUsed array to avoid duplicates.
function generateUsername(){
    db.collection('colours').find().toArray(function(err, result1) {
        if (err) throw err;
        db.collection('animals').find().toArray(function(err, result2) {
            if (err) throw err;
            //Nested find().toArray() because of the use of two collections.

            do{
                //initializes output to be returned later & boolean of wether generated username is a duplicate
                var output = "";
                var used = false;

                //adds random colour & name to output, thus making the username
                output += result1[Math.floor(Math.random() * result1.length)].colour;
                output += result2[Math.floor(Math.random() * result2.length)].name;
            
                //conpares it to each username already generated, and if it already exits, repeates the while loop
                for(var i=0;i<alreadyUsed.length;i++){
                    if(alreadyUsed[i]===output){
                        used = true;
                    }
                }
            }
            while(used) //This only repeats if there is a duplicate

            //adds non-duplicate to the array of already used usernames
            alreadyUsed.push(output)
        });
    });

    //returns the just now added username
    return alreadyUsed[alreadyUsed.length-1];
}

function resetUsername(){
    //empties already used array to allow new game to have new usernames
    alreadyUsed.splice(0, alreadyUsed.length)
}

var express = require('express');
//THIS REQUIRES "npm install jquery, npm install jsdom, npm install body-parser, npm install socket.io, npm install mongodb"
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

//this array contains all the usernames already generated, to avoid duplicates
var alreadyUsed = [];
//contains the players
var leaderboard = [];

//Global Variables
var response;
var qCounter = 0;
var rooms = new Map();
var hosts = new Set();
var questions;
var ROOMCODE;
var currQAnswer;

//Game logic vars
var qTotal; //total number of q
var delay= 15; //delay for the timers
var fCorrect= true; //var used to check who was first to answer correctly
var prevQwinner= null;
var timeLeft;
var countdown; //initialised for future clearInterval from outside timer
var hostSocket;

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
        rooms.set(selects.ROOMCODE.toString(), [[socket.id, "host"]])
        ROOMCODE = selects.ROOMCODE.toString();
        hosts.add(ROOMCODE)
        hostSocket = socket;
        url1 = createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)
        questions = getQuestions(url1);
        console.log(questions)
        qTotal= selects.AMOUNT;
        console.log("NUMBER OF QUESTIONS: "+qTotal)
    });
    socket.on('sendRoomCode', function (data) {
        var clientRoomCode = JSON.parse(data.roomCode).toString();
        var user = generateUsername();
        socket.emit('joinGame', { Client: 'joining', username: user});
        console.log(clientRoomCode)
        if (hosts.has(clientRoomCode)) {
            console.log("connecting")
            console.log("Before!!\n" + rooms)
            users = rooms.get(clientRoomCode.toString())
            users.push([socket.id, user])
            leaderboard.push(user)
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
        
        console.log("Sent question & started timer")

        timeLeft= delay+1;
        countdown= setInterval(function(){
            timeLeft--;
            console.log(timeLeft)
            
            //if timer<=0 and it isnt the last question then reset timer and boolean variables + send next question to users
            if(timeLeft <= 0 && qCounter+1<qTotal){
                fCorrect= true;
            
                timeLeft= delay+1;
                
                qCounter++
                sendQuestion(questions[qCounter], ROOMCODE)
                console.log("Sent next question")
                
            }
            //if timer<=0 and its the last question then timer=0 and stop timer
            else if(timeLeft <= 0 && qCounter+1==qTotal){
                clearInterval(countdown)
                console.log("Gameover for: "+ROOMCODE+" !")
            }
        },1000);

    })
    socket.on('answer', function (data) {
        console.log("Data given: " + data.answer)
        console.log("Server data given: " + currQAnswer)

        /*
        if (data.answer !== currQAnswer) {
            users = rooms.get(ROOMCODE)
            updatedUsers = removeFrom2DArray(users, socket.id)
            for (item in users) {
                if(users[item][0] == socket.id){
                    leaderboard = removeFromArray(leaderboard, users[item][1])
                }
            }
            console.log(leaderboard)
            rooms.set(ROOMCODE, updatedUsers)
            io.to(socket.id).emit("loseGame");
        }
        */

        //if answered incorrectly, run checkForCorrect(socket) at the end of timer
        console.log("qCounter: " + qCounter + "\nqTotal: " + qTotal)
        console.log("fCorrect: " + fCorrect)
        if(data.answer !== currQAnswer) {
            setTimeout(function(){checkForCorrect(socket)},(timeLeft*1000)-500)  //last change made
        }
        //if first to answer correctly (before last question) then set to previous Q winner
        if(data.answer === currQAnswer && qCounter+1<qTotal && fCorrect=== true) {
            fCorrect=false;
            prevQwinner= socket.id;
        }
        //if first to answer correctly at last question then win
        if (data.answer==currQAnswer && qCounter+1==qTotal && fCorrect==true) {
            fCorrect=false
            io.to(socket.id).emit("winGame");

            users = rooms.get(ROOMCODE)
            if(users.length===1){
                removeFromGame(hostSocket,false)
            }
            
        }
        
        //if  not first answer correctly at last question then lose
        else if (data.answer==currQAnswer && qCounter+1==qTotal && fCorrect!==true) {
            io.to(socket.id).emit("loseGame");
            
            users = rooms.get(ROOMCODE)
            if(users.length===1){
                
                removeFromGame(hostSocket,false)
            }
        }

    })
});

//Potential way of showing the leaderboard during the game.
/*
var output = "<h1>Leaderboard</h1>";
for (var i = 0; i < leaderboard.length; i++) {
    output += "<div>"
    output += "<p>" + leaderboard[i] + "</p>"``````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
    output += "</div>"
}
*/

function sendQuestion(question, roomCode) {
    users = rooms.get(roomCode)
    currQAnswer = question.correct_answer;
    for (user in users) {
        console.log("Sending to: " + users[user])
        io.to(users[user][0]).emit('questionSent', question)
        io.to(users[user][0]).emit('timerStart',delay) //start timer on client side
        console.log("Correct answer: " + currQAnswer)
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

function removeFrom2DArray(array1, toRemove) {
    var retArray = [];
    console.log("To Remove: " + toRemove)
    for (item in array1) {
        if (array1[item][0] != toRemove) {
            retArray.push(array1[item]);
        }
    }
    return retArray
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



function checkForCorrect(socket) {
    console.log("CHECKING FOR CORRECT ANSWERS")

    //if no one answered correctly, first to answer previous question wins game
    if(fCorrect===true){
        console.log("prevQwinner= "+prevQwinner)
        console.log("socket.id= "+socket.id)
        if(prevQwinner===null || prevQwinner!==socket.id){
            removeFromGame(socket,false)
            users = rooms.get(ROOMCODE)
            if(users.length===1){
                clearInterval(countdown)
                removeFromGame(hostSocket,false)
            }
        }
        else {
            console.log("prevQwinner= "+prevQwinner)
            clearInterval(countdown)//remove
            removeFromGame(socket,true)
            removeFromGame(hostSocket,false)
        }
    }
    //else if anyone answered correctly then remove user
    else {
        removeFromGame(socket,false)
    }
}

function removeFromGame(socket,win) {
    //remove player and emit win or lose depending on the boolean given
    users = rooms.get(ROOMCODE)
    updatedUsers = removeFrom2DArray(users, socket.id)
    for (item in users) {
        if(users[item][0] == socket.id){
            leaderboard = removeFromArray(leaderboard, users[item][1])
        }
    }
    console.log("Leaderboard: " + leaderboard)
    rooms.set(ROOMCODE, updatedUsers)
    users = rooms.get(ROOMCODE)
    console.log("USERS: " + users)
    if(win===true) {
        io.to(prevQwinner).emit("winGame");
        socket.disconnect();
    }
    else {
        io.to(socket.id).emit("loseGame");
        socket.disconnect();
    }
}
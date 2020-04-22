//THIS REQUIRES "npm install express, npm install socket.io, npm install mongodb, npm install request, npm install html-entities"
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const request = require('request');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

//LINK TO WEBSITE https://freddie-transit-8080.codio.io/Join_Host_Game.html

//this array contains all the usernames already generated, to avoid duplicates
var alreadyUsed = ["host"];
//contains the players and game state ["player",true/false]
var leaderboard = new Map();

//Global Variables
var response;
var questions;
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
var maxUsers = 100;

//testvars 
var mongo = false;
var testnum = 0;

//ADDED THIS FOR MONGODB. CHECK FOR NECCESITY
if (mongo) {
    const MongoClient = require('mongodb').MongoClient;
    const url = "mongodb://localhost:27017/coloured-animals";
}

//app.use(bodyParser.json());
app.use(express.static('public'))

server.listen(8080);
if (mongo) {
    MongoClient.connect(url, function(err, database ){
        if(err) throw err;
        db = database;
    });
}
//Result:
//It works, no changes in the questions not being sent through the first time though. 
//The host game button still needs to be pressed twice to work. 
io.on('connection', function (socket) {
    socket.on('sendSelects', function (data) {
        var selects = JSON.parse(data.selections);
        console.log("SERVER ID" + socket.id)
        rooms.set(selects.ROOMCODE.toString(), [[socket.id, "host"]])
        ROOMCODE = selects.ROOMCODE.toString();
        hosts.add(ROOMCODE)
        hostSocket = socket;
        url1 = createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)
        //your get questions may take a while to retun so we can immediatly emit anything or create your array.
        //what we do is create a call back function...
        getQuestions(url1, function(returnedQs){
            //this is now a call back that will not run untill we tell it to.
            if (questions === undefined) {
                socket.emit("WARNING", "Press the host game button again please")
            }
            else {
                socket.emit("WARNING", "Questions loaded correctly")
            }
            console.log("Returned Q's")
            questions = returnedQs
            console.log(questions)
            qTotal = selects.AMOUNT;
            console.log("NUMBER OF QUESTIONS: "+qTotal)   
        });
        
    });
    socket.on('sendRoomCode', function (data) {
        var clientRoomCode = JSON.parse(data.roomCode).toString();
        if (data.custUsername === undefined) {
            console.log("Username being made by database")
            socket.emit("WARNING", "Creating a randomised name")
            if (mongo) {
                var user = generateUsername();
            }
            else {
                var user = "user" + testnum
                testnum++
            }
        }
        else {
            console.log("Username input by user")
            console.log(data.custUsername)
            if (alreadyUsed.includes(data.custUsername)) {
                socket.emit("WARNING", "Name has already been used, randomising username now")
                if (mongo) {
                    var user = generateUsername();
                }
                else {
                    var user = "user" + testnum
                    testnum++
                }
            }
            else {
                user = data.custUsername
                alreadyUsed.push(user)
            }
        }
        socket.emit('joinGame', { Client: 'joining', username: user});
        console.log(clientRoomCode)
        if (hosts.has(clientRoomCode)) {
            console.log("connecting")
            console.log("Before!!\n" + rooms)
            users = rooms.get(clientRoomCode.toString())
            if (users.length <= maxUsers) {
                users.push([socket.id, user])
                leaderboard.set(user,true) //add new user to map with "true" to indicate participation
                io.to(users[0][0]).emit('setLeaderboard',Array.from(leaderboard)) //send leaderboard to host socket as array
                console.log(users)
                rooms.set(clientRoomCode.toString(), users)
                console.log("After!!\n" + rooms)
            }
            else {
                socket.emit("WARNING", "Too many players in current game")
                socket.disconnect()
            }
        }
        else {
            console.log("no such host exists")
            socket.emit("WARNING", "No such host exists")
        }
    });
    socket.on('begin', function (data) {
        console.log(data);
        console.log("Sending question")
        console.log(questions)
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
    currQAnswer = entities.decode(question.correct_answer);
    for (user in users) {
        console.log("Sending to: " + users[user])
        io.to(users[user][0]).emit('questionSent', question)
        io.to(users[user][0]).emit('timerStart',delay) //start timer on client side
        console.log("Correct answer: " + currQAnswer)
    }
}

//get questions now has the URL parameter and a parameter that represents our callback function 
function getQuestions(url1, callback) {
    console.log("Loading The Q's & the A's")
    //this is an async call so your old code won't wait for this to complete before returning 
    request.get({
        url: url1,
        json: true
    }, (err, res, data) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {
            //if we get here we have a successfull retrival of the questions from the api.
            console.log("Result from API: ")
            console.log(data.results)
            response = data.results;
            //so we just call our callback with the results
            callback(response);
        }
    });
    //return response
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

if (mongo) {
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
            //if user to be removed isnt host, set the the user to false & update leaderboard
            if(socket.id != users[0][0]){
                leaderboard.set(users[item][1],false) //set user as "false" in leaderboard to indicate loss
                io.to(users[0][0]).emit('setLeaderboard',Array.from(leaderboard))
            }
            //else just update the leaderboard
            else {
                io.to(users[0][0]).emit('setLeaderboard',Array.from(leaderboard))
            }
        }
    }
    //console.log("Leaderboard: " + leaderboard)
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
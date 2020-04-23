const request = require('request');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
//const io = require('socket.io')(server);
var rooms = new Map();


class Host{
    
    constructor(roomcode, selections, socket) {
        this.roomcode = roomcode;
        this.selections = selections;
        this.socket = socket;
        this.alreadyUsed = ["host"];
        this.leaderboard = new Map();
        this.questions = null;
        this.qCounter = 0;
        this.ROOMCODE;
        this.currQAnswer;
        this.qTotal; //total number of q
        this.delay= 15; //delay for the timers
        this.fCorrect= true; //var used to check who was first to answer correctly
        this.prevQwinner= null;
        this.timeLeft;
        this.countdown; //initialised for future clearInterval from outside timer
        this.hostSocket;
        this.maxUsers = 100;
        this.mongo = false;
        this.testnum = 0;
    }
    start() {
        console.log(this.selections)
        var selects = JSON.parse(this.selections);
        console.log(selects)
        console.log("SERVER ID" + this.socket.id)
        rooms.set(this.roomcode.toString(), [[this.socket.id, "host"]])
        this.ROOMCODE = this.roomcode.toString();
        this.hostSocket = this.socket;
        var url1 = this.createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)
        if (this.mongo) {
            const MongoClient = require('mongodb').MongoClient;
            const url = "mongodb://localhost:27017/coloured-animals";
            MongoClient.connect(url, function(err, database ){
                if(err) throw err;
                db = database;
            });
        }
        //your get questions may take a while to retun so we can immediatly emit anything or create your array.
        //what we do is create a call back function...
        this.getQuestions(url1, function(returnedQs, hostObject){
            //this is now a call back that will not run untill we tell it to.
            console.log("Returned Q's")
            console.log(returnedQs)
            console.log(hostObject.questions)
            hostObject.questions = returnedQs
            console.log(hostObject.questions)
            hostObject.qTotal = selects.AMOUNT;
            console.log("NUMBER OF QUESTIONS: "+hostObject.qTotal)
            if (hostObject.questions === undefined) {
                hostObject.hostSocket.emit("WARNING", "Press the host game button again please")
            }
            else {
                hostObject.hostSocket.emit("WARNING", "Questions loaded correctly")
            }
        });
    }
    sendRoomCode(data, socket, io) {
        console.log("in send room code")
        //var clientRoomCode = JSON.parse(data.roomcode).toString();
        console.log(data)
        var clientRoomCode = data.roomcode
        if (data.custUsername === undefined) {
            console.log("Username being made by database")
            socket.emit("WARNING", "Creating a randomised name")
            if (this.mongo) {
                var user = this.generateUsername();
            }
            else {
                var user = "user" + this.testnum
                this.testnum++
            }
        }
        else {
            console.log("Username input by user")
            console.log(data.custUsername)
            if (alreadyUsed.includes(data.custUsername)) {
                socket.emit("WARNING", "Name has already been used, randomising username now")
                if (this.mongo) {
                    var user = this.generateUsername();
                }
                else {
                    var user = "user" + this.testnum
                    this.testnum++
                }
            }
            else {
                user = data.custUsername
                alreadyUsed.push(user)
            }
        }
        socket.emit('joinGame', { Client: 'joining', username: user});
        if (this.ROOMCODE == clientRoomCode) {
            console.log("connecting")
            console.log("Before!!\n" + rooms)
            var users = rooms.get(clientRoomCode.toString())
            if (users.length <= this.maxUsers) {
                users.push([socket.id, user])
                this.leaderboard.set(user,true) //add new user to map with "true" to indicate participation
                io.to(users[0][0]).emit('setLeaderboard',Array.from(this.leaderboard)) //!!!! IO
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
    }
    begin(data, io) {
        console.log(data);
        console.log("Sending question")
        console.log(this.questions)
        console.log(this.ROOMCODE.toString())
        console.log(this.questions[this.qCounter])
        this.sendQuestion(this.questions[this.qCounter], this.ROOMCODE, io)
        
        console.log("Sent question & started timer")

        this.timeLeft= this.delay+1;
        console.log(this.timeLeft + ":" + this.delay)
        console.log(this.timeLeft--)

        this.countdown= this.setInterval(function(){
            //this.timeLeft = this.timeLeft - 1;
            //console.log(this.timeLeft)

            this.timeLeft= this.delay+1;
            //if timer<=0 and it isnt the last question then reset timer and boolean variables + send next question to users
            if(this.timeLeft <= 0 && this.qCounter+1<this.qTotal){
                this.fCorrect= true;
            
                this.timeLeft= this.delay+1;
                
                this.qCounter++
                this.sendQuestion(this.questions[this.qCounter], this.ROOMCODE, io)
                console.log("Sent next question")
                
            }
            //if timer<=0 and its the last question then timer=0 and stop timer
            else if(this.timeLeft <= 0 && this.qCounter+1==this.qTotal){
                this.clearInterval(this.countdown)
                console.log("Gameover for: "+this.ROOMCODE+" !")
            }
        },1000);
    }
    answer(data, socket, io) {
        console.log("Data given: " + data.answer)
        console.log("Server data given: " + this.currQAnswer)
        //if answered incorrectly, run checkForCorrect(socket) at the end of timer
        console.log("qCounter: " + this.qCounter + "\nqTotal: " + this.qTotal)
        console.log("fCorrect: " + this.fCorrect)
        if(data.answer !== this.currQAnswer) {
            setTimeout(function(){this.checkForCorrect(socket, io)},(this.timeLeft*1000)-500)  //last change made
        }
        //if first to answer correctly (before last question) then set to previous Q winner
        if(data.answer === this.currQAnswer && this.qCounter+1<this.qTotal && this.fCorrect=== true) {
            this.fCorrect=false;
            this.prevQwinner= socket.id;
        }
        //if first to answer correctly at last question then win
        if (data.answer==this.currQAnswer && this.qCounter+1==this.qTotal && this.fCorrect==true) {
            this.fCorrect=false
            io.to(socket.id).emit("winGame");

            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                this.removeFromGame(this.hostSocket,false,io)
            }
            
        }
        
        //if  not first answer correctly at last question then lose
        else if (data.answer==this.currQAnswer && this.qCounter+1==this.qTotal && this.fCorrect!==true) {
            io.to(socket.id).emit("loseGame");
            
            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                this.removeFromGame(this.hostSocket,false, io)
            }
        }
    }
    sendQuestion(question, roomCode, io) {
        var users = rooms.get(roomCode)
        this.currQAnswer = entities.decode(question.correct_answer);
        for (let user in users) {
            console.log("Sending to: " + users[user][0])
            io.to(users[user][0]).emit('questionSent', question)
            io.to(users[user][0]).emit('timerStart',this.delay) //start timer on client side
            console.log("Correct answer: " + this.currQAnswer)
        }
    }
    getQuestions(url1, callback) {
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
                var response = data.results;
                var hostObject = this;
                //so we just call our callback with the results
                callback(response, hostObject);
            }
        });
        //return response
    }
    removeFrom2DArray(array1, toRemove) {
        var retArray = [];
        console.log("To Remove: " + toRemove)
        for (item in array1) {
            if (array1[item][0] != toRemove) {
                retArray.push(array1[item]);
            }
        }
        return retArray
    }
    createURL(amount, difficulty, category) {
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
    checkForCorrect(socket, io) {
        console.log("CHECKING FOR CORRECT ANSWERS")
    
        //if no one answered correctly, first to answer previous question wins game
        if(this.fCorrect===true){
            console.log("prevQwinner= "+this.prevQwinner)
            console.log("socket.id= "+socket.id)
            if(this.prevQwinner===null || this.prevQwinner!==socket.id){
                this.removeFromGame(socket,false, io)
                users = rooms.get(this.ROOMCODE)
                if(users.length===1){
                    this.clearInterval(this.countdown)
                    this.removeFromGame(this.hostSocket,false, io)
                }
            }
            else {
                console.log("prevQwinner= "+this.prevQwinner)
                this.clearInterval(this.countdown)//remove
                this.removeFromGame(socket,true, io)
                this.removeFromGame(this.hostSocket,false, io)
            }
        }
        //else if anyone answered correctly then remove user
        else {
            this.removeFromGame(socket,false, io)
        }
    }
    removeFromGame(socket,win, io) {
        //remove player and emit win or lose depending on the boolean given
        users = rooms.get(this.ROOMCODE)
        updatedUsers = this.removeFrom2DArray(users, socket.id)
        for (item in users) {
            if(users[item][0] == socket.id){
                //leaderboard = removeFromArray(leaderboard, users[item][1])
                if(socket.id != users[0][0]){
                    this.leaderboard.set(users[item][1],false) //set user as "false" in leaderboard to indicate loss
                    io.to(users[0][0]).emit('setLeaderboard',Array.from(this.leaderboard))
                }
                else {
                    io.to(users[0][0]).emit('setLeaderboard',Array.from(this.leaderboard))
                }
            }
        }
        console.log("Leaderboard: " + this.leaderboard)
        rooms.set(this.ROOMCODE, updatedUsers)
        users = rooms.get(this.ROOMCODE)
        console.log("USERS: " + users)
        if(win===true) {
            io.to(this.prevQwinner).emit("winGame");
            socket.disconnect();
        }
        else {
            io.to(socket.id).emit("loseGame");
            socket.disconnect();
        }
    }
}

/*
if (this.mongo) {
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
*/

module.exports = Host





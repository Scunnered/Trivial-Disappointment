const request = require('request');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
var rooms = new Map();
var currentGames = new Map();

class Host{
    
    constructor(roomcode, selections, socket) {
        this.roomcode = roomcode;
        this.selections = selections;
        this.socket = socket;
        this.alreadyUsed = ["host"];
        //this.leaderboard = new Map();
        this.questions = null;
        //this.qCounter = 0;
        this.ROOMCODE;
        //this.currQAnswer;
        //this.qTotal; //total number of q
        //this.delay= 15; //delay for the timers
        //this.fCorrect= true; //var used to check who was first to answer correctly
        this.prevQwinner= null;
        //this.timeLeft;
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
        this.hostSocket = this.socket;
        rooms.set(this.roomcode.toString(), [[this.socket.id, "host"]])
        currentGames.set(this.roomcode, {timeLeft: 0, qCounter: 0, qTotal: 0, fCorrect: true, delay:15, questions: null, currQAnswer: null, ROOMCODE: this.roomcode, prevQwinner: null, hostSocket: this.hostSocket, countdown: null, leaderboard: new Map()})
        var currentGame = currentGames.get(this.ROOMCODE)
        console.log(currentGame)
        this.ROOMCODE = this.roomcode.toString();
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
            var currentGame = currentGames.get(hostObject.ROOMCODE)
            //this is now a call back that will not run untill we tell it to.
            console.log("Returned Q's")
            console.log(returnedQs)
            console.log(currentGame.questions)
            currentGame.questions = returnedQs
            console.log(currentGame.questions)
            currentGame.qTotal = selects.AMOUNT;
            console.log("NUMBER OF QUESTIONS: "+currentGame.qTotal)
            if (currentGame.questions === undefined) {
                hostObject.hostSocket.emit("WARNING", "Press the host game button again please")
            }
            else {
                hostObject.hostSocket.emit("WARNING", "Questions loaded correctly")
            }
        });
    }
    sendRoomCode(data, socket, io) {
        var currentGame = currentGames.get(this.ROOMCODE)
        console.log(currentGame)
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
                currentGame.leaderboard.set(user,true) //add new user to map with "true" to indicate participation
                io.to(users[0][0]).emit('setLeaderboard',Array.from(currentGame.leaderboard)) //!!!! IO
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
        var currentGame = currentGames.get(this.ROOMCODE)
        console.log(data);
        console.log("Sending question")
        console.log(this.questions)
        console.log(this.ROOMCODE.toString())
        currentGame.currQAnswer = sendQuestion(currentGame.questions[currentGame.qCounter], currentGame.ROOMCODE, io, currentGame.delay)
        
        console.log("Sent question & started timer")
        currentGame.timeLeft = currentGame.delay+1

        var roomcode = this.ROOMCODE;
        currentGame.countdown= setInterval(function(roomcode){
            var currentGame = currentGames.get(roomcode)
            currentGame.timeLeft = currentGame.timeLeft-1;
            //this.timeLeft = this.timeLeft - 1;
            console.log(currentGame.timeLeft)
            
            //if timer<=0 and it isnt the last question then reset timer and boolean variables + send next question to users
            if(currentGame.timeLeft <= 0 && currentGame.qCounter+1<currentGame.qTotal){
                currentGame.fCorrect= true;
            
                currentGame.timeLeft= currentGame.delay+1;
                
                currentGame.qCounter++
                currentGame.currQAnswer = sendQuestion(currentGame.questions[currentGame.qCounter], currentGame.ROOMCODE, io, currentGame.delay)
                console.log("Sent next question")
                
            }
            //if timer<=0 and its the last question then timer=0 and stop timer
            else if(currentGame.timeLeft <= 0 && currentGame.qCounter+1==currentGame.qTotal){
                clearInterval(currentGame.countdown)
                console.log("Gameover for: "+currentGame.ROOMCODE+" !")
            }
        },1000, roomcode);
    }
    answer(data, socket, io) {
        var currentGame = currentGames.get(this.ROOMCODE)
        console.log("Data given: " + data.answer)
        console.log("Server data given: " + currentGame.currQAnswer)
        socket.emit("WARNING", "You submitted your answer, wait for the timer to end for the next question OR TO MEET YOUR DOOM.");
        //if answered incorrectly, run checkForCorrect(socket) at the end of timer
        console.log("qCounter: " + currentGame.qCounter + "\nqTotal: " + currentGame.qTotal)
        console.log("fCorrect: " + currentGame.fCorrect)
        if(data.answer !== currentGame.currQAnswer) {
            var roomcode = this.ROOMCODE;
            setTimeout(function(roomcode){
                var currentGame = currentGames.get(roomcode)
                checkForCorrect(socket, io, currentGame.fCorrect, currentGame.prevQwinner, currentGame.countdown, currentGame.hostSocket, currentGame.leaderboard, currentGame.ROOMCODE)
            },(currentGame.timeLeft*1000)-500, roomcode)  //last change made
        }
        //if first to answer correctly (before last question) then set to previous Q winner
        if(data.answer == currentGame.currQAnswer && currentGame.qCounter+1<currentGame.qTotal && currentGame.fCorrect== true) {
            currentGame.fCorrect=false;
            currentGame.prevQwinner= socket.id;
        }
        //if first to answer correctly at last question then win
        if (data.answer==currentGame.currQAnswer && currentGame.qCounter+1==currentGame.qTotal && currentGame.fCorrect==true) {
            currentGame.fCorrect=false
            io.to(socket.id).emit("winGame");

            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                removeFromGame(currentGame.hostSocket,false,io, currentGame.leaderboard, currentGame.ROOMCODE, currentGame.prevQwinner)
            }
            
        }
        
        //if  not first answer correctly at last question then lose
        else if (data.answer==currentGame.currQAnswer && currentGame.qCounter+1==currentGame.qTotal && currentGame.fCorrect!==true) {
            io.to(socket.id).emit("loseGame");
            
            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                removeFromGame(currentGame.hostSocket,false, io, currentGame.leaderboard, currentGame.ROOMCODE, currentGame.prevQwinner)
            }
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
    
}

function checkForCorrect(socket, io, fCorrect, prevQwinner, countdown, hostSocket, leaderboard, ROOMCODE) {
    console.log("CHECKING FOR CORRECT ANSWERS")

    //if no one answered correctly, first to answer previous question wins game
    if(fCorrect===true){
        console.log("prevQwinner= "+ prevQwinner)
        console.log("socket.id= "+socket.id)
        if(prevQwinner===null || prevQwinner!==socket.id){
            removeFromGame(socket,false, io, leaderboard, ROOMCODE, prevQwinner)
            users = rooms.get(ROOMCODE)
            if(users.length===1){
                clearInterval(countdown)
                removeFromGame(hostSocket,false, io, leaderboard, ROOMCODE, prevQwinner)
            }
        }
        else {
            console.log("prevQwinner= "+prevQwinner)
            clearInterval(countdown)//remove
            removeFromGame(socket,true, io, leaderboard, ROOMCODE, prevQwinner)
            removeFromGame(hostSocket,false, io, leaderboard, ROOMCODE, prevQwinner)
        }
    }
    //else if anyone answered correctly then remove user
    else {
        removeFromGame(socket,false, io, leaderboard, ROOMCODE, prevQwinner)
    }
}

function sendQuestion(question, roomCode, io, delay) {
    var users = rooms.get(roomCode)
    var currQAnswer = entities.decode(question.correct_answer);
    for (let user in users) {
        console.log("Sending to: " + users[user][0])
        io.to(users[user][0]).emit('questionSent', question)
        io.to(users[user][0]).emit('timerStart',delay) //start timer on client side
        console.log("Correct answer: " + currQAnswer)
    }
    console.log("returning currQAnswer")
    return currQAnswer
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

function removeFromGame(socket, win, io, leaderboard, ROOMCODE, prevQwinner) {
    //remove player and emit win or lose depending on the boolean given
    users = rooms.get(ROOMCODE)
    updatedUsers = removeFrom2DArray(users, socket.id)
    for (item in users) {
        if(users[item][0] == socket.id){
            //leaderboard = removeFromArray(leaderboard, users[item][1])
            if(socket.id != users[0][0]){
                leaderboard.set(users[item][1],false) //set user as "false" in leaderboard to indicate loss
                io.to(users[0][0]).emit('setLeaderboard',Array.from(leaderboard))
            }
            else {
                io.to(users[0][0]).emit('setLeaderboard',Array.from(leaderboard))
            }
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





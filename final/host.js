//Request npm module for the api call to opentdb.com
const request = require('request');
//Entities npm module for decoding html entities that opentdb returns on occasion. This stops issues with the correct answer being incorrect due to these html entities.
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
//This rooms variable holds all the users that are attached to a room code. It uses a 2d array as value with the socket ID of the user and the username of the user
var rooms = new Map();
//This currentGames holds all the room code local variables that have to be globally accessed by this Host class making sure that they cannot be changed by any other host running alongside this host.
var currentGames = new Map();

//Our host class that instantiates an object for every hosted game.
class Host{
    //A constructor with all the variables we use locally in this object. Passed to it are room code, for identification of the host, the selections for later making the url for the api call, the socket for identifying the host with an ID and the database from the server.js file as it needs to be instanciated before a host object exists.
    constructor(roomcode, selections, socket, db) {
        this.ROOMCODE = roomcode.toString();
        this.selections = selections;
        this.hostSocket = socket;
        this.db = db;
        //This array stores all the used usernames so no duplicates can exist.
        this.alreadyUsed = [];
        //This variable holds the socket for the previous question winner for game logic
        this.prevQwinner= null;
        //initialised for future clearInterval from outside timer
        this.countdown; 
        //This variable holds the maximum amount of users that can access a single game.
        this.maxUsers = 100;
        //This variable was used for testing outside of codio to turn on and off mongo functionality that doesn't work in local node.js instances.
        this.mongo = true;
        //This variable was used for testing without the use of mongodb for creating unique usernames
        this.testnum = 0;
    }
    //This function runs whenever a server wants to start a hosting session
    start() {
        //The selections variable is parsed using the json parser to reveal the variables
        var selects = JSON.parse(this.selections);
        console.log("SERVER ID" + this.hostSocket.id)
        //This line creates the room with the roomcode as key and the 2d array of hosts socket ID and the username for the host.
        rooms.set(this.ROOMCODE.toString(), [[this.hostSocket.id, "host"]])
        //This sets our global variable that is tied to the room code that holds all of our variables that need to be global
        currentGames.set(this.ROOMCODE, {timeLeft: 0, qCounter: 0, qTotal: 0, fCorrect: true, delay:15, questions: null, currQAnswer: null, ROOMCODE: this.ROOMCODE, prevQwinner: null, hostSocket: this.hostSocket, countdown: null, leaderboard: new Map()})
        //This line runs the createURL function with the amount of questions requested, the difficulty of those questions and the category the host wants to use.
        var url1 = this.createURL(selects.AMOUNT, selects.DIFFICULTY, selects.CATEGORY)
        console.log(url1)        
        //This callback function waits for the API call to finish before proceeding
        this.getQuestions(url1, function(returnedQs, hostObject){
            //Our variable is instantiated using the room code to get access to all the variables we will need
            var currentGame = currentGames.get(hostObject.ROOMCODE)
            //this is now a call back that will not run until we tell it to.
            //The returned questions from the API are placed into the questions variable inside the current game
            currentGame.questions = returnedQs
            //The total number of questions is also set here
            currentGame.qTotal = selects.AMOUNT;
            //This is an if statement for if there are any issues with the API that result in the questions being undefined.
            if (currentGame.questions === undefined) {
                hostObject.hostSocket.emit("WARNING", "Something went terribly wrong. Refresh the page and contact us @TrivialDis on Twitter.")
            }
            else {
                hostObject.hostSocket.emit("WARNING", "Questions loaded. Wait for some players to join!")
            }
        });
    }
    //This is a client run function which sends through data from the user side, the socket which is sending the data and the socket.io object that lets us communicate back and forth between the client and server
    sendRoomCode(data, socket, io) {
        console.log("in send room code")
        //var clientRoomCode = JSON.parse(data.roomcode).toString();
        console.log(data)
        //The client has a room code stored in the data 
        var clientRoomCode = data.roomcode
        //This checks for the validity of the username data that the user sent, if there is no username, one will be generated using our mongoDB database.
        if (data.custUsername === undefined) {
            console.log("Username being made by database")
            //If mongo is turned on
            if (this.mongo) {
                console.log("ALREADY USED: " + this.alreadyUsed)
                //This is a callback function that runs the generation of a username for if the users
                this.generateUsername(function(username, hostObject) {
                    //This function deals with the creation and addition of the user into the game
                    dealwithuser(username, hostObject);
                });
            }
            //This runs if mongo is not turned on
            else {
                //Makes a simple username for the user
                var user = "user" + this.testnum
                this.testnum++
                dealwithuser(user, this);
            }
        }
        //This else deals with the user if they entered their own username
        else {
            console.log("Username input by user")
            console.log(data.custUsername)
            //This checks if the alreadyUsed array has got the custom username that the user entered
            if (this.alreadyUsed.includes(data.custUsername)) {
                //If mongo is enabled generate a username and then deal with creating the user
                if (this.mongo) {
                    console.log("ALREADY USED: " + this.alreadyUsed)
                    this.generateUsername(function(username, hostObject) {
                        dealwithuser(username, hostObject);
                    });
                }
                else {
                    var user = "user" + this.testnum
                    this.testnum++;
                    dealwithuser(user, this);
                }
            }
            //If mongo doesn't exist create a simple username
            else {
                var user = data.custUsername
                this.alreadyUsed.push(user)
                dealwithuser(user, this);
            }
        }
        //This function deals with the creation of the user after they get a username assigned to them or have a custom one they send through
        function dealwithuser(username, hostObject){
            //Instanciating the variable which holds all of our global variables
            var currentGame = currentGames.get(hostObject.ROOMCODE)
            console.log(clientRoomCode)
            //If the room code sent through by the user matches the room code of this host
            if (hostObject.ROOMCODE == clientRoomCode) {
                console.log("connecting")
                console.log("Before!!\n" + rooms)
                //An array of users is gotten from the rooms variable 
                var users = rooms.get(clientRoomCode.toString())
                //If the amount of users is less than 100 the user can be added
                if (users.length < hostObject.maxUsers) {
                    //the user's socket.id and username are added to the users array.
                    users.push([socket.id, username])
                    //The user is added to the leaderboard with "true" to indicate participation
                    currentGame.leaderboard.set(username,true)
                    //This io call sends out setleaderboard which updates the leaderboard on the host side 
                    io.to(users[0][0]).emit('setLeaderboard',Array.from(currentGame.leaderboard))
                    console.log(users)
                    //Set the rooms code to the new updated users array.
                    rooms.set(clientRoomCode.toString(), users)
                    console.log("After!!\n" + rooms)
                    //Giving a confirmation to the user that they have joined the game
                    //Emit to the user their username so it shows on their screen using the joinGame socket function
                    socket.emit('joinGame', { Client: 'joining', username: username});
                    //Emit to the user a warning so they can see that they have joined a game
                    socket.emit("WARNING", "You have joined a game. Wait for the host to begin.")
                }
                else {
                    //If the server is full warn the player that they cannot join the game
                    socket.emit("WARNING", "Too many players in current game")
                    //Disconnect their socket so that they aren't overloading the server with connection requests
                    socket.disconnect()
                }
            }
            //If the host doesn't exist at all or the room code was incorrect
            else {
                //A warning is emitted to the user that no such host exists and they cannot join
                socket.emit("WARNING", "No such host exists")
                //Disconnect their socket so that they aren't overloading the server with connection requests
                socket.disconnect()
            }
            
        }
    }
    //This begin function only runs on host side, this begins the game. The socket.io object is sent through to make communication between server and client work.
    begin(io) {
        //Getting the array of users from the global rooms variable
        var users = rooms.get(this.ROOMCODE)
        console.log("AMOUNT OF USERS: " + users.length)
        //Only be able to start the game if a user actually joins.
        if (users.length >= 3) {
            //Letting the host know that the game has begun
            this.hostSocket.emit("WARNING", "Game started.")
            //Creating an instance of currentgame to get all of the variables we need to use here
            var currentGame = currentGames.get(this.ROOMCODE)
            console.log("Sending question")
            console.log(this.ROOMCODE)
            //Sending the question to all the users and getting the correct answer back from the current question
            currentGame.currQAnswer = sendQuestion(currentGame.questions[currentGame.qCounter], currentGame.ROOMCODE, io, currentGame.delay)
            
            console.log("Sent question & started timer")
            currentGame.timeLeft = currentGame.delay+1 //set timeLeft to the delay+1
    
            var roomcode = this.ROOMCODE;
            //start countdown on server side for main game function
            currentGame.countdown= setInterval(function(roomcode){
                var currentGame = currentGames.get(roomcode)
                currentGame.timeLeft = currentGame.timeLeft-1; //count down the timer (timeLeft) each second
                console.log(currentGame.timeLeft)
                
                //if timer<=0 and it isnt the last question, then reset timer and boolean variables + send next question to users
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
        else {
            //Emit to the host that the lobby is empty if there is only 1 user (the host) and that they cannot start a game
            this.hostSocket.emit("WARNING", "The lobby is empty, you cannot start a game.")
        }
        
    }
    //This function deals with the users answer after they have clicked the button to send it through. The data contains the answer, the socket (user) id for who sent the question and the socket.io io object to allow communication
    answer(answer, socket, io) {
        //Instanciating the variable which holds all of our global variables
        var currentGame = currentGames.get(this.ROOMCODE)
        console.log("Data given: " + answer)
        console.log("Server data given: " + currentGame.currQAnswer)
        //Sending a warning to the user that they put in their answer and they have to wait
        socket.emit("WARNING", "You submitted your answer, wait for the timer to end for the next question OR TO MEET YOUR DOOM.");
        //if answered incorrectly, run checkForCorrect(...) at the end of timer
        console.log("qCounter: " + currentGame.qCounter + "\nqTotal: " + currentGame.qTotal)
        console.log("fCorrect: " + currentGame.fCorrect)

        //if the answer is incorrect 
        if(answer !== currentGame.currQAnswer) {
            console.log(answer !== currentGame.currQAnswer)
            var roomcode = this.ROOMCODE;
            //The check for correct function that is set on a timeout that removes users based on their answer and when they answered the question
            setTimeout(function(roomcode){
                var currentGame = currentGames.get(roomcode)
                checkForCorrect(socket, io, currentGame.fCorrect, currentGame.prevQwinner, currentGame.countdown, currentGame.hostSocket, currentGame.leaderboard, currentGame.ROOMCODE)
            },(currentGame.timeLeft*1000)-500, roomcode)  //last change made
        }
        //if first to answer correctly (before last question) then set to previous Q winner
        if(answer == currentGame.currQAnswer && currentGame.qCounter+1<currentGame.qTotal && currentGame.fCorrect== true) {
            currentGame.fCorrect=false;
            currentGame.prevQwinner= socket.id;
        }
        //if first to answer correctly at last question then win
        if (answer==currentGame.currQAnswer && currentGame.qCounter+1==currentGame.qTotal && currentGame.fCorrect==true) {
            currentGame.fCorrect=false
            io.to(socket.id).emit("winGame");

            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                hostSocket.emit("WARNING", "Game Over.")
                removeFromGame(currentGame.hostSocket,false,io, currentGame.leaderboard, currentGame.ROOMCODE, currentGame.prevQwinner)
            }
            
        }
        
        //if  not first answer correctly at last question then lose
        else if (answer==currentGame.currQAnswer && currentGame.qCounter+1==currentGame.qTotal && currentGame.fCorrect!==true) {
            io.to(socket.id).emit("loseGame");
            
            var users = rooms.get(this.ROOMCODE)
            if(users.length===1){
                hostSocket.emit("WARNING", "Game Over.")
                removeFromGame(currentGame.hostSocket,false, io, currentGame.leaderboard, currentGame.ROOMCODE, currentGame.prevQwinner)
            }
        }
    }
    
    //This function gets the questions from our API
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
                var response = data.results;
                var hostObject = this;
                //so we just call our callback with the results
                callback(response, hostObject);
            }
        });
    }
    
    //This function creates a custom url for the api call so it can give the exact questions that the host wants
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
    //This function generates & returns a username, and puts it in the alreadyUsed array to avoid duplicates.
    generateUsername(callback){
        var hostObject = this;
        hostObject.db.collection('colours').find().toArray(function(err, result1) {
            if (err) throw err;
            hostObject.db.collection('animals').find().toArray(function(err, result2) {
                if (err) throw err;
                //Nested find().toArray() because of the use of two collections.
    
                do{
                    //initializes output to be returned later & boolean of wether generated username is a duplicate
                    var output = "";
                    var used = false;
    
                    //adds random colour & name to output, thus making the username
                    output += result1[Math.floor(Math.random() * result1.length)].colour;
                    output += result2[Math.floor(Math.random() * result2.length)].name;
                    
                    console.log(1);
                    console.log(output);

                    //conpares it to each username already generated, and if it already exits, repeates the do while loop
                    for(var i=0;i<hostObject.alreadyUsed.length;i++){
                        if(hostObject.alreadyUsed[i]===output){
                            used = true;
                        }
                    }
                }
                while(used) //This only repeats if there is a duplicate
    
                //adds non-duplicate to the array of already used usernames
                hostObject.alreadyUsed.push(output)

                //returns the just now added username
        //return alreadyUsed[alreadyUsed.length-1];
        console.log(2);
        console.log(hostObject.alreadyUsed[hostObject.alreadyUsed.length-1]);
        callback(hostObject.alreadyUsed[hostObject.alreadyUsed.length-1], hostObject);
            });
        });
    }
}
//used for checking the answers at the end of the countdown
function checkForCorrect(socket, io, fCorrect, prevQwinner, countdown, hostSocket, leaderboard, ROOMCODE) {
    console.log("CHECKING FOR CORRECT ANSWERS")

    //if no one answered correctly, first to answer previous question wins game
    if(fCorrect===true){ //(if no correct answers)
        console.log("prevQwinner= "+ prevQwinner)
        console.log("socket.id= "+socket.id)
        //mainly used for first question
        //if first person to answer previous question is null or is not host, remove from game 
        if(prevQwinner===null || prevQwinner!==socket.id){
            removeFromGame(socket,false, io, leaderboard, ROOMCODE, prevQwinner)
            users = rooms.get(ROOMCODE)
            //if only host is left; stop countdown, emit a "Game Over" WARNING to host and remove host
            if(users.length===1){
                clearInterval(countdown)
                hostSocket.emit("WARNING", "Game Over.")
                removeFromGame(hostSocket,false, io, leaderboard, ROOMCODE, prevQwinner)
            }
        }
        //if someone was first to answer the previous question correctly, just remove user&host and emit a "Game Over" WARNING to host and remove host
        else {
            console.log("prevQwinner= "+prevQwinner)
            clearInterval(countdown)//stop countdown
            removeFromGame(socket,true, io, leaderboard, ROOMCODE, prevQwinner)
            hostSocket.emit("WARNING", "Game Over.")
            removeFromGame(hostSocket,false, io, leaderboard, ROOMCODE, prevQwinner)
        }
    }
    //else if anyone answered correctly then remove user
    else {
        removeFromGame(socket,false, io, leaderboard, ROOMCODE, prevQwinner)
    }
}

//This function goes through every user (including host) to send the question to them
function sendQuestion(question, roomCode, io, delay) {
    //Get array of users from rooms map
    var users = rooms.get(roomCode)
    //Decode the correct answer with the html-entities decoder to make sure that the answer matches the text that is shown on the buttons of the game
    var currQAnswer = entities.decode(question.correct_answer);
    //For each user in the users array
    for (let user in users) {
        console.log("Sending to: " + users[user][0])
        //Send the question to their socket
        io.to(users[user][0]).emit('questionSent', question)
        //Start the timer on the client side
        io.to(users[user][0]).emit('timerStart',delay)
        console.log("Correct answer: " + currQAnswer)
    }
    console.log("returning currQAnswer")
    //Return the correct answer for use with the answer function later
    return currQAnswer
}

//This function removes a string item from a 2d array, it is used in removeFromGame
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

//This function removes players from the game and disconnects their sockets
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
    console.log("USERS: " + updatedUsers)
    if(win===true) {
        io.to(prevQwinner).emit("winGame");
        socket.disconnect();
    }
    else {
        io.to(socket.id).emit("loseGame");
        socket.disconnect();
    }
}

module.exports = Host         
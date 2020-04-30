//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var boolArr = ["#choice2", "#choice3"];
var correctButton = "";
var clientSocket;
var hostSocket;
var username;
var clicked= false; //used for keeping track of buttons clicked

$(document).ready(function() {
    //create sockets first. These are the same thing but creating two references means you can keep track later
    clientSocket = io();
    hostSocket = io();
    //when "hostGame" button is clicked, emit "createHost" with current game roomcode and game selections
    $("#hostGame").click(function(){
        hostSocket.emit("createHost", {roomcode: getRoomCodeServer(), selections: getSelections()})
    });
    //when "startGame" button is clicked, emit "begin" wth game status "started" and current game roomcode
    $("#startGame").click(function(){
        hostSocket.emit('begin', { game: "started", roomcode: getRoomCodeServer()});
    });
    //when "joinGame" button is clicked, get the username and emit "sendRoomCode" with given roomcode and username(if there is any)
    $("#joinGame").click(function(data){
        console.log(data)
        if (getUsername() === null) {
            clientSocket.emit('sendRoomCode', { roomcode: getRoomCode()});
        }
        else {
            clientSocket.emit('sendRoomCode', { roomcode: getRoomCode(), custUsername: getUsername()});
        }
    });

    //create all listeners
    hostSocket.on('questionSent', function (question) {
        if (question.type === "boolean") {
            setQuestionBool(question);
        }
        else {
            setQuestion(question);
        }
        hostUI()
        changeBackground(question.category);
    })
    //listen for "questionSent"; start timer on host side
    hostSocket.on('timerStart', function(data) {
        console.log("Timer starting")
        timer(data);
    })

    //listen for a "WARNING" on host; that should be sent from server
    hostSocket.on('WARNING', function (data) {
            console.log(data);
            setWarning(data);
    });
    //listen for "setLeaderboard"; set&show leaderboard on host side
    hostSocket.on("setLeaderboard", function(data) {
        console.log("UPDATE LEADERBOARD")
        setLeaderboard(data);
    })
    //listen for "joinGame"; show username on client side
    clientSocket.on('joinGame', function (data) {
        console.log(data);
        username = data.username
        $("#username").html(username)
        console.log(clientSocket.id);
    });
    //listen for "questionSent"; set&show question&answers, adjust the gui according to question type and background according to question category
    clientSocket.on('questionSent', function (question) {
        console.log(question)
        if (question.type === "boolean") {
            setQuestionBool(question);
            onShowQuestionBool();
        }
        else {
            setQuestion(question);
            onShowQuestion();
        }
        changeBackground(question.category)
    })
    //listen for "timerStart"; start timer on client side
    clientSocket.on('timerStart', function(data) {
        console.log("Timer starting")
        timer(data);
    })
    //listen for "loseGame"; run loseGame function, hide the choice buttons
    clientSocket.on('loseGame', function () {
        loseGame();
        hideButtons()
    })
    //listen for "resetGame"; run resetGame(), resetting game vars
    clientSocket.on('resetGame', function() {
        resetGame();
    })
    //listen for "winGame"; run winGame() function, hide the choice buttons
    clientSocket.on('winGame', function () {
        winGame();
        hideButtons()
    })
    //listen for "WARNING" on client; that should be sent from server
    clientSocket.on('WARNING', function (data) {
        console.log(data);
        setWarning(data);
    })
    //on clicking a choice button, send the answer on that button and change clicked to true so the answer function cannot be sent again
    $("#choice1").click(function(){
        if (!clicked) {
            clientSocket.emit('answer', { answer: $("#choice1").text(), roomcode: getRoomCode()});
        }        
        clicked=true;
    });
    $("#choice2").click(function(){
        if (!clicked) {
            clientSocket.emit('answer', { answer: $("#choice2").text(), roomcode: getRoomCode()});
        }        
        clicked=true;
    });
    $("#choice3").click(function(){
        if (!clicked) {
            clientSocket.emit('answer', { answer: $("#choice3").text(), roomcode: getRoomCode()});
        }        
        clicked=true;
    });
    $("#choice4").click(function(){
        if (!clicked) {
            clientSocket.emit('answer', { answer: $("#choice4").text(), roomcode: getRoomCode()});
        }
        clicked=true;
    });
});

//get selected game options and return as a jsonFile
function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var jsonFile = makeJSON(selectedAmount, selectedDiff, selectedCat);
    return jsonFile;
}
//host: get&return current roomcode
function getRoomCodeServer() {
    var hostRoomCodeWrong = $("#displayCode").text();
    var hostRoomCode = hostRoomCodeWrong.split(": ")[1];
    console.log(hostRoomCode)
    return hostRoomCode
}
//get&return the roomcode entered
function getRoomCode() {
    var clientRoomCode = $("#enteredCode").val();
    return clientRoomCode
}

//get custom username, if no username given set null and return
function getUsername() {
    if (!$("#usernameInput").val()) {
        var custUsername = null;
    }
    else {
        var custUsername = $("#usernameInput").val();
    }
    return custUsername
}
//make&return a json files from the game options chosen by host
function makeJSON(amount, difficulty, category, toSendRoomCode){
    var myObj = {
        AMOUNT : amount, 
        DIFFICULTY : difficulty,
        CATEGORY : category,
        ROOMCODE : toSendRoomCode
    }
    var jsonValues = JSON.stringify(myObj);
    return jsonValues
}
//shuffles question answers so that the correct answer isnt in the same place every time
function shuffle(array) {
    var currentIndex = array.length
    var tempVal = 0
    var randInd = 0
    while (currentIndex !== 0) {
        randInd = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        tempVal = array[currentIndex]
        array[currentIndex] = array[randInd]
        array[randInd] = tempVal
    }
}
//show warning on client side, depending on the warning change gui
function setWarning(data) {
    $("#warning").text(data);
    console.log(data)
    if (data == "No such host exists" || data == "Make sure the room code is correct.") {
        incorrectJoin();
    }
    //Post host game button press
    //Warning, start game, room code
    if (data == "Questions loaded. Wait for some players to join!") {
        qsLoaded();
    }
    if (data == "You have joined a game. Wait for the host to begin.") {
        onJoinGame();
    }
    if (data == "Game started.") {
        onStartGame();
    }
    if (data == "Game Over.") {
        gameOverScreen();
        hostSocket.emit("KILL", {roomcode: getRoomCodeServer()})
    }
    setTimeout(function(){$("#warning").text("Warning");},5000);
}

//sets questions on the client's side
function setQuestion(question1) {
    shuffle(buttArr);
    $("#question").html(question1.question);
    $(buttArr[0]).html(question1.correct_answer);
    correctButton = buttArr[0];
    $(buttArr[1]).html(question1.incorrect_answers[0]);
    $(buttArr[2]).html(question1.incorrect_answers[1]);
    $(buttArr[3]).html(question1.incorrect_answers[2]);
}

//sets boolean questions on the client's side
function setQuestionBool(question1) {
    shuffle(boolArr)
    $("#question").html(question1.question)
    $(boolArr[0]).html(question1.correct_answer)
    correctButton = buttArr[1];
    $(boolArr[1]).html(question1.incorrect_answers[0])
}

//client side timer
function timer(delay) {
    console.log(delay)
    //delay of the counter set
    var timeLeft= delay;
    //a new countdown is started
    var countdown= setInterval(function(){
        //each second the countdown counts down and updates the client's timer
        timeLeft--
        $("#timer").html(timeLeft)
        console.log(timeLeft)
        //if timer hits 0 and a button was clicked
        if(timeLeft <= 0 && clicked==true){
            clearInterval(countdown) //stop countdown
            clicked=false; //set clicked back to false
        }
        //if timer hits 0 and no buttons were clicked
        else if(timeLeft <= 0 && clicked!=true){
            clearInterval(countdown) //stop countdown
            clientSocket.emit('answer', { answer: "", roomcode: getRoomCode()}); //send empty response for answer
        }
    },1000);
}
//hide user ui, change background img to loser and reset game
function loseGame() {
    hideAll()
    changeBackgroundResult(false)
    if($(window).width() <= 500){
        showBackground()
    }
    resetGame()
}
//hide user ui, change background img to winner and reset game
function winGame() {
    hideAll()
    changeBackgroundResult(true)
    if($(window).width() <= 500){
        showBackground()
    }
    resetGame()
}
//reset main game vars
function resetGame() {
    correctButton = "";
    clientSocket;
    hostSocket;
    username;
    clicked= false;
}
//sets up leaderboard on client side
function setLeaderboard(leaderboard) {
    //change leaderboard from array -> map (personal favourite)
    leaderboard= new Map(leaderboard)
    //empty the leaderboard each time it is updated
    $("#leaderboard").empty();
    //fill the leaderboard with users, also set their colour depending on their game state
    for(let [key,val] of leaderboard) {
        console.log("UPDATING LEADERBOARD")
        if(val!=true) {
            $("#leaderboard").append( $("<p class= 'users'></p>").text(key).css("color","red")); //append p element of user with red if that user lost
        }
        else {
            $("#leaderboard").append( $("<p class= 'users'></p>").text(key).css("color","blue")); //append p element of user with blue if they are still playing
        }
    }
}
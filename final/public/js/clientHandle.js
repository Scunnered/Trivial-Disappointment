//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var boolArr = ["#choice2", "#choice3"];
var correctButton = "";
var clientSocket;
var hostSocket;
var username;
var clicked= false;

$(document).ready(function() {
    //create sockets first. These are the same thing but creating two references means you can keep track later

    clientSocket = io();
    hostSocket = io();

    $("#hostGame").click(function(){
        hostSocket.emit("createHost", {roomcode: getRoomCodeServer(), selections: getSelections()})
    });
    $("#startGame").click(function(){
        hostSocket.emit('begin', { game: "started", roomcode: getRoomCodeServer()});
    });
    $("#joinGame").click(function(data){
        console.log(data)
        if (getUsername() === null) {
            clientSocket.emit('sendRoomCode', { roomcode: getRoomCode()});
        }
        else {
            clientSocket.emit('sendRoomCode', { roomcode: getRoomCode(), custUsername: getUsername()});
        }
    });

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

    hostSocket.on('timerStart', function(data) {
        console.log("Timer starting")
        timer(data);
    })

    //create all listeners
    //this one is listening for a "WARNING" that should be sent from your server

    hostSocket.on('WARNING', function (data) {
            console.log(data);
            setWarning(data);
    });

    hostSocket.on("setLeaderboard", function(data) {
        console.log("UPDATE LEADERBOARD")
        setLeaderboard(data);
    })

    clientSocket.on('joinGame', function (data) {
        console.log(data);
        username = data.username
        $("#username").html(username)
        console.log(clientSocket.id);
    });

    clientSocket.on('questionSent', function (question) {
        console.log(question)
        onShowQuestion();
        if (question.type === "boolean") {
            setQuestionBool(question);
        }
        else {
            setQuestion(question);
        }
        changeBackground(question.category)
    })
    
    clientSocket.on('timerStart', function(data) {
        console.log("Timer starting")
        timer(data);
    })

    clientSocket.on('loseGame', function () {
        loseGame();
        hideButtons()
    })

    clientSocket.on('resetGame', function() {
        resetGame();
    })

    clientSocket.on('winGame', function () {
        winGame();
        hideButtons()
    })
    clientSocket.on('WARNING', function (data) {
        console.log(data);
        setWarning(data);
    })
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

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var jsonFile = makeJSON(selectedAmount, selectedDiff, selectedCat);
    return jsonFile;
}

function getRoomCodeServer() {
    var hostRoomCodeWrong = $("#displayCode").text();
    var hostRoomCode = hostRoomCodeWrong.split(": ")[1];
    console.log(hostRoomCode)
    return hostRoomCode
}

function getRoomCode() {
    var clientRoomCode = $("#enteredCode").val();
    return clientRoomCode
}

function getUsername() {
    if (!$("#usernameInput").val()) {
        var custUsername = null;
    }
    else {
        var custUsername = $("#usernameInput").val();
    }
    return custUsername
}

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
    }
    setTimeout(function(){$("#warning").text("Warning");},5000);
}

function setQuestion(question1) {
    shuffle(buttArr);
    $("#question").html(question1.question);
    $(buttArr[0]).html(question1.correct_answer).show();
    correctButton = buttArr[0];
    $(buttArr[1]).html(question1.incorrect_answers[0]).show();
    $(buttArr[2]).html(question1.incorrect_answers[1]).show();
    $(buttArr[3]).html(question1.incorrect_answers[2]).show();
}

function setQuestionBool(question1) {
    shuffle(boolArr)
    $("#question").html(question1.question)
    $("#choice1").hide()
    $(boolArr[0]).html(question1.correct_answer)
    correctButton = buttArr[1];
    $(boolArr[1]).html(question1.incorrect_answers[0])
    $("#choice4").hide()
}

function timer(data) {
    var delay= data
    console.log(data)
    var timeLeft= delay;
    
    var countdown= setInterval(function(){
        timeLeft--
        $("#timer").html(timeLeft)
        console.log(timeLeft)
        if(timeLeft <= 0 && clicked==true){
            clearInterval(countdown) //stop countdown
            clicked=false;
        }
        else if(timeLeft <= 0 && clicked!=true){
            clearInterval(countdown)
            clientSocket.emit('answer', { answer: ""});
        }
    },1000);
}

function loseGame() {
    hideAll()
    changeBackgroundResult(false)
    resetGame()
}

function winGame() {
    hideAll()
    changeBackgroundResult(true)
    resetGame()
}

function resetGame() {
    correctButton = "";
    clientSocket;
    hostSocket;
    username;
    clicked= false;
}

function setLeaderboard(leaderboard) {
    leaderboard= new Map(leaderboard)
    
    $("#leaderboard").empty();
    for(let [key,val] of leaderboard) {
        console.log("UPDATING LEADERBOARD")
        if(val!=true) {
            $("#leaderboard").append( $("<p class= 'users'></p>").text(key).css("color","red"));
        }
        else {
            $("#leaderboard").append( $("<p class= 'users'></p>").text(key).css("color","blue"));
        }
    }
}
//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var boolArr = ["#choice2", "#choice3"];
var correctButton = "";
var clientSocket;
var hostSocket;
var username;
var clicked= false;


$(document).ready(function() {
    $("#hostGame").click(function(){
        hostSocket = io();
        hostSocket.on('getSelects', function (data) {
            hostSocket.emit('sendSelects', { selections: getSelections() });
        });
    });
    $("#startGame").click(function(){
        hostSocket.emit('begin', { game: "started"});
    });
    $("#joinGame").click(function(data){
        clientSocket = io();
        if (getUsername() === null) {
            clientSocket.emit('sendRoomCode', { roomCode: getRoomCode()});
        }
        else {
            clientSocket.emit('sendRoomCode', { roomCode: getRoomCode(), custUsername: getUsername()});
        }
        clientSocket.on('joinGame', function (data) {
            console.log(data);
            username = data.username
            $("#username").html(username)
            console.log(clientSocket.id);
        });
        clientSocket.on('questionSent', function (question) {
            if (question.type === "boolean") {
                setQuestionBool(question);
            }
            else {
                setQuestion(question);
            }
        })
        clientSocket.on('timerStart', function(data) {
            console.log("Timer starting")
            timer(data);
        })

        clientSocket.on('loseGame', function () {
            loseGame();
        })

        clientSocket.on('winGame', function () {
            winGame();
        })
    });
    $("#choice1").click(function(){
        clientSocket.emit('answer', { answer: $("#choice1").text()});
        clicked=true;
    });
    $("#choice2").click(function(){
        clientSocket.emit('answer', { answer: $("#choice2").text()});
        clicked=true;
    });
    $("#choice3").click(function(){
        clientSocket.emit('answer', { answer: $("#choice3").text()});
        clicked=true;
    });
    $("#choice4").click(function(){
        clientSocket.emit('answer', { answer: $("#choice4").text()});
        clicked=true;
    });
});

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var toSendRoomCode = roomCode;
    var jsonFile = makeJSON(selectedAmount, selectedDiff, selectedCat, toSendRoomCode);
    return jsonFile;
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

function setQuestion(question1) {
    shuffle(buttArr)
    $("#question").html(question1.question)
    $(buttArr[0]).html(question1.correct_answer);
    correctButton = buttArr[0];
    $(buttArr[1]).html(question1.incorrect_answers[0])
    $(buttArr[2]).html(question1.incorrect_answers[1])
    $(buttArr[3]).html(question1.incorrect_answers[2])
}

function setQuestionBool(question1) {
    shuffle(boolArr)
    $("#question").html(question1.question)
    $("#choice1").html("")
    $(boolArr[0]).html(question1.correct_answer)
    correctButton = buttArr[1];
    $(boolArr[1]).html(question1.incorrect_answers[0])
    $("#choice4").html("")
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
    $("#resultImg").attr("src", "images/Loser.jpg")
}

function winGame() {
    $("#resultImg").attr("src", "images/Winner.jpg")
}
//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var correctButton = "";
var clientSocket;
var hostSocket;

$(document).ready(function() {
    $("#hostGame").click(function(){
        hostSocket = io();
        hostSocket.on('getSelects', function (data) {
            console.log(data);
            console.log(hostSocket.id);
            hostSocket.emit('sendSelects', { selections: getSelections() });
        });
    });
    $("#startGame").click(function(){
        hostSocket.emit('begin', { game: "started"});
    });
    $("#joinGame").click(function(){
        clientSocket = io();
        clientSocket.on('joinGame', function (data) {
            console.log(data);
            console.log(clientSocket.id);
            clientSocket.emit('sendRoomCode', { roomCode: getRoomCode()});
        });
        clientSocket.on('questionSent', function (question) {
            console.log("Setting Questions")
            setQuestion(question);
        })
        clientSocket.on('loseGame', function () {
            loseGame();
        })
    });
    $("#choice1").click(function(){
        clientSocket.emit('answer', { answer: $("#choice1").text()});
    });
    $("#choice2").click(function(){
        clientSocket.emit('answer', { answer: $("#choice2").text()});
    });
    $("#choice3").click(function(){
        clientSocket.emit('answer', { answer: $("#choice3").text()});
    });
    $("#choice4").click(function(){
        clientSocket.emit('answer', { answer: $("#choice4").text()});
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
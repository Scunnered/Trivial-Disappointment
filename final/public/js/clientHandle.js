//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var boolArr = ["#choice2", "#choice3"];
var correctButton = "";
var clientSocket;
var hostSocket;

var username;

var db;

//this array contains all the usernames already generated, to avoid duplicates
var alreadyUsed = [];

$(document).ready(function() {
    //Dont know if the below is needed here or server.js Keeping it here for now
    MongoClient.connect(url, function(err, database){
        if(err) throw err;
        db = database;
        app.listen(8080);
    });
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
            if (question.type === "boolean") {
                console.log("BOOLEAN TYPE")
                setQuestionBool(question);
            }
            else {
                setQuestion(question);
            }
        })
        clientSocket.on('loseGame', function () {
            loseGame();
        })
        username = generateUsername()
        $("#username").html(username)
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

function setQuestionBool(question1) {
    shuffle(boolArr)
    $("#question").html(question1.question)
    $("#choice1").html("")
    $(boolArr[0]).html(question1.correct_answer)
    correctButton = buttArr[1];
    $(boolArr[1]).html(question1.incorrect_answers[0])
    $("#choice4").html("")
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
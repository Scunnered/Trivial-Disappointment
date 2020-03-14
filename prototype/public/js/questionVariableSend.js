//Variables
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"];
var correctButton = "";

$(document).ready(function() {
    console.log("we ready")
    $("#hostGame").click(function(){
        console.log(roomCode)
        var socket = io.connect();
        socket.on('getSelects', function (data) {
            console.log(data);
            console.log(socket.id);
            socket.emit('sendSelects', { selections: getSelections() });
        });
        generateRoomCode();
    });
});

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var jsonFile = makeJSON(selectedAmount, selectedDiff, selectedCat);
    return jsonFile;
}

function makeJSON(amount, difficulty, category){
    var myObj = {
        AMOUNT : amount, 
        DIFFICULTY : difficulty,
        CATEGORY : category
    }
    var jsonValues = JSON.stringify(myObj);
    return jsonValues
    //send(jsonValues)
}

function send(val) {
    console.log(val)
    $.ajax({
        type: "POST",
        url: "/Join_Host_Game.html",
        data: val,
        dataType: 'json',
        contentType : 'application/json',
        success: function(res) {
            console.log(res)
            setQuestion(res)
        }
    });
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
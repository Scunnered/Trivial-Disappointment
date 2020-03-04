var response = null;
var qCount;
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"]
var correctButton = "";
var url1 = "";
var globAmount = 0;

$(document).ready(function() {
    $("#retrieve-resources").click(function() {
        var displayResources = $("#display-resources")
        displayResources.html("Loading data from JSON source...")
        url1 = createURL()
        $.ajax({
            type: "GET",
            url: url1,
            success: function(result) {
                console.log("Response Code: " + result.response_code)
                if (result.response_code == 0) {
                    response = result.results;
                    displayResources.html("Loaded")
                    qCount = -1;
                    nextQ()
                }
            }
        })
    })
    $("#next").click(function(){
        nextQ()
    });
    $("#choice1").click(function(){
        findCorrect("#choice1")
    });
    $("#choice2").click(function(){
        findCorrect("#choice2")
    });
    $("#choice3").click(function(){
        findCorrect("#choice3")
    });
    $("#choice4").click(function(){
        findCorrect("#choice4")
    });
})

function setQuestion(counter) {
    res = response[counter]
    shuffle(buttArr)
    $("#question").html(res.question)
    $(buttArr[0]).html(res.correct_answer);
    correctButton = buttArr[0];
    $(buttArr[1]).html(res.incorrect_answers[0])
    $(buttArr[2]).html(res.incorrect_answers[1])
    $(buttArr[3]).html(res.incorrect_answers[2])
}

function nextQ() {
    if (response !== null && qCount < globAmount-1) {
        if (qCount < globAmount) {
            qCount += 1;
        }
        setQuestion(qCount)
    }
    $("#result").html("Answer:<br></br>")
}

function findCorrect(buttonName) {
    if (buttonName === correctButton) {
        $("#result").html("Answer:<br></br>True")
    }
    else {
        $("#result").html("Answer:<br></br>False")
    }
}

function createURL() {
    var url1 = "https://opentdb.com/api.php"
    var selectedAmount = $("#amount").children("option:selected").val();
    globAmount = selectedAmount;
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    var amount = "?amount=" + selectedAmount;
    url1 = url1 + amount;
    if (selectedCat !== 0) {
        var category = "&category=" + selectedCat;
        url1 = url1 + category
    }
    var difficulty = "&difficulty=" + selectedDiff;
    url1 = url1 + difficulty;
    url1 = url1 + "&type=multiple";
    //$("#url").html(url1)
    return url1;
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
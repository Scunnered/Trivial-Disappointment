var response = null;
var qCount;
var buttArr = ["#choice1", "#choice2", "#choice3", "#choice4"]
var correctButton = "";
var url1 = "";

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
    //console.log(res.category)
    $(buttArr[0]).html(res.correct_answer);
    correctButton = buttArr[0];
    $(buttArr[1]).html(res.incorrect_answers[0])
    $(buttArr[2]).html(res.incorrect_answers[1])
    $(buttArr[3]).html(res.incorrect_answers[2])
}

function nextQ() {
    if (response !== null && qCount < 8) {
        if (qCount < 9) {
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
    var url1 = "https://opentdb.com/api.php?amount=10"
    var selectedVal = $("#categories").children("option:selected").val();
    if (selectedVal !== 0) {
        var category = "&category=" + selectedVal;
        url1 = url1 + category
    }
    url1 = url1 + "&type=multiple";
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
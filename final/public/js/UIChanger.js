
$(document).ready(function() {
    $(".hostSelects").hide();
    $("#question").hide()
    $("#timer").hide()
    $("#username").hide()
    hideButtons();
    $("#hostGameShow").click(function(){
        $(".clientSelects").hide();
        $("#hostGameShow").hide();
        $(".hostSelects").show();
        $("#startGame").hide();
    })

    $("#addUser").click(function() {
        for(let i = 0; i < 27; i++) {
            $("#usersWrapper").append($("<p id = 'users'></p>").text("User").css("color","blue").css('display','inline-block'));
        }
        
    })

    $("#joinGame").click(function() {
        onJoinGame();
    })

    $("#hostGame").click(function() {
        $("#hostGame").hide();
        $("#startGame").show();
    })

    $("#startGame").click(function() {
        $(".hostSelects").hide();
        $("#question").show();
    })
})

function onJoinGame() {
    $("#username").show()
    $(".hostSelects").hide();
    $("#hostGame").hide();
    $("#hostGameShow").hide();
    $("#usernameInput").hide();
    $("#enteredCode").hide();
    $("#joinGame").hide();
    $("#warning").show();
}

function onShowQuestion() {
    showButtons();
    $("#question").show();
    $("#timer").show();
}

function hostUI() {
    hideButtons();
    $("#username").html("<br></br>").show()
}

function showJoinGameButtons() {
    hideButtons();
    $("#usernameInput").show();
    $("#enteredCode").show();
    $("#joinGame").show();
}

function hideButtons() {
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
}

function hideAll() {
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
    $("#question").hide();
    $("#timer").hide();
}

function showButtons() {
    $("#choice1").show();
    $("#choice2").show();
    $("#choice3").show();
    $("#choice4").show();
}
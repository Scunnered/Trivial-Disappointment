
$(document).ready(function() {
    $(".hostSelects").hide();
    $("#question").hide()
    $("#timerWrapper").hide()
    $("#username").hide()
    hideButtons();
    $("#hostGameShow").click(function(){
        $(".clientSelects").hide();
        $("#hostGameShow").hide();
        $(".hostSelects").show();
        $("#startGame").hide();
    })

    $("#addUser").click(function() {
        onJoinGame()
        onShowQuestion()
        for(let i = 0; i < 100; i++) {
            $("#leaderboard").append($("<p class = 'users'></p>").text("Username10").css("color","blue").css('display','inline-block'));
        }
    })

})

function onStartGame() {
    $(".hostSelects").hide();
    $("#question").show();
    $("#warning").css({"margin": "41.7% 0% 2% 10%"} );
    $("#leaderboard").css({"margin": "8% 2% 2% 2%", "font-size": "150%"} );
}

function onJoinGame() {
    $("#username").show()
    $(".hostSelects").hide();
    $("#hostGameShow").hide();
    $("#leaderboard").hide()
    $("#usernameInput").hide();
    $("#enteredCode").hide();
    $("#joinGame").hide();
    $("#warning").show();
    $("#warning").css({"margin": "55% 0% 2% 10%"} );
}

function qsLoaded() {
    $("#username").hide()
    $("#hostGame").hide();
    $(".hostSelects").hide();
    $("#displayCode").show()
    $("#warning").show()
    $("#startGame").show()
    $("#startGame").css({"width":"80%", "margin": "0% 2% 2% 10%"} );
}

function gameOverScreen() {
    gameOver();
    $("#question").hide();
    $("#timerWrapper").hide();
}

function onShowQuestion() {
    $("#warning").css({"margin": "4.2% 0% 2% 10%"} );
    $("#timerWrapper").css({"margin": "10% 0% 2% 10%", "position": "absolute"} );
    $("#question").css({"margin": "15% 2% 2% 2%"} );
    $("#timerWrapper").show()
    showButtons();
    $("#question").show();
}

function hostUI() {
    hideButtons();
    $("#timerWrapper").show();
}

function incorrectJoin() {
    hideButtons();
    $("#username").hide();
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
    $("#warning").hide();
    $("#username").hide();
}

function showButtons() {
    $("#choice1").show();
    $("#choice2").show();
    $("#choice3").show();
    $("#choice4").show();
}

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

    $("#showNormal").click(function() {
        onJoinGame()
        onShowQuestion()
    })

    $("#showBool").click(function() {
        onJoinGame()
        onShowQuestionBool()
    })


})

function onStartGame() {
    $(".hostSelects").hide();
    $("#question").show();
    $("#warning").css({"margin": "35% 0% 2% 10%"} );
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
    if($(window).width() <= 500){
        $("#warning").css({"margin": "16% 2.5% 2% 2.5%"} );
    }
    else {
        $("#warning").css({"margin": "47% 0% 2% 10%"} );
    }
    
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
    if($(window).width() <= 500){
        $("#username").css({"position": "absolute", "margin": "13% 2% 4% 2%", "text-align":"left"} )
        $("#warning").css({"margin": "0% 2.5% 2% 2.5%"} );
        $("#questionWrapper").css({"display": "inline"})
        $("#choice2").css({"margin-top": "2%"} );
    }
    else if($(window).width() <= 890 && $(window).width() >= 500){
        $("#warning").css({"margin": "0% 0% 2% 10%"} );
        $("#choice2").css({"margin-top": "2%"} );
        $("#question").css({"margin": "2% 2% 2% 2%"} );
    }
    else{
        $("#warning").css({"margin": "2.5% 0% 2% 10%"} );
        $("#timerWrapper").css({"margin": "10% 0% 2% 10%", "position": "absolute"} );
        $("#question").css({"margin": "2% 2% 2% 2%"} );
    }
    $("#timerWrapper").show()
    showButtons();
    $("#question").show();
}

function onShowQuestionBool() {
    showBoolButtons()
    console.log($(window).width() <= 500)
    if($(window).width() <= 500){
        $("#username").css({"position": "absolute", "margin": "13% 2% 4% 2%", "text-align":"left"} )
        $("#warning").css({"margin": "0% 2.5% 2% 2.5%"} );
        $("#questionWrapper").css({"display": "inline", "margin": "10% 0% 9% 5%"})
        $("#choice2").css({"margin-top": "9%"} );
    }
    else {
        $("#choice2").css({"margin": "10% 0% 2% 5%"} );
        $("#choice3").css({"margin": "4% 0% 2% 5%"} );
        $("#warning").css({"margin": "9.8% 0% 2% 10%"} );
        $("#timerWrapper").css({"margin": "10% 0% 2% 10%", "position": "absolute"} );
        $("#question").css({"margin": "15% 2% 0% 2%"} );
    }
    $("#timerWrapper").show()
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

function showBackground() {
    $("#backgroundImg").show();
}

function hideButtons() {
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
}

function hideAll() {
    $(".clientSelects").hide();
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
    $("#question").hide();
    $("#timerWrapper").hide();
    $("#warning").hide();
    $("#username").hide();
}

function showButtons() {
    $("#choice1").show();
    $("#choice2").show();
    $("#choice3").show();
    $("#choice4").show();
}

function showBoolButtons() {
    $("#choice1").hide()
    $("#choice2").show()
    $("#choice3").show()
    $("#choice4").hide()
}
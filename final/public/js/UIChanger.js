//Hides GUI elements when page is loaded
$(document).ready(function() {
    $(".hostSelects").hide();
    $("#question").hide()
    $("#timerWrapper").hide()
    $("#username").hide()
    hideButtons();
    //function for when host game button is pressed
    $("#hostGameShow").click(function(){
        $(".clientSelects").hide();
        $("#hostGameShow").hide();
        $(".hostSelects").show();
        $("#startGame").hide();
    })
    
})

//Hides and shows GUI elements when a game is started on the host side
function onStartGame() {
    $(".hostSelects").hide();
    $("#question").show();
    $("#warning").css({"margin": "35% 0% 2% 10%"} );
    $("#leaderboard").css({"margin": "8% 2% 2% 2%", "font-size": "150%"} );
}

//Hides and shows GUI elements when user joins game
function onJoinGame() {
    $("#username").show()
    $(".hostSelects").hide();
    $("#hostGameShow").hide();
    $("#leaderboard").hide()
    $("#usernameInput").hide();
    $("#enteredCode").hide();
    $("#joinGame").hide();
    $("#warning").show();
    //Modifies CSS elements of certain elements when joining game based on screen size
    if($(window).width() <= 500){
        $("#warning").css({"margin": "16% 2.5% 2% 2.5%"} );
    }
    else {
        $("#warning").css({"margin": "47% 0% 2% 10%"} );
    }
}

//Hides and shows GUI elements when a game is hosted
function qsLoaded() {
    $("#username").hide()
    $("#hostGame").hide();
    $(".hostSelects").hide();
    $("#displayCode").show()
    $("#warning").show()
    $("#startGame").show()
    //Modifies CSS elements of certain elements when joining game based on screen size
    $("#startGame").css({"width":"80%", "margin": "0% 2% 2% 10%"} );
}

//Hides and shows GUI elements when a game ends
function gameOverScreen() {
    gameOver();
    $("#question").hide();
    $("#timerWrapper").hide();
    $("#warning").css({"margin-top":"50%"})
}

//Hides and shows GUI elements when questions are given to players
function onShowQuestion() {
    //Modifies CSS elements of certain elements when joining game based on screen size
    if($(window).width() <= 500){
        $("#username").css({"position": "absolute", "margin": "7% 2% 4% 2%", "text-align":"left"} )
        $("#warning").css({"margin": "0% 2.5% 2% 2.5%"} );
        $("#questionWrapper").css({"display": "inline"})
        $("#choice2").css({"margin-top": "2%"} );
        $("button").css({"margin-left": "2.4%"});
        $("question").css({"margin-left": "0%"});
        $("#warning").css({"margin-left": "2.4%"} );

    }
    else if($(window).width() <= 890){
        $("#warning").css({"margin": "0% 0% 2% 10%"} );
        $("#choice2").css({"margin": "2% 6% 0% 6%"} );
        $("#choice3").css({"margin": "2% 6% 0% 6%"} );
        $("#question").css({"margin": "2% 2% 2% 2%"} );
        $("#timerWrapper").css({"margin": "3% 0% 2% 10%"} ); 
        $("#warning").css({"margin": "0% 0% 2% 10%"} );       
        $("#questionWrapper").css({"margin": "15% 0% 2% 0%"})
    }
    else{
        $("#choice2").css({"margin": "2% 6% 0% 6%"} );
        $("#choice3").css({"margin": "2% 6% 0% 6%"} );
        $("#warning").css({"margin": "0.5% 0% 2% 10%"} );
        $("#timerWrapper").css({"margin": "10% 0% 2% 10%"} );
        $("#question").css({"margin": "2% 2% 2% 2%"} );
        $("#questionWrapper").css({"margin": "0% 0% 0% 0%"} );
    }
    $("#timerWrapper").show()
    showButtons();
    $("#question").show();
}

//Hides and shows GUI elements when true or false questions are given to players
function onShowQuestionBool() {
    showBoolButtons()
    //Modifies CSS elements of certain elements when joining game based on screen size
    if($(window).width() <= 500){
        $("#username").css({"position": "absolute", "margin": "7% 2% 4% 2%", "text-align":"left"} )
        $("#warning").css({"margin": "0% 2.5% 2% 2.5%"} );
        $("#questionWrapper").css({"display": "inline", "margin": "10% 0% 9% 0%"})
        $("#choice2").css({"margin-top": "9%"} );
        $("button").css({"margin-left": "2.4%"});
        $("question").css({"margin-left": "0%"});
        $("#warning").css({"margin-left": "2.4%"} );
    }
    else if($(window).width() <= 890){
        $("#warning").css({"margin": "0% 0% 2% 10%"} );
        $("#choice2").css({"margin": "9% 0% 2% 5%"} );
        $("#choice3").css({"margin": "4% 0% 2% 5%"} );
        $("#question").css({"margin": "2% 2% 2% 2%"} );
        $("#timerWrapper").css({"margin": "3% 0% 2% 10%"} );
        $("#warning").css({"margin": "5.8% 0% 2% 10%"} );
        $("#questionWrapper").css({"margin": "15% 0% 2% 0%"})
    }
    else {
        $("#choice2").css({"margin": "10% 0% 2% 5%"} );
        $("#choice3").css({"margin": "4% 0% 2% 5%"} );
        $("#warning").css({"margin": "4.4% 0% 2% 10%"} );
        $("#timerWrapper").css({"margin": "10% 0% 2% 10%"} );
        $("#question").css({"margin": "2% 2% 0% 2%"} );
        $("#questionWrapper").css({"margin": "0% 0% 0% 0%"} );
    }
    $("#timerWrapper").show()
    $("#question").show();
}

//
function hostUI() {
    hideButtons();
    $("#timerWrapper").show();
}

//Hides and shows GUI elements when player does not join game properly
function incorrectJoin() {
    hideButtons();
    $("#username").hide();
    $("#usernameInput").show();
    $("#enteredCode").show();
    $("#joinGame").show();
}

//shows background again if it was hidden
function showBackground() {
    $("#backgroundImg").show();
}

//Hides the question answer buttons
function hideButtons() {
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
}

//hides all game GUI elements, leaving background element only
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

//Shows the question answer buttons
function showButtons() {
    $("#choice1").show();
    $("#choice2").show();
    $("#choice3").show();
    $("#choice4").show();
}

//Shows 2 question answer buttons in case of a true or false question
function showBoolButtons() {
    $("#choice1").hide()
    $("#choice2").show()
    $("#choice3").show()
    $("#choice4").hide()
}
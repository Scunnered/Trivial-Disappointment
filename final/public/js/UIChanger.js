
$(document).ready(function() {
    $(".hostSelects").hide();
    hideButtons();
    $("#hostGameShow").click(function(){
        $(".clientSelects").hide();
        $("#hostGameShow").hide();
        $(".hostSelects").show();
        $("#startGame").hide();
    })
    $("#joinGame").click(function(){
        $(".hostSelects").hide();
        $("#hostGame").hide();
        $("#hostGameShow").hide();
        showButtons();
        $("#usernameInput").hide();
        $("#enteredCode").hide();
        $("#joinGame").hide();
    })

    $("#hostGame").click(function() {
        $("#hostGame").hide();
        $("#startGame").show();
    })

    $("#startGame").click(function() {
        $(".hostSelects").hide();
    })
})

function showJoinGameButtons() {
    $(".hostSelects").show();
    $("#hostGame").show();
    $("#hostGameShow").show();
    hideButtons();
    $("#usernameInput").show();
    $("#enteredCode").show();
    $("#joinGame").show();
}

function hideButtons () {
    $("#choice1").hide();
    $("#choice2").hide();
    $("#choice3").hide();
    $("#choice4").hide();
}

function showButtons () {
    $("#choice1").show();
    $("#choice2").show();
    $("#choice3").show();
    $("#choice4").show();
}

function disableHostButtons() {
    $("choice1").prop('disabled', true)
    $("choice2").prop('disabled', true)
    $("choice3").prop('disabled', true)
    $("choice4").prop('disabled', true)
}
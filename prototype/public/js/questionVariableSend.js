$(document).ready(function() {
    $("#startGame").click(function(){
        getSelections();
    });
});

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    makeJSON(selectedAmount, selectedDiff, selectedCat);
}

function makeJSON(amount, difficulty, category){
    var myObj = {
        AMOUNT : amount, 
        DIFFICULTY : difficulty,
        CATEGORY : category
    }
    var jsonValues = JSON.stringify(myObj);
    send(jsonValues)
}

function send(val) {
    $.ajax({
        type: "POST",
        url: "/Join_Host_Game.html",
        data: val,
        dataType: 'json',
        contentType : 'application/json',

        success: function(res) {console.log(res)}
    });
}
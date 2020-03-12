$(document).ready(function() {
    console.log("in ready")
    $("#startGame").click(function(){
        console.log("in send file")
        getSelections();
    });
});

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    console.log("in getselects")
    makeJSON(selectedAmount, selectedDiff, selectedCat);
}

function makeJSON(amount, difficulty, category){
    var myObj = new Object();
    myObj.amount = amount;
    myObj.difficulty = difficulty;
    myObj.category = category;
    var jsonValues = JSON.stringify(myObj);
    console.log("in make json")
    send(jsonValues)
}

function send(val) {
    console.log("in send funct")
    console.log(val)
    $.ajax({
        type: "POST",
        url: "/Join_Host_Game.html",
        data: val,
        dataType: 'json',

        success: function() {alert('sucess');}
    });
}
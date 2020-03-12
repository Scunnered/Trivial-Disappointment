import { json } from "body-parser";

$("#startGame").click(function(){
    getSelections();
});

function getSelections() {
    var selectedAmount = $("#amount").children("option:selected").val();
    var selectedCat = $("#categories").children("option:selected").val();
    var selectedDiff = $("#difficulty").children("option:selected").val();
    makeJSON(selectedAmount, selectedDiff, selectedCat);
}

function makeJSON(amount, difficulty, category){
    var myObj = new Object();
    myObj.amount = amount;
    myObj.difficulty = difficulty;
    myObj.category = category;
    var jsonValues = JSON.stringify(myObj);
    send(jsonValues)
}

function send(val) {
    $.ajax({
        type: "POST",
        url: "/getUrl",
        data: jsonValues,
        success: function() {alert('sucess');}
    });
}
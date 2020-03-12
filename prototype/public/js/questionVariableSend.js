import { json } from "body-parser";

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
    var myObj = {
        AMOUNT : amount, 
        DIFFICULTY : difficulty,
        CATEGORY : category
    }
    var jsonValues = JSON.stringify(myObj);
    console.log("in make json")
    console.log(jsonValues)
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
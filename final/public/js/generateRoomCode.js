//Variable for the room code generator
var roomCode = 0;

//This runs the generate room code function every time the page is loaded
$(document).ready(function() {
    generateRoomCode()
})

//This creates the room code (from 100000 to 999999) for the game.
function generateRoomCode() {
    roomCode = (Math.round(Math.random() * 900000) + 100000)
    $("#displayCode").html("Room Code: " + roomCode)
}

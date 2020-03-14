var roomCode = 0;

$(document).ready(function() {
    generateRoomCode()
})

function generateRoomCode() {
    roomCode = Math.round(Math.random() * 1000000)
    console.log("Room Code: " + roomCode)
    var code = $("#displayCode")
    code.html("Room Code: " + roomCode)
}
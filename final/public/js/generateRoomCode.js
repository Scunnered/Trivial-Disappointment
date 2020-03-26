var roomCode = 0;

$(document).ready(function() {
    generateRoomCode()
})

function generateRoomCode() {
    roomCode = Math.round(Math.random() * 1000000)
    var code = $("#displayCode")
    code.html("Room Code: " + roomCode)
}

/* Will pull in random 7 digit code for unique room ID */

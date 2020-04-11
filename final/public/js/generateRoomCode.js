var roomCode = 0;

$(document).ready(function() {
    generateRoomCode()
})

function generateRoomCode() {
    roomCode = (Math.round(Math.random() * 900000) + 100000)
    var code = $("#displayCode").html("Room Code: " + roomCode)
}

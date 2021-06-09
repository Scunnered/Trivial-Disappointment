//THIS REQUIRES "npm install express, npm install socket.io, npm install request, npm install html-entities"
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Host = require('./host')
var db = null;
var hosts = new Map();

app.use(express.static('public'))

server.listen(8080); //listens on host 8080

io.on('connection', function (socket) {
    socket.on("createHost", function (data) { //This creates a host and sdisplays string
        console.log(data)
        console.log(data.roomcode)
        hosts.set(data.roomcode.toString(), new Host(data.roomcode, data.selections, socket, db))
        console.log(hosts)
        hosts.get(data.roomcode).start();
    })
    socket.on('sendRoomCode', function (data) {
        if (hosts.get(data.roomcode) == undefined) {
            console.log("Room code issues")
            console.log(data.roomcode)
            socket.emit("WARNING", "Make sure the room code is correct."); //displays a warning if room code is wrong
        }
        else {
            hosts.get(data.roomcode).sendRoomCode(data, socket, io);
        }
    })
    socket.on('begin', function (data) {
        if (hosts.get(data.roomcode) !== undefined) {
            hosts.get(data.roomcode).begin(io); //starts begin function
        }
    })
    socket.on('answer', function (data) {
        if (hosts.get(data.roomcode) !== undefined) {
            hosts.get(data.roomcode).answer(data.answer, socket, io);
        }
    })
    socket.on("KILL", function (data) {
        console.log("Killing Server: " + data.roomcode)
        hosts.delete(data.roomcode);
    })
    socket.on("connectionTest", function (data) {
        console.log("Testing Connections")
        socket.emit("connection", "The server is working!");
    })
})
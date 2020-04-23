//THIS REQUIRES "npm install express, npm install socket.io, npm install mongodb, npm install request, npm install html-entities"
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Host = require('./Host')

var hosts = new Map();

//app.use(bodyParser.json());
app.use(express.static('public'))

server.listen(8080);

//Result:
//It works, no changes in the questions not being sent through the first time though. 
//The host game button still needs to be pressed twice to work. 
io.on('connection', function (socket) {
    socket.on("createHost", function (data) {
        console.log(data)
        console.log(data.roomcode)
        hosts.set(data.roomcode.toString(), new Host(data.roomcode, data.selections, socket))
        console.log(hosts)
        hosts.get(data.roomcode).start();
    })
    socket.on('sendRoomCode', function (data) {
        hosts.get(data.roomcode).sendRoomCode(data, socket, io);
    })
    socket.on('begin', function (data) {
        hosts.get(data.roomcode).begin(data, io);
    })
    socket.on('answer', function (data) {
        hosts.get(data.roomcode).answer(data, socket, io);
    })
})
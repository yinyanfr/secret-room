const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const parse = require("url-parse")

const getRoom = url => parse(url).pathname.split("/")[1]

io.on("connection", socket => {
    const room = getRoom(socket.handshake.headers.referer)

    socket.join(room)

    socket.on("send", msg => {
        io.in(room).emit("receive", msg)
    })
})

http.listen(20204)

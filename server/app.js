const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const json = bodyParser.json()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const parse = require("url-parse")
const path = require("path")

const getRoom = url => parse(url).pathname.split("/")[1]

io.on("connection", socket => {
    const room = getRoom(socket.handshake.headers.referer)

    socket.join(room)

    socket.on("send", msg => {
        io.in(room).emit("receive", msg)
    })
})

app.post("/img", json, (req, res) => {
    const room = getRoom(req.headers.referer)
    const {msg} = req.body
    console.log(msg.type)
    io.in(room).emit("receive", msg)
})

app.use(express.static(path.join(__dirname, "build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"))
})

http.listen(20204)

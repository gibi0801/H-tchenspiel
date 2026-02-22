const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let hider = null;
let guesser = null;
let ball = null;
let score = { guesser: 0, hider: 0 };

io.on("connection", (socket) => {

  socket.emit("score", score);

  socket.on("join", (role) => {
    if (role === "hider" && !hider) {
      hider = socket.id;
      socket.emit("role", "hider");
    }

    if (role === "guesser" && !guesser) {
      guesser = socket.id;
      socket.emit("role", "guesser");
    }
  });

  socket.on("hide", (pos) => {
    if (socket.id !== hider) return;

    ball = Number(pos);

    if (guesser) {
      io.to(guesser).emit("ready");
    }
  });

  socket.on("guess", (pos) => {
    if (socket.id !== guesser) return;
    if (ball === null) return;

    const win = Number(pos) === ball;

    if (win) score.guesser++;
    else score.hider++;

    io.emit("score", score);
    io.emit("result", win ? "🎉 Richtig!" : "❌ Falsch!");

    ball = null;
  });

  socket.on("disconnect", () => {
    if (socket.id === hider) {
      hider = null;
      ball = null;
    }
    if (socket.id === guesser) {
      guesser = null;
      ball = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server läuft auf Port", PORT);
});

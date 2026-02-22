const socket = io();

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const btnHider = document.getElementById("btnHider");
const btnGuesser = document.getElementById("btnGuesser");
const btnChangeRole = document.getElementById("btnChangeRole");

const menuMsg = document.getElementById("menuMsg");
const info = document.getElementById("info");
const scoreText = document.getElementById("score");

let role = null;
let hidden = null;


btnHider.onclick = () => join("hider");
btnGuesser.onclick = () => join("guesser");
btnChangeRole.onclick = () => {

  role = null;
  hidden = null;
  menuMsg.textContent = "";
  info.textContent = "Warte…";

  game.classList.add("hidden");
  menu.classList.remove("hidden");
};

function join(r) {
  menuMsg.textContent = "Verbinde…";
  socket.emit("join", r);
}

socket.on("role", (r) => {
  role = r;

  menu.classList.add("hidden");
  game.classList.remove("hidden");

  if (role === "hider") {
    info.textContent = "Du bist Verstecker: Klicke ein Hütchen zum Verstecken.";
  } else {
    info.textContent = "Du bist Rater: Warte bis versteckt wurde.";
  }
});

socket.on("score", (s) => {
  const g = Number(s?.guesser ?? 0);
  const h = Number(s?.hider ?? 0);
  scoreText.textContent = `${g} : ${h}`;
});

socket.on("ready", () => {
  if (role === "guesser") {
    info.textContent = "Hütchen werden gemischt...";
    startShuffle();

    setTimeout(() => {
      stopShuffle();
      info.textContent = "Rate wo der Ball ist!";
    }, 2000);
  }
});

socket.on("result", (msg) => {
  reveal();
  setTimeout(() => alert(msg), 300);

  if (role === "hider") info.textContent = "Neue Runde: Verstecke den Ball!";
  if (role === "guesser") info.textContent = "Neue Runde: Warte...";
});


document.querySelectorAll(".cup").forEach(cup => {
  cup.onclick = () => {
    const id = Number(cup.dataset.id);
    if (!role) return;

    if (role === "hider") {
      hidden = id;
      socket.emit("hide", id);
      info.textContent = "Ball versteckt!";
    }

    if (role === "guesser") {
      socket.emit("guess", id);
      info.textContent = "Du hast geraten!";
    }
  };
});

function reveal() {
  if (hidden === null) return;

  const cup = document.querySelector(`[data-id='${hidden}']`);
  if (!cup) return;

  cup.classList.add("reveal");

  const ball = document.createElement("div");
  ball.className = "ball";
  cup.appendChild(ball);

  setTimeout(() => {
    cup.classList.remove("reveal");
    cup.innerHTML = "";
    hidden = null;
  }, 1500);
}

function startShuffle() {
  document.querySelectorAll(".cup").forEach(c => c.classList.add("shuffle"));
}

function stopShuffle() {
  document.querySelectorAll(".cup").forEach(c => c.classList.remove("shuffle"));
}

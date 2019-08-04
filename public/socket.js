let socket = io.connect(`http://localhost:5555`); // Or https://pykengine.io on prod ENV

// Lunch the game
function init() {
  // draw canvas elements
  draw()
  // send player name to the server that will be used to generate player data and config
  socket.emit("init", {
    playerName: player.name
  });
}

// on server respond, fetch viruses datas for client side puposes (draw())
socket.on("initReturn", data => {
  viruses = data.viruses;
  // send player position to the server every frame 60 time a second (for the server to update players position, prevent hack)
  setInterval(() => {
    if (player.xVector) {
      socket.emit("tick", {
        xVector: player.xVector,
        yVector: player.yVector
      });
    }
  }, 1000 / 60);
});

// fetch updated players data from the server
socket.on("tock", data => {
  players = data.players;
});

// Fetch updated viruses data (when a new virus is created)
socket.on("virusSwitch", data => {
  viruses.splice(data.virusIndex, 1, data.newVirus);
});

// fetch updated players position
socket.on("tickTock", data => {
  player.locX = data.playerX;
  player.locY = data.playerY;
});

// Fetch players score and manage DOM
socket.on("updateLeaderBoard", (data) => {
  document.querySelector(".leader-board").innerHTML = ""
  data.forEach((curPlayer) => {
    document.querySelector(".leader-board").innerHTML += `
    <li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>
    `
  });
})

// Fetch player data (on a player deth) and manage DOM
socket.on("playerDeath", (data) => {
  document.querySelector('#game-message').innerHTML = `The life of ${data.died.name} has been tragically removed by ${data.killedBy.name}`
  $("#game-message").css({
    "background-color": "#00e6e6",
    "opacity": 1
  });
  $("#game-message").show();
  $("#game-message").hide(5000);
})

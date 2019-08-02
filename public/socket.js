let socket = io.connect(`http://localhost:5555`);

function init() {
  draw()
  socket.emit("init", {
    playerName: player.name
  });
}

socket.on("initReturn", data => {
  viruses = data.viruses;
  setInterval(() => {
    if (player.xVector) {
      socket.emit("tick", {
        xVector: player.xVector,
        yVector: player.yVector
      });
    }
  }, 1000 / 60);
});

socket.on("tock", data => {
  players = data.players;
});

socket.on("virusSwitch", data => {
  viruses.splice(data.virusIndex, 1, data.newVirus);
});

socket.on("tickTock", data => {
  player.locX = data.playerX;
  player.locY = data.playerY;
});

socket.on("updateLeaderBoard", (data) => {
  document.querySelector(".leader-board").innerHTML = ""
  document.querySelector(".player-score").innerHTML = ""
  data.forEach((curPlayer) => {
    document.querySelector(".leader-board").innerHTML += `
    <li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>
    `
    document.querySelector(".player-score").innerHTML += `
    ${curPlayer.score}
    `
  });
})

socket.on("playerDeath", (data) => {
  document.querySelector('#game-message').innerHTML = `The life of ${data.died.name} has been tragically removed by ${data.killedBy.name}`
  $("#game-message").css({
    "background-color": "#00e6e6",
    "opacity": 1
  });
  $("#game-message").show();
  $("#game-message").hide(5000);
})
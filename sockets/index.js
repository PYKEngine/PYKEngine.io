const mongoose = require("mongoose")
const io = require("../server").io;
require("../models/LeaderBoard");
const checkForVirusCollisions = require("./collisions").checkForVirusCollisions;
const checkForPlayerCollisions = require("./collisions")
  .checkForPlayerCollisions;

const Player = require("./classes/Player");
const PlayerData = require("./classes/PlayerData");
const PlayerConfig = require("./classes/PlayerConfig");
const Virus = require("./classes/Virus");
const LB = mongoose.model("leaderBoard");
let viruses = [];
players = [];
let settings = {
  defaultViruses: 1000,
  defaultSpeed: 6,
  defaultSize: 6,
  defaultZoom: 1.5,
  worldWidth: 5000,
  worldHeight: 5000
};

initGame();

setInterval(() => {
  if (players.length > 0) {
    io.to("game").emit("tock", {
      players
    });
  }
}, 1000 / 60);

io.sockets.on("connect", socket => {
  let player = {};
  socket.on("init", data => {
    socket.join("game");
    let playerConfig = new PlayerConfig(settings);
    let playerData = new PlayerData(data.playerName, settings);
    player = new Player(socket.id, playerConfig, playerData);
    setInterval(() => {
      socket.emit("tickTock", {
        playerX: player.playerData.locX,
        playerY: player.playerData.locY
      });
    }, 1000 / 60);
    socket.emit("initReturn", {
      viruses
    });
    players.push(playerData);
  });
  socket.on("tick", data => {
    speed = player.playerConfig.speed;
    xV = player.playerConfig.xVector = data.xVector;
    yV = player.playerConfig.yVector = data.yVector;

    if (
      (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
      (player.playerData.locX > settings.worldWidth && xV > 0)
    ) {
      player.playerData.locY -= speed * yV;
    } else if (
      (player.playerData.locY < 5 && yV > 0) ||
      (player.playerData.locY > settings.worldHeight && yV < 0)
    ) {
      player.playerData.locX += speed * xV;
    } else {
      player.playerData.locX += speed * xV;
      player.playerData.locY -= speed * yV;
    }
    let capturedVirus = checkForVirusCollisions(
      player.playerData,
      player.playerConfig,
      viruses,
      settings
    );
    capturedVirus
      .then(data => {
        const virusData = {
          virusIndex: data,
          newVirus: viruses[data]
        };
        io.sockets.emit("updateLeaderBoard", getLeaderBoard());
        io.sockets.emit("virusSwitch", virusData);
      })
      .catch(() => {});
    let playerDeath = checkForPlayerCollisions(
      player.playerData,
      player.playerConfig,
      players,
      player.socketId
    );
    playerDeath.then(data => {
      io.sockets.emit("updateLeaderBoard", getLeaderBoard());
      io.sockets.emit("playerDeath", data)
    }).catch(() => {
      // No player collision
    });
  });
  socket.on("disconnect", (data) => {
    // updateLocalLeaderBoard(player.playerData.name)
    if (player.playerData) {
      players.forEach((currPlayer, i) => {
        if (currPlayer.uid == player.playerData.uid) {
          players.splice(i, 1)
          io.sockets.emit("updateLeaderBoard", getLeaderBoard())
          const newEntry = {
            name: player.playerData.name,
            score: player.playerData.score
          }
          new LB(newEntry)
            .save()
            .then(
              initGame()
            )
        }
      })
      const updateStats = `
      UPDATE stats
          SET highScore = CASE WHEN highScore < ? THEN ? ELSE highScore END,
          mostOrbs = CASE WHEN mostOrbs < ? THEN ? ELSE mostOrbs END,
          mostPlayers = CASE WHEN mostPlayers < ? THEN ? ELSE mostPlayers END
      WHERE username = ?
      `
    }
  })
})

function getLeaderBoard() {
  players.sort((a, b) => {
    return b.score - a.score
  })
  let leaderBoard = players.map((curPlayer) => {
    return {
      name: curPlayer.name,
      score: curPlayer.score
    }
  })
  return leaderBoard
}

function initGame() {
  for (let i = 0; i < settings.defaultViruses; i++) {
    viruses.push(new Virus(settings));
  }
}

module.exports = io;
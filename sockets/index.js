// Main server side file
const mongoose = require("mongoose")
// Get io
const io = require("../server").io;
// Get Mongoose Schema
require("../models/LeaderBoard");
// Get collisions management
const checkForVirusCollisions = require("./collisions").checkForVirusCollisions;
const checkForPlayerCollisions = require("./collisions")
  .checkForPlayerCollisions;

// Player class
const Player = require("./classes/Player");
// Get player public data (send to the clients)
const PlayerData = require("./classes/PlayerData");
// Get player private data (always remain on the server to prevent hacks)
const PlayerConfig = require("./classes/PlayerConfig");
// Get Viruses config (to client side)
const Virus = require("./classes/Virus");
// Define mongoose Schema
const LB = mongoose.model("leaderBoard");
// Locals variables
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

// This function init the game
initGame();

// This send updated players datas to the clients on every frame 60 times a second
setInterval(() => {
  if (players.length > 0) {
    io.to("game").emit("tock", {
      players
    });
  }
}, 1000 / 60);

// This define what the server do on a player connection
io.sockets.on("connect", socket => {
  let player = {};
  // init the game
  socket.on("init", data => {
    // Creating roomspace (possibility for chatroom)
    socket.join("game");
    // generate player data and config to create a new player
    let playerConfig = new PlayerConfig(settings);
    let playerData = new PlayerData(data.playerName, settings);
    player = new Player(socket.id, playerConfig, playerData);
    // Manage client/server interation (send updated player's position)
    setInterval(() => {
      socket.emit("tickTock", {
        playerX: player.playerData.locX,
        playerY: player.playerData.locY
      });
    }, 1000 / 60);
    // send generated viruses to the clients
    socket.emit("initReturn", {
      viruses
    });
    // Add a new player to the current game
    players.push(playerData);
  });
  // Manage data from the clients to update players position
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
    // Manage collisions 
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
  // When a player disconnect from the game
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
    }
  })
})

// LeaderBoard Datas
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

// Generate Viruses on initGame 
function initGame() {
  for (let i = 0; i < settings.defaultViruses; i++) {
    viruses.push(new Virus(settings));
  }
}

module.exports = io;

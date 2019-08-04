const Virus = require('./classes/Virus')
const io = require('../server').io;

// Check collisions between players and other players/viruses (pythagore)
function checkForVirusCollisions(pData, pConfig, viruses, settings) {
  return new Promise((resolve, reject) => {
    viruses.forEach((virus, i) => {

      if (pData.locX + pData.radius + virus.radius > virus.locX &&
        pData.locX < virus.locX + pData.radius + virus.radius &&
        pData.locY + pData.radius + virus.radius > virus.locY &&
        pData.locY < virus.locY + pData.radius + virus.radius) {

        distance = Math.sqrt(
          ((pData.locX - virus.locX) * (pData.locX - virus.locX)) +
          ((pData.locY - virus.locY) * (pData.locY - virus.locY))
        );
        if (distance < pData.radius + virus.radius) {

          pData.score += 1;
          pData.virusesAbsorbed += 1;

          if (pConfig.zoom > 1) {
            pConfig.zoom -= .001;
          }
          pData.radius += 0.25;
          if (pConfig.speed < -0.005) {
            pConfig.speed += 0.005;
          } else if (pConfig.speed > 0.005) {
            pConfig.speed -= 0.005;
          }

          viruses.splice(i, 1, new Virus(settings))

          resolve(i)
        }
      }
    });

    reject()
  });
}

function checkForPlayerCollisions(pData, pConfig, players, playerId) {
  return new Promise((resolve, reject) => {

    players.forEach((curPlayer, i) => {
      if (curPlayer.uid != playerId) {

        let pLocx = curPlayer.locX
        let pLocy = curPlayer.locY
        let pR = curPlayer.radius

        if (pData.locX + pData.radius + pR > pLocx &&
          pData.locX < pLocx + pData.radius + pR &&
          pData.locY + pData.radius + pR > pLocy &&
          pData.locY < pLocy + pData.radius + pR) {

          distance = Math.sqrt(
            ((pData.locX - pLocx) * (pData.locX - pLocx)) +
            ((pData.locY - pLocy) * (pData.locY - pLocy))
          );
          if (distance < pData.radius + pR) {

            if (pData.radius > pR) {

              let collisionData = updateScores(pData, curPlayer);
              if (pConfig.zoom > 1) {
                pConfig.zoom -= (pR * 0.25) * .001;
              }
              players.splice(i, 1);
              resolve(collisionData);

            } else if (pData.radius < pR) {
              let collisionData = updateScores(curPlayer, pData);
              players.forEach((p, i) => {
                if (pData.uid == p.uid) {
                  players.splice(i, 1);
                }
              });
              resolve(collisionData);
            }
          }
        }
      }
    })
    reject();
  });
}

function updateScores(killer, killed) {
  killer.score += (killed.score + 10);
  killer.playersAbsorbed += 1;
  killed.alive = false;
  killer.radius += (killed.radius * 0.25)
  return {
    died: killed,
    killedBy: killer,
  }
}

module.exports = {
  checkForVirusCollisions,
  checkForPlayerCollisions
}

const uuidv4 = require("uuid/v4")

class PlayerData {
  constructor(playerName, settings) {
    this.uid = uuidv4()
    this.name = playerName
    this.locX = Math.floor(settings.worldWidth * Math.random() + 200)
    this.locY = Math.floor(settings.worldHeight * Math.random() + 200)
    this.radius = settings.defaultSize
    this.color = this.getRandomColor()
    this.score = 0
    this.virusesAbsorbed = 0
  }
  getRandomColor() {
    const r = Math.floor((Math.random() * 250) + 50)
    const g = Math.floor((Math.random() * 250) + 50)
    const b = Math.floor((Math.random() * 250) + 50)

    return `rgb(${r},${g},${b})`
  }
}

module.exports = PlayerData
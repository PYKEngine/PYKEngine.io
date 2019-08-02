class Virus {
  constructor(settings) {
    this.color = this.getRandomColor()
    this.locX = Math.floor(Math.random() * settings.worldWidth)
    this.locY = Math.floor(Math.random() * settings.worldHeight)
    this.radius = 5
    this.sprite = this.getRandomInt(0, 4)
  }
  getRandomColor() {
    const r = Math.floor((Math.random() * 250) + 50)
    const g = Math.floor((Math.random() * 250) + 50)
    const b = Math.floor((Math.random() * 250) + 50)

    return `rgb(${r},${g},${b})`
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min));
  }
}

module.exports = Virus
class PlayerConfig {
  constructor(settings) {
    this.xVector = 0
    this.yVector = 0
    this.speed = settings.defaultSpeed
    this.zomm = settings.defaultZoom
  }
}

module.exports = PlayerConfig
// Draw canvas
// imgs object's array
const sprites = [{
    src: "./images/sprites/boss00001.png"
  },
  {
    src: "./images/sprites/boss10001.png"
  },
  {
    src: "./images/sprites/boss20001.png"
  },
  {
    src: "./images/sprites/boss30001.png"
  }
]

// load images
loadImage()

// draw canvas
function draw() {

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const camX = -player.locX + canvas.width / 2
  const camY = -player.locY + canvas.height / 2

  ctx.translate(camX, camY)

  viruses.forEach((virus) => {
    ctx.beginPath()
    ctx.fillStyle = virus.color
    ctx.arc(virus.locX, virus.locY, virus.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.drawImage(sprite, virus.locX - sprite.width * 0.6 / 2, virus.locY - sprite.height * 0.6 / 2, sprite.width * 0.6, sprite.height * 0.6)
  })

  players.forEach((p) => {
    ctx.beginPath()
    ctx.fillStyle = p.color
    ctx.arc(p.locX, p.locY, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgb(0,255,0)"
    ctx.stroke()
    ctx.font = "25px Verdana"
    ctx.strokeText(p.name, p.locX, p.locY)
    ctx.fillStyle = "white"
    ctx.fillText(p.name, p.locX, p.locY)
  })

  requestAnimationFrame(draw)
}

// Player mouse controls
canvas.addEventListener("mousemove", (event) => {
  const mousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  const angleDeg = Math.atan2(mousePosition.y - (canvas.height / 2), mousePosition.x - (canvas.width / 2)) * 180 / Math.PI;
  if (angleDeg >= 0 && angleDeg < 90) {
    xVector = 1 - (angleDeg / 90);
    yVector = -(angleDeg / 90);
  } else if (angleDeg >= 90 && angleDeg <= 180) {
    xVector = -(angleDeg - 90) / 90;
    yVector = -(1 - ((angleDeg - 90) / 90));
  } else if (angleDeg >= -180 && angleDeg < -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = (1 + ((angleDeg + 90) / 90));
  } else if (angleDeg < 0 && angleDeg >= -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = (1 - ((angleDeg + 90) / 90));
  }

  player.xVector = xVector
  player.yVector = yVector
})

// Load imgs
function loadImage() {
  for (var i = 0; i < 4; i++) {
    sprite = new Image();
    sprite.src = sprites[i].src
  }
}

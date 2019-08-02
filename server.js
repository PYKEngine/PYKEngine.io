const express = require("express")
const socketio = require("socket.io")
const hbs = require("hbs")
const mongoose = require("mongoose")

const app = express()

const port = process.env.PORT || 5555;
// Middleware
// Load Passport Config
const db = require("./config/database");

// Dependencies settings
mongoose
  .connect(db.mongoURI, {
    useNewUrlParser: true
  })
  .then(() => console.log("Interface 2037 ready for inquiry"))
  .catch(err => console.log(err));

app.set("view engine", "hbs");
app.use(express.static('public'));

require("./models/LeaderBoard");
const LeaderBoard = mongoose.model("leaderBoard");

app.get("/", (req, res) => {
  LeaderBoard.find({})
    .sort({
      score: "desc"
    })
    .limit(5)
    .then(score => {
      res.render("index", {
        score: score
      })
    })
});

const expressServer = app.listen(port, () => {
  console.log(`Awaiting orders on port ${port}`);
});

const io = socketio(expressServer);

module.exports = {
  app,
  io
}
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Shema
const LBSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

mongoose.model("leaderBoard", LBSchema)
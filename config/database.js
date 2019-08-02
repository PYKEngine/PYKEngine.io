if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI: "mongodb+srv://PYKE_Admin:6Ftwns095YJl988s@pykengine-5wton.mongodb.net/test?retryWrites=true&w=majority"
  }
} else {
  module.exports = {
    mongoURI: "mongodb://localhost:27017/online-game"
  }
}
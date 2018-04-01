"use strict";

const mongoose = require("mongoose");
const conn = mongoose.connection;

mongoose.Promise = global.Promise;

conn.on("error", function(err) {
  console.error("mongodb connection error:", err);
  process.exit(1);
});

conn.once("open", function() {
  console.info("Connected to mongodb.");
});

mongoose.connect("mongodb://localhost/nodepop");

module.exports = conn;

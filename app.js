const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const { USER, PASSWORD, DATABASE, HOST } = process.env;
const connectionStr = `mongodb://${USER}:${PASSWORD}@${HOST}:27017/${DATABASE}`;

mongoose.connect(connectionStr, {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", true);

const db = mongoose.connection;

db.on("error", error => {
  console.error(error.message);
  process.exit(0);
});

db.once("open", async () => {
  console.log("Successfuly connected to MongoDB");
});

//Middleware includes
const errorMiddleware = require("./api/middleware/error");

//Hbs engine
const hbsEngine = require("./handlebars/engine");

//Route includes
const pageRouter = require("./api/routes/pages");
const dataRouter = require("./api/routes/data");

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a"
  }
);

//Initialize app
const app = express();

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

//Set Handlebars as view engine
app.engine("hbs", hbsEngine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

//Allow public files
app.use(express.static(path.join(__dirname, "public")));

app.use("/", pageRouter);
app.use("/api", dataRouter);

//Including error handling middleware
app.use(errorMiddleware.error_not_found);
app.use(errorMiddleware.error_not_catched);

module.exports = app;

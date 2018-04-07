"use strict";

const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const favicon = require("express-favicon");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const jwtAuth = require("./lib/jwtAuth");

/* jshint ignore:start */
const conn = require("./lib/connectMongoose");
/* jshint ignore:end */

// Cargamos las definiciones de todos nuestros modelos
require("./models/Anuncio");
const Usuario = require("./models/Usuario");

const app = express();

app.use(favicon(__dirname + "/public/images/favicon.png"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html"); // decimos a express que use extension html
app.engine("html", require("ejs").__express); // le decimos como manejar vistas html

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuramos multidioma en express
const i18n = require("./lib/i18nConfigure")();
app.use(i18n.init);

const loginController = require("./routes/loginController");

// Middleware de mi API v1
app.use("/apiv1/anuncios", jwtAuth(), require("./routes/apiv1/anuncios"));
app.use("/loginJWT", loginController.postLoginJWT);

// Middleware de control de sessiones
app.use(
  session({
    name: "nodepop-session",
    secret: "nblsakfhj7dsf87a6fbhgjdhfd8g7h6gfh5s76gh7bd6",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 }, // dos dias de inactividad
    store: new MongoStore({
      // como conectarse a mi base de datos
      url: "mongodb://localhost/nodepop" // fix issue from connect-mongo that appears in github
      //mongooseConnection: conn
    })
  })
);

app.use(async (req, res, next) => {
  try {
    // si el usuario está logado, cargamos en req.user el objeto de usuario desde la base de datos
    // para que los siguientes middlewares lo puedan usar
    req.user = req.session.authUser
      ? await Usuario.findById(req.session.authUser._id)
      : null;
    next();
  } catch (err) {
    next(err);
    return;
  }
});

// Global Template variables
app.locals.title = "NodePop";

app.get("/login", loginController.index);
app.post("/login", loginController.post);
app.get("/logout", loginController.logout);

// Web
app.use("/", require("./routes/index"));
app.use("/anuncios", require("./routes/anuncios"));
app.use("/lang", require("./routes/lang"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (err.array) {
    // validation error
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req)
      ? { message: "not valid", errors: err.mapped() }
      : `not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  // establezco el status a la respuesta
  err.status = err.status || 500;
  res.status(err.status);

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err);

  // si es una petición al API respondo JSON...
  if (isAPI(req)) {
    res.json({ success: false, error: err.message });
    return;
  }

  // ...y si no respondo con HTML...

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.render("error");
});

function isAPI(req) {
  return req.originalUrl.indexOf("/api") === 0;
}

module.exports = app;

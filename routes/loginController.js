"use strict";

const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");

class LoginController {
  // GET /
  index(req, res, next) {
    res.locals.email =
      process.env.NODE_ENV === "development" ? "user@example.com" : "";
    res.locals.error = "";
    res.render("login");
  }

  // POST /
  async post(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    res.locals.error = "";
    res.locals.email = email;

    const user = await Usuario.findOne({
      email: email
    });

    // Comprobar usuario encontrado y verificar la clave del usuario
    if (!user || !await bcrypt.compare(password, user.password)) {
      res.locals.error = "Credenciales incorrectas";
      res.render("login");
      return;
    }

    req.session.authUser = { _id: user._id };

    // Usuario encontrado y validado
    res.redirect("/anuncios");
  }

  // GET logout
  logout(req, res, next) {
    delete req.session.authUser; // borrar authUser
    req.session.regenerate(function(err) {
      if (err) {
        next(err);
        return;
      }
      res.redirect("/anuncios");
    });
  }
}

module.exports = new LoginController();

"use strict";

class LoginController {
  // GET /
  index(req, res, next) {
    res.render("login");
  }

  // POST /
  post(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);

    res.render("login");
  }
}

module.exports = new LoginController();

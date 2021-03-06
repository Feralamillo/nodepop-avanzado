"use strict";

const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const sessionAuth = require("../lib/sessionAuth");
const Usuario = require("../models/Usuario");

/* GET home page. */
router.get("/", sessionAuth(), async function(req, res, next) {
  try {
    const filename = path.join(__dirname, "../README.md");
    const readme = await new Promise((res, rej) =>
      fs.readFile(filename, "utf8", (err, data) => (err ? rej(err) : res(data)))
    );
    res.render("index", { readme });
  } catch (err) {
    return next(err);
  }
});

router.post("/sendemail", async (req, res, next) => {
  try {
    await req.user.sendMail("Nodepop", "Asunto de prueba", "Correo de prueba");

    res.redirect("/anuncios");
  } catch (err) {
    next(err);
    return;
  }
});

module.exports = router;

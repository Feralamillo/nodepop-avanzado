"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// configuramos transport de nodemailer
const transport = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "user",
    pass: "pass"
  }
});

/*
transport.sendMail({
  to: "fernando@ongoney.com",
  from: "Nodepop <admin@example.com>",
  subject: "Prueba email",
  text: "Esto es una prueba de email"
});
*/

const usuarioSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

// método estático
usuarioSchema.statics.hashPassword = function(plain) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plain, 10, function(err, hash) {
      if (err) {
        reject(err);
        return;
      }
      resolve(hash);
    });
  });
};

usuarioSchema.methods.sendMail = function() {
  console.log("Enviando mail...");
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;

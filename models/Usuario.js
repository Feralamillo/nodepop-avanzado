"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// configuramos transport de nodemailer
const transport = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD
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

//metodo instancia
usuarioSchema.methods.sendMail = function(from, subject, text) {
  console.log("SENDGRID_USER", process.env.SENDGRID_USER);
  // si el email es de desarrollo no lo mando, lo saco en el log
  if (this.email.includes("@example.com")) {
    console.log(`Enviando mail a ${this.email} con asunto ${subject}.`);
    return Promise.resolve();
  }
  return transport.sendMail({
    to: this.email,
    from: from,
    subject: subject,
    text: text
  });
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;

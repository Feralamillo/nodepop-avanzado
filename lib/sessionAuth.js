"use strict";

// Modulo con funcion que devuelve un middleware
// El modulo verifica si la sesión está autenticada para redirigir al login

module.exports = function() {
  return function(req, res, next) {
    if (!req.session.authUser) {
      res.redirect("/login");
      return;
    }
    // Si tengo ususario, dejo continuar
    next();
  };
};

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Definir la ruta a la base de datos (mismo nombre que init.js)
const dbPath = path.join(__dirname, "database.sqlite");

// Conexión
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos", err);
  } else {
    console.log("Conectado a la base de datos SQLite");
  }
});

module.exports = db;

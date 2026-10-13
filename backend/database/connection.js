const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dataDirectory = path.join(__dirname, "..", "..", "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(path.join(dataDirectory, "sorteio.sqlite"));
database.exec("PRAGMA foreign_keys = ON;");

module.exports = database;

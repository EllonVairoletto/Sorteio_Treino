const database = require("../database/connection");

function listAvailable() {
  return database.prepare("SELECT id, name, status FROM people WHERE status = 'available' ORDER BY id").all();
}
function create(name, normalizedName) {
  return database.prepare("INSERT INTO people (name, normalized_name) VALUES (?, ?)").run(name, normalizedName);
}
function removeAvailable(id) {
  return database.prepare("DELETE FROM people WHERE id = ? AND status = 'available'").run(id);
}
module.exports = { listAvailable, create, removeAvailable };

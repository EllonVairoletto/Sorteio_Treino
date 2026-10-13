const database = require("../database/connection");
function nextNumber() { return database.prepare("SELECT COALESCE(MAX(draw_number), 0) + 1 AS value FROM draws").get().value; }
function create(number, type, maxPeoplePerGroup) { return database.prepare("INSERT INTO draws (draw_number, draw_type, max_people_per_group) VALUES (?, ?, ?)").run(number, type, maxPeoplePerGroup); }
function list() { return database.prepare("SELECT id, draw_number AS drawNumber, draw_type AS type, max_people_per_group AS maxPeoplePerGroup, created_at AS createdAt FROM draws ORDER BY draw_number DESC").all(); }
module.exports = { nextNumber, create, list };

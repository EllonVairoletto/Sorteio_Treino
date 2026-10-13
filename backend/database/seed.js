const database = require("./connection");

const initialPeople = [
  "Ellon", "Dude", "Sofia", "Marcio", "Zebra", "Wilson",
  "Caique", "Luiz", "Ana", "Pedro", "Kauan", "Samuel",
];

function seedInitialPeople() {
  const insertPerson = database.prepare(
    "INSERT OR IGNORE INTO people (name, normalized_name) VALUES (?, ?)"
  );
  initialPeople.forEach((name) => insertPerson.run(name, name.toLocaleLowerCase("pt-BR")));
}

module.exports = { seedInitialPeople };

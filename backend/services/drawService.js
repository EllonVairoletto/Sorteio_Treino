const database = require("../database/connection");

function transaction(work) {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function mapPerson(row) {
  return { id: Number(row.id), name: row.name, status: row.status };
}

function listAvailablePeople() {
  return database
    .prepare("SELECT id, name, status FROM people WHERE status = 'available' ORDER BY id")
    .all()
    .map(mapPerson);
}

function createPerson(name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    const error = new Error("Informe um nome.");
    error.status = 400;
    throw error;
  }

  try {
    const result = database
      .prepare("INSERT INTO people (name, normalized_name) VALUES (?, ?)")
      .run(trimmed, normalizeName(trimmed));
    return mapPerson(
      database.prepare("SELECT id, name, status FROM people WHERE id = ?").get(result.lastInsertRowid)
    );
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      error.status = 409;
      error.message = "Esse nome já está cadastrado.";
    }
    throw error;
  }
}

function deleteAvailablePerson(id) {
  const result = database
    .prepare("DELETE FROM people WHERE id = ? AND status = 'available'")
    .run(id);
  if (result.changes === 0) {
    const error = new Error("Nome não encontrado ou já atribuído a um grupo.");
    error.status = 404;
    throw error;
  }
}

function nextDrawNumber() {
  const row = database.prepare("SELECT COALESCE(MAX(draw_number), 0) + 1 AS value FROM draws").get();
  return Number(row.value);
}

function nextGroupNumber() {
  const row = database.prepare("SELECT COALESCE(MAX(id), 0) + 1 AS value FROM draw_groups").get();
  return Number(row.value);
}

function activeGroups() {
  const groups = database.prepare(`
    SELECT g.id, g.group_name, g.group_order, g.draw_id, d.draw_number
    FROM draw_groups g
    JOIN draws d ON d.id = g.draw_id
    WHERE g.deleted_at IS NULL
    ORDER BY g.id
  `).all();
  const membersStatement = database.prepare(`
    SELECT p.id, p.name, p.status
    FROM draw_group_members gm
    JOIN people p ON p.id = gm.person_id
    WHERE gm.group_id = ?
    ORDER BY gm.member_order
  `);

  return groups.map((group) => ({
    id: Number(group.id),
    name: group.group_name,
    order: Number(group.group_order),
    drawId: Number(group.draw_id),
    drawNumber: Number(group.draw_number),
    members: membersStatement.all(group.id).map(mapPerson),
  }));
}

function createGroupsForDraw(drawId, people, maxPerGroup) {
  const insertGroup = database.prepare(
    "INSERT INTO draw_groups (draw_id, group_name, group_order) VALUES (?, ?, ?)"
  );
  const insertMember = database.prepare(
    "INSERT INTO draw_group_members (group_id, person_id, member_order) VALUES (?, ?, ?)"
  );
  const updatePerson = database.prepare(
    "UPDATE people SET status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  );
  let groupNumber = nextGroupNumber();

  for (let offset = 0, order = 1; offset < people.length; offset += maxPerGroup, order += 1) {
    const members = people.slice(offset, offset + maxPerGroup);
    const result = insertGroup.run(drawId, `Grupo ${groupNumber}`, order);
    const groupId = Number(result.lastInsertRowid);
    groupNumber += 1;
    members.forEach((person, memberOrder) => {
      insertMember.run(groupId, person.id, memberOrder + 1);
      updatePerson.run(person.id);
    });
  }
}

function createDraw(maxPerGroup) {
  return transaction(() => {
    const people = shuffle(listAvailablePeople());
    if (people.length === 0) {
      const error = new Error("Adicione pelo menos um nome à lista antes de sortear.");
      error.status = 400;
      throw error;
    }

    const type = activeGroups().length === 0 ? "initial" : "additional";
    const draw = database
      .prepare("INSERT INTO draws (draw_number, draw_type, max_people_per_group) VALUES (?, ?, ?)")
      .run(nextDrawNumber(), type, maxPerGroup);
    createGroupsForDraw(Number(draw.lastInsertRowid), people, maxPerGroup);
    return getState();
  });
}

function renameGroup(id, name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    const error = new Error("Informe o novo nome do grupo.");
    error.status = 400;
    throw error;
  }

  return transaction(() => {
    const group = database
      .prepare("SELECT group_name FROM draw_groups WHERE id = ? AND deleted_at IS NULL")
      .get(id);
    if (!group) {
      const error = new Error("Grupo não encontrado.");
      error.status = 404;
      throw error;
    }
    database.prepare("UPDATE draw_groups SET group_name = ? WHERE id = ?").run(trimmed, id);
    database.prepare(`
      INSERT INTO draw_group_events (group_id, event_type, old_name, new_name)
      VALUES (?, 'renamed', ?, ?)
    `).run(id, group.group_name, trimmed);
    return getState();
  });
}

function deleteGroups(ids) {
  return transaction(() => {
    const placeholders = ids.map(() => "?").join(", ");
    const groups = database
      .prepare(`SELECT id FROM draw_groups WHERE id IN (${placeholders}) AND deleted_at IS NULL`)
      .all(...ids);
    if (groups.length === 0) {
      const error = new Error("Nenhum grupo ativo foi encontrado.");
      error.status = 404;
      throw error;
    }

    const personIds = database.prepare(`
      SELECT DISTINCT person_id FROM draw_group_members
      WHERE group_id IN (${placeholders})
    `).all(...ids);
    database.prepare(`UPDATE draw_groups SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
    const insertEvent = database.prepare(
      "INSERT INTO draw_group_events (group_id, event_type) VALUES (?, 'deleted')"
    );
    groups.forEach((group) => insertEvent.run(group.id));
    const updatePerson = database.prepare(
      "UPDATE people SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    personIds.forEach((person) => updatePerson.run(person.person_id));
    return getState();
  });
}

function rerollGroups(ids, maxPerGroup) {
  return transaction(() => {
    const placeholders = ids.map(() => "?").join(", ");
    const groups = database.prepare(`
      SELECT id FROM draw_groups WHERE id IN (${placeholders}) AND deleted_at IS NULL
    `).all(...ids);
    if (groups.length !== ids.length) {
      const error = new Error("Um ou mais grupos selecionados não estão ativos.");
      error.status = 404;
      throw error;
    }

    const people = database.prepare(`
      SELECT DISTINCT p.id, p.name, p.status
      FROM draw_group_members gm
      JOIN people p ON p.id = gm.person_id
      WHERE gm.group_id IN (${placeholders})
    `).all(...ids).map(mapPerson);
    database.prepare(`UPDATE draw_groups SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
    const insertEvent = database.prepare(
      "INSERT INTO draw_group_events (group_id, event_type) VALUES (?, 'rerolled')"
    );
    groups.forEach((group) => insertEvent.run(group.id));

    const draw = database
      .prepare("INSERT INTO draws (draw_number, draw_type, max_people_per_group) VALUES (?, 'reroll', ?)")
      .run(nextDrawNumber(), maxPerGroup);
    createGroupsForDraw(Number(draw.lastInsertRowid), shuffle(people), maxPerGroup);
    return getState();
  });
}

function listDraws() {
  return database.prepare(`
    SELECT id, draw_number AS drawNumber, draw_type AS type,
           max_people_per_group AS maxPeoplePerGroup, created_at AS createdAt
    FROM draws ORDER BY draw_number DESC
  `).all();
}

function getState() {
  return { people: listAvailablePeople(), groups: activeGroups() };
}

module.exports = {
  getState,
  createPerson,
  deleteAvailablePerson,
  createDraw,
  renameGroup,
  deleteGroups,
  rerollGroups,
  listDraws,
};

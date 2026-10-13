const express = require("express");
const path = require("node:path");
const store = require("./store");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(__dirname));

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function sendError(response, error) {
  response.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
}

app.get("/api/state", (_request, response) => {
  try {
    response.json(store.getState());
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/api/draws", (_request, response) => {
  try {
    response.json(store.listDraws());
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/people", (request, response) => {
  try {
    response.status(201).json(store.createPerson(String(request.body?.name || "")));
  } catch (error) {
    sendError(response, error);
  }
});

app.delete("/api/people/:id", (request, response) => {
  try {
    store.deleteAvailablePerson(parsePositiveInteger(request.params.id));
    response.status(204).end();
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/draws", (request, response) => {
  try {
    const maxPeoplePerGroup = parsePositiveInteger(request.body?.maxPeoplePerGroup);
    if (!maxPeoplePerGroup) {
      const error = new Error("A quantidade máxima deve ser um número inteiro maior ou igual a 1.");
      error.status = 400;
      throw error;
    }
    response.status(201).json(store.createDraw(maxPeoplePerGroup));
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/groups/reroll", (request, response) => {
  try {
    const groupIds = Array.isArray(request.body?.groupIds)
      ? request.body.groupIds.map(parsePositiveInteger).filter(Boolean)
      : [];
    const maxPeoplePerGroup = parsePositiveInteger(request.body?.maxPeoplePerGroup);
    if (groupIds.length === 0 || !maxPeoplePerGroup) {
      const error = new Error("Selecione grupos e informe uma quantidade máxima válida.");
      error.status = 400;
      throw error;
    }
    response.json(store.rerollGroups([...new Set(groupIds)], maxPeoplePerGroup));
  } catch (error) {
    sendError(response, error);
  }
});

app.patch("/api/groups/:id", (request, response) => {
  try {
    const id = parsePositiveInteger(request.params.id);
    if (!id) {
      const error = new Error("Identificador de grupo inválido.");
      error.status = 400;
      throw error;
    }
    response.json(store.renameGroup(id, String(request.body?.name || "")));
  } catch (error) {
    sendError(response, error);
  }
});

app.delete("/api/groups/:id", (request, response) => {
  try {
    const id = parsePositiveInteger(request.params.id);
    if (!id) {
      const error = new Error("Identificador de grupo inválido.");
      error.status = 400;
      throw error;
    }
    response.json(store.deleteGroups([id]));
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/groups/bulk-delete", (request, response) => {
  try {
    const groupIds = Array.isArray(request.body?.groupIds)
      ? request.body.groupIds.map(parsePositiveInteger).filter(Boolean)
      : [];
    if (groupIds.length === 0) {
      const error = new Error("Selecione ao menos um grupo.");
      error.status = 400;
      throw error;
    }
    response.json(store.deleteGroups([...new Set(groupIds)]));
  } catch (error) {
    sendError(response, error);
  }
});

app.listen(port, () => {
  console.log(`Sorteio disponível em http://localhost:${port}`);
});

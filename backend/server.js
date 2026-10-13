const express = require("express");
const path = require("node:path");
const { initializeSchema } = require("./database/schema");
const { seedInitialPeople } = require("./database/seed");
const store = require("./services/drawService");

initializeSchema();
seedInitialPeople();

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.json());

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}
function fail(response, error) {
  response.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
}
function withHandler(handler) {
  return (request, response) => { try { handler(request, response); } catch (error) { fail(response, error); } };
}

app.get("/api/state", withHandler((_req, res) => res.json(store.getState())));
app.get("/api/draws", withHandler((_req, res) => res.json(store.listDraws())));
app.post("/api/people", withHandler((req, res) => res.status(201).json(store.createPerson(String(req.body?.name || "")))));
app.delete("/api/people/:id", withHandler((req, res) => { store.deleteAvailablePerson(positiveInteger(req.params.id)); res.status(204).end(); }));
app.post("/api/draws", withHandler((req, res) => {
  const max = positiveInteger(req.body?.maxPeoplePerGroup);
  if (!max) { const error = new Error("A quantidade máxima deve ser um número inteiro maior ou igual a 1."); error.status = 400; throw error; }
  res.status(201).json(store.createDraw(max));
}));
app.post("/api/groups/reroll", withHandler((req, res) => {
  const ids = Array.isArray(req.body?.groupIds) ? [...new Set(req.body.groupIds.map(positiveInteger).filter(Boolean))] : [];
  const max = positiveInteger(req.body?.maxPeoplePerGroup);
  if (!ids.length || !max) { const error = new Error("Selecione grupos e informe uma quantidade máxima válida."); error.status = 400; throw error; }
  res.json(store.rerollGroups(ids, max));
}));
app.patch("/api/groups/:id", withHandler((req, res) => res.json(store.renameGroup(positiveInteger(req.params.id), String(req.body?.name || "")))));
app.delete("/api/groups/:id", withHandler((req, res) => res.json(store.deleteGroups([positiveInteger(req.params.id)]))));
app.post("/api/groups/bulk-delete", withHandler((req, res) => {
  const ids = Array.isArray(req.body?.groupIds) ? [...new Set(req.body.groupIds.map(positiveInteger).filter(Boolean))] : [];
  if (!ids.length) { const error = new Error("Selecione ao menos um grupo."); error.status = 400; throw error; }
  res.json(store.deleteGroups(ids));
}));

const clientPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(clientPath));
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(clientPath, "index.html")));
app.listen(port, () => console.log(`Sorteio disponível em http://localhost:${port}`));

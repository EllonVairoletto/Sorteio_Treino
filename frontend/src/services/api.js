async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || "Não foi possível concluir a operação."); }
  return response.status === 204 ? null : response.json();
}
export const api = {
  getState: () => request("/api/state"),
  addPerson: (name) => request("/api/people", { method: "POST", body: JSON.stringify({ name }) }),
  deletePerson: (id) => request(`/api/people/${id}`, { method: "DELETE" }),
  draw: (maxPeoplePerGroup) => request("/api/draws", { method: "POST", body: JSON.stringify({ maxPeoplePerGroup }) }),
  reroll: (groupIds, maxPeoplePerGroup) => request("/api/groups/reroll", { method: "POST", body: JSON.stringify({ groupIds, maxPeoplePerGroup }) }),
  renameGroup: (id, name) => request(`/api/groups/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteGroups: (groupIds) => groupIds.length === 1 ? request(`/api/groups/${groupIds[0]}`, { method: "DELETE" }) : request("/api/groups/bulk-delete", { method: "POST", body: JSON.stringify({ groupIds }) }),
};

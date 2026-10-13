import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useDrawState() {
  const [state, setState] = useState({ people: [], groups: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState("");

  async function refresh() { setState(await api.getState()); }
  useEffect(() => { refresh().catch((e) => setError(e.message)); }, []);

  async function run(action) {
    try { setError(""); const next = await action(); setState(next); return next; }
    catch (e) { setError(e.message); throw e; }
  }
  function toggleGroup(id) {
    setSelectedIds((current) => {
      const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next;
    });
  }
  return { state, selectedIds, error, setError, refresh, run, toggleGroup, setSelectedIds };
}

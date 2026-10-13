import { useState } from "react";
import { Header } from "./components/Header";
import { PeoplePanel } from "./components/PeoplePanel";
import { GroupBoard } from "./components/GroupBoard";
import { api } from "./services/api";
import { useDrawState } from "./hooks/useDrawState";
import "./styles/app.css";

export default function App() {
  const { state, selectedIds, toggleGroup, run, setSelectedIds, error } = useDrawState();
  const [maxPeople, setMaxPeople] = useState(1);
  const add = async (name) => run(() => api.addPerson(name)).then(() => run(api.getState));
  const draw = () => run(() => api.draw(Number(maxPeople)));
  const deletePeople = (ids) => run(() => api.deleteGroups(ids)).then(() => setSelectedIds(new Set()));
  const reroll = () => run(() => api.reroll([...selectedIds], Number(maxPeople))).then(() => setSelectedIds(new Set()));
  const rename = (id, name) => run(() => api.renameGroup(id, name));
  const deletePerson = (id) => run(() => api.deletePerson(id)).then(() => run(api.getState));
  return <><Header /><main className="app"><PeoplePanel people={state.people} onAdd={add} onDelete={deletePerson} maxPeople={maxPeople} setMaxPeople={setMaxPeople} onDraw={draw} error={error} /><GroupBoard groups={state.groups} selectedIds={selectedIds} toggleGroup={toggleGroup} onReroll={reroll} onDelete={deletePeople} onRename={rename} error={error} /></main></>;
}

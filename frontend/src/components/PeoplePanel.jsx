export function PeoplePanel({ people, onAdd, onDelete, maxPeople, setMaxPeople, onDraw, error }) {
  return <aside className="painel-esquerdo">
    <form className="card bloco-entrada" onSubmit={(event) => { event.preventDefault(); onAdd(event.currentTarget.name.value); event.currentTarget.reset(); }}>
      <label htmlFor="nome-individuo">Nome do indivíduo</label><input id="nome-individuo" name="name" placeholder="Digite o nome" maxLength="80" autoComplete="off" /><button id="btn-adicionar">Adicionar a lista</button>
    </form>
    <section className="card lista-pessoas"><h2>Lista de pessoas que serão sorteadas</h2><ul>{people.map((person) => <li key={person.id}><span className="avatar">{person.name.slice(0, 1).toUpperCase()}</span><span className="nome-item">{person.name}</span><button type="button" className="btn-remover" onClick={() => onDelete(person.id)}>Remover</button></li>)}</ul>{!people.length && <p className="lista-vazia">Nenhum nome adicionado ainda.</p>}</section>
    <form className="card bloco-sorteio" onSubmit={(event) => { event.preventDefault(); onDraw(); }}><label htmlFor="max-por-grupo">Quantidade máxima de pessoas por grupo</label><input id="max-por-grupo" type="number" min="1" step="1" value={maxPeople} onChange={(event) => setMaxPeople(event.target.value)} required />{error && <p className="mensagem-erro">{error}</p>}<button id="btn-sortear">Sortear</button></form>
  </aside>;
}

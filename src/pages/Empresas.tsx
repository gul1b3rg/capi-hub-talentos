import { companyHighlights } from '../data/content';

const Empresas = () => (
  <section className="mx-auto mt-28 max-w-6xl px-4 pb-20 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-white p-10 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Para aseguradoras</p>
      <h2 className="mt-2 font-display text-4xl text-secondary">Diseñado para aseguradoras y startups</h2>
      <p className="mt-3 text-secondary/70">
        Activa vacancias, consultorías y squads híbridos con perfiles validados en todo el país.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {companyHighlights.map((highlight) => (
          <article key={highlight.title} className="rounded-3xl border border-secondary/10 bg-background p-5">
            <h3 className="font-semibold text-secondary">{highlight.title}</h3>
            <p className="text-sm text-secondary/70">{highlight.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <button type="button" className="rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg">
          Publicar vacancia ahora
        </button>
        <button
          type="button"
          className="rounded-full border border-secondary/20 px-6 py-3 font-semibold text-secondary"
        >
          Agendar demo
        </button>
      </div>
    </div>
  </section>
);

export default Empresas;

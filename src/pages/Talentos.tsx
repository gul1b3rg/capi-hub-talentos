import { talentHighlights, featuredJobs } from '../data/content';

const Talentos = () => (
  <section className="mx-auto mt-28 max-w-6xl px-4 pb-20 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-white p-10 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Para talentos</p>
      <h2 className="mt-2 font-display text-4xl text-secondary">Tu próximo desafío en seguros</h2>
      <p className="mt-3 text-secondary/70">
        Reforzá tu perfil, recibí recomendaciones hiper personalizadas y mostrale al ecosistema lo que sabés hacer.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {talentHighlights.map((highlight) => (
          <article key={highlight.title} className="rounded-3xl border border-accent/30 bg-accent/10 p-5">
            <h3 className="font-semibold text-secondary">{highlight.title}</h3>
            <p className="text-sm text-secondary/70">{highlight.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-3xl border border-secondary/10 bg-background p-6">
        <p className="text-sm font-semibold text-secondary/70">Vacancias destacadas</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {featuredJobs.slice(0, 2).map((job) => (
            <div key={job.id} className="rounded-2xl border border-secondary/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-secondary/50">{job.company}</p>
              <p className="font-semibold text-secondary">{job.title}</p>
              <p className="text-sm text-secondary/60">{job.location}</p>
            </div>
          ))}
        </div>
        <button type="button" className="mt-6 rounded-full bg-secondary px-6 py-3 font-semibold text-white">
          Ver todas las oportunidades
        </button>
      </div>
    </div>
  </section>
);

export default Talentos;

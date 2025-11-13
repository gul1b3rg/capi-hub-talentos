import { featuredJobs } from '../data/content';

const filters = ['Todas', 'Remoto', 'Híbrido', 'Presencial'];

const Vacancias = () => (
  <section className="mx-auto mt-28 max-w-6xl px-4 pb-20 md:px-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Vacancias</p>
        <h2 className="font-display text-4xl text-secondary">Oportunidades curadas</h2>
        <p className="text-secondary/70">
          Roles estratégicos para perfiles con experiencia en seguros, innovación y tecnología.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === 'Todas' ? 'border-secondary bg-secondary text-white' : 'border-secondary/20 text-secondary'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
    <div className="mt-10 grid gap-6">
      {featuredJobs.map((job) => (
        <article
          key={job.id}
          className="rounded-[32px] border border-secondary/10 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">{job.company}</p>
              <h3 className="font-display text-2xl text-secondary">{job.title}</h3>
              <p className="text-secondary/70">{job.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">{job.modality}</span>
              <span className="rounded-full bg-secondary px-4 py-1 text-sm text-white">{job.status}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-secondary/70">
            <span className="rounded-full border border-secondary/20 px-3 py-1 font-semibold">{job.salary}</span>
            {job.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg"
            >
              Postular
            </button>
            <button
              type="button"
              className="rounded-full border border-secondary/20 px-5 py-2 text-sm font-semibold text-secondary"
            >
              Guardar
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Vacancias;

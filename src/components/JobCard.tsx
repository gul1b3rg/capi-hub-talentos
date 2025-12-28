import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { JobWithRelations } from '../lib/jobService';

interface JobCardProps {
  job: JobWithRelations;
}

const JobCard = memo(({ job }: JobCardProps) => (
  <article className="rounded-3xl border border-white/40 bg-white/90 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/10 bg-white">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={`Logo de ${job.company.name}`}
              className="h-12 w-12 object-contain"
              loading="lazy"
              width="48"
              height="48"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/5 text-sm font-semibold text-secondary">
              {job.company?.name?.slice(0, 2).toUpperCase() ?? 'C'}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary/60">{job.company?.name ?? 'Empresa'}</p>
          <h3 className="text-2xl font-semibold text-secondary">{job.title}</h3>
          <p className="text-sm text-secondary/70">
            {job.location ?? 'Ubicación flexible'} · {job.modality ?? 'Modalidad abierta'}
          </p>
        </div>
      </div>
      <div className="text-sm text-secondary/60 md:text-right">
        Publicada el {job.published_at ? new Date(job.published_at).toLocaleDateString() : 'Sin fecha'}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {job.tags.map((tag) => (
        <span key={tag} className="rounded-full bg-background px-3 py-1 text-sm text-secondary">
          {tag}
        </span>
      ))}
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Link
        to={`/vacancia/${job.id}`}
        className="rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-white"
      >
        Ver detalle
      </Link>
    </div>
  </article>
));

JobCard.displayName = 'JobCard';

export default JobCard;

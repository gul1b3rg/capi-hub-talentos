import { Link } from 'react-router-dom';
import { LuBuilding2, LuUsers } from 'react-icons/lu';
import { companyHighlights, talentHighlights } from '../data/content';

const Card = ({
  title,
  description,
  items,
  icon: Icon,
  cta,
}: {
  title: string;
  description: string;
  items: { title: string; description: string }[];
  icon: typeof LuBuilding2;
  cta: { label: string; to: string; variant: 'primary' | 'secondary' };
}) => (
  <article className="flex flex-col gap-6 rounded-[32px] border border-secondary/10 bg-white p-8 shadow-lg">
    <div className="flex items-center gap-4">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-white">
        <Icon className="text-2xl" />
      </span>
      <div>
        <h3 className="font-display text-2xl text-secondary">{title}</h3>
        <p className="text-secondary/70">{description}</p>
      </div>
    </div>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-secondary/10 bg-background px-4 py-3">
          <p className="font-semibold text-secondary">{item.title}</p>
          <p className="text-sm text-secondary/70">{item.description}</p>
        </div>
      ))}
    </div>
    <Link
      to={cta.to}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold ${
        cta.variant === 'primary'
          ? 'bg-primary text-white shadow-[0_20px_35px_rgba(35,110,255,0.3)]'
          : 'border border-secondary/30 text-secondary'
      }`}
    >
      {cta.label}
    </Link>
  </article>
);

const AudienceSections = () => (
  <section className="mx-auto mt-16 max-w-6xl px-4 md:px-6">
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        title="Para Aseguradoras"
        description="Encontrá perfiles con experiencia en suscripción, siniestros, reaseguro, comercial, jurídico y más."
        items={companyHighlights}
        icon={LuBuilding2}
        cta={{ label: 'Publicar vacancia', to: '/publicar', variant: 'primary' }}
      />
      <Card
        title="Para Talentos"
        description="Tu próximo desafío profesional puede estar en suscripción, siniestros, reaseguro... o en alguna de las tantas áreas publicadas."
        items={talentHighlights}
        icon={LuUsers}
        cta={{ label: 'Ver oportunidades', to: '/vacancias', variant: 'secondary' }}
      />
    </div>
  </section>
);

export default AudienceSections;



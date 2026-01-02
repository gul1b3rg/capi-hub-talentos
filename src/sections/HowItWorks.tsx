import { LuSparkles, LuNotebookPen, LuShare2 } from 'react-icons/lu';

const steps = [
  {
    title: 'Registrate',
    description: 'Creá tu perfil o el de tu empresa para presentarte a todo el mercado asegurador.',
    icon: LuNotebookPen,
  },
  {
    title: 'Publicá o Aplicá',
    description: 'Publicá vacancias o encontrá oportunidades laborales hechas a tu medida en seguros.',
    icon: LuShare2,
  },
  {
    title: 'Conectá',
    description: 'El Hub es para hacer conexiones y dar a conocer oportunidades profesionales en el seguro.',
    icon: LuSparkles,
  },
];

const HowItWorks = () => (
  <section className="mx-auto mt-20 max-w-6xl px-4 md:px-6">
    <div className="glass-panel rounded-[32px] p-10 shadow-2xl">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Cómo funciona</p>
        <h2 className="font-display text-3xl text-secondary">Un flujo curado para el ecosistema asegurador</h2>
        <p className="text-secondary/70">
          Talentos y actores del ecosistema asegurador colaboran en una misma plataforma.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-3xl border border-secondary/10 bg-white/90 p-6 shadow-lg">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="text-2xl" />
            </div>
            <h3 className="font-semibold text-secondary">{title}</h3>
            <p className="mt-2 text-sm text-secondary/70">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

const stats = [
  { label: 'Talentos activos', value: '128', sublabel: '+12 esta semana' },
  { label: 'Vacancias publicadas', value: '24', sublabel: '8 en revisión' },
  { label: 'Match rate', value: '72%', sublabel: '+5 pts vs. mes anterior' },
];

const Dashboard = () => (
  <section className="mx-auto mt-28 max-w-6xl px-4 pb-20 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-white p-10 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Dashboard (beta)</p>
      <h2 className="mt-2 font-display text-4xl text-secondary">Visibilidad en tiempo real</h2>
      <p className="mt-3 text-secondary/70">
        Integrá tus vacancias y consultorías. Próximamente disponible para empresas asociadas a la CAPI.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-secondary/10 bg-background p-6 text-secondary">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary/60">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold">{stat.value}</p>
            <p className="text-sm text-secondary/70">{stat.sublabel}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-accent/40 bg-accent/10 p-6 text-secondary">
        <p className="font-semibold">¿Querés acceso anticipado?</p>
        <p className="text-sm text-secondary/70">Sumate al piloto de analytics para empresas aliadas.</p>
        <button type="button" className="mt-4 rounded-full bg-secondary px-6 py-3 font-semibold text-white">
          Solicitar invitación
        </button>
      </div>
    </div>
  </section>
);

export default Dashboard;

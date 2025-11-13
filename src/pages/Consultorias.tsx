const Consultorias = () => (
  <section className="mx-auto mt-28 max-w-4xl px-4 pb-20 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-background p-10 text-center shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Próximamente</p>
      <h2 className="mt-2 font-display text-4xl text-secondary">Consultorías y servicios</h2>
      <p className="mt-3 text-secondary/70">
        Estamos preparando un marketplace de expertos en tecnología, innovación y seguros para acelerar los proyectos
        del ecosistema.
      </p>
      <div className="mt-8 rounded-3xl border border-secondary/10 bg-white p-6">
        <p className="text-secondary">
          ¿Querés ofrecer tus servicios o contratar un equipo especializado? Dejános tu correo y te avisamos.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            type="email"
            placeholder="tuemail@empresa.com"
            className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary focus:border-primary focus:outline-none"
          />
          <button type="button" className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white">
            Notificame
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default Consultorias;

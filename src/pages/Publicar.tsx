const Publicar = () => (
  <section className="mx-auto mt-28 max-w-6xl px-4 pb-20 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-white p-10 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Publicar vacancia</p>
      <h2 className="mt-2 font-display text-4xl text-secondary">Activá tu búsqueda en minutos</h2>
      <p className="mt-3 text-secondary/70">Compartí los datos clave y nuestro equipo activa el matching.</p>
      <form className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="text-sm font-semibold text-secondary/80">
          Cargo
          <input
            type="text"
            placeholder="Ej. Líder de Innovación"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm font-semibold text-secondary/80">
          Empresa
          <input
            type="text"
            placeholder="Nombre de tu organización"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm font-semibold text-secondary/80">
          Modalidad
          <select className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none">
            <option>Híbrido</option>
            <option>Remoto</option>
            <option>Presencial</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-secondary/80">
          Ubicación
          <input
            type="text"
            placeholder="Ciudad, país"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-secondary/80">
          Descripción
          <textarea
            rows={4}
            placeholder="Compartí responsabilidades, stack y soft skills"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-secondary/80">
          Beneficios o salario estimado
          <input
            type="text"
            placeholder="Gs. 20M - 25M + bonos"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-4">
          <button type="submit" className="rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-lg">
            Enviar a curaduría
          </button>
          <p className="text-sm text-secondary/60">
            Nuestro equipo revisa cada vacancia antes de publicarla para asegurar la calidad del pool.
          </p>
        </div>
      </form>
    </div>
  </section>
);

export default Publicar;

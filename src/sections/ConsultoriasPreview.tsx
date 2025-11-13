import { Link } from 'react-router-dom';
import { LuTimerReset } from 'react-icons/lu';

const ConsultoriasPreview = () => (
  <section className="mx-auto mt-16 max-w-6xl px-4 md:px-6">
    <div className="rounded-[32px] border border-secondary/10 bg-background p-8 shadow-inner">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/30 text-secondary">
            <LuTimerReset className="text-2xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Próximamente</p>
            <h3 className="font-display text-2xl text-secondary">Consultorías y Servicios Especializados</h3>
            <p className="mt-2 text-secondary/70">
              Muy pronto podrás ofrecer o contratar servicios en tecnología, innovación y seguros dentro del ecosistema.
            </p>
          </div>
        </div>
        <Link
          to="/consultorias"
          className="inline-flex items-center justify-center rounded-full border border-secondary/20 px-6 py-3 font-semibold text-secondary"
        >
          Quiero saber más
        </Link>
      </div>
    </div>
  </section>
);

export default ConsultoriasPreview;

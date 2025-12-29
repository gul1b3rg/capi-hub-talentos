import { Link } from 'react-router-dom';
import { HiArrowLongRight } from 'react-icons/hi2';
import FloatingProfileCard from '../components/FloatingProfileCard';
import { heroProfiles } from '../data/content';

const Hero = () => (
  <section className="relative isolate mt-24 overflow-hidden rounded-[32px] bg-gradient-to-br from-secondary via-secondary/95 to-primary px-6 py-16 text-white shadow-[0_30px_60px_rgba(21,30,63,0.45)] md:px-10 md:py-20">
    <div className="grid-overlay opacity-60" />
    <div className="noise opacity-20 mix-blend-soft-light" />
    <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.4em]">
          Talentos · Hub CAPI
          <span className="h-2 w-2 rounded-full bg-accent" />
        </p>
        <div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Conectá con los talentos que impulsan el futuro del seguro paraguayo.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Empresas, aseguradoras y startups del ecosistema asegurador pueden publicar vacancias, descubrir
            especialistas y activar consultorías estratégicas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vacancias"
            className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-semibold text-secondary shadow-[0_20px_40px_rgba(5,222,251,0.35)]"
          >
            Explorar oportunidades
            <HiArrowLongRight className="text-2xl transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/publicar"
            className="inline-flex items-center gap-3 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:border-accent/60"
          >
            Publicar vacancia
          </Link>
        </div>
        {/* TODO: Reactivar con datos reales en vivo desde Supabase
        <div className="grid gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 text-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <div>
              <p className="text-3xl font-bold text-white">+120</p>
              <p>Talentos verificados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">+35</p>
              <p>Empresas activas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">14</p>
              <p>Vacancias en vivo</p>
            </div>
          </div>
          <p className="text-white/60">
            Matching inteligente impulsado por datos del ecosistema asegurador paraguayo y Supabase.
          </p>
        </div>
        */}
      </div>

      <div className="flex flex-col gap-4 lg:items-end">
        <div className="grid gap-4 sm:grid-cols-2">
          {heroProfiles.map((profile, index) => (
            <FloatingProfileCard
              key={profile.id}
              {...profile}
              delay={index * 0.6}
              accent={
                index === 1
                  ? 'from-primary/20 via-white/70 to-white/40 text-white'
                  : 'from-white/90 via-white/70 to-white/40'
              }
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Hero;

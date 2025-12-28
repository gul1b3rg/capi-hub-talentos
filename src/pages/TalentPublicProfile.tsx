import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchPublicTalentProfile } from '../lib/profileService';
import type { Profile } from '../context/AuthContext';

const TalentPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user } = useCurrentProfile();
  const [talent, setTalent] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Talento no encontrado.');
        setLoading(false);
        return;
      }

      // Validar que solo empresas autenticadas puedan ver perfiles
      if (!user || role !== 'empresa') {
        setError('No tienes permisos para ver este perfil.');
        setLoading(false);
        return;
      }

      try {
        const talentData = await fetchPublicTalentProfile(id);
        setTalent(talentData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Error cargando el perfil del talento.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, role]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando perfil...</p>
      </section>
    );
  }

  if (error || !talent) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">
          {error ?? 'Perfil no encontrado'}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="border-b border-secondary/10 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary/60">
            Perfil de Talento
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-secondary">
            {talent.full_name}
          </h1>
          {talent.headline && (
            <p className="mt-2 text-lg text-secondary/70">{talent.headline}</p>
          )}
        </div>

        {/* Información básica */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {talent.location && (
            <div>
              <p className="text-sm font-semibold text-secondary">Ubicación</p>
              <p className="text-secondary/70">{talent.location}</p>
            </div>
          )}

          {talent.experience_years && (
            <div>
              <p className="text-sm font-semibold text-secondary">Experiencia</p>
              <p className="text-secondary/70">{talent.experience_years}</p>
            </div>
          )}

          {talent.area && (
            <div>
              <p className="text-sm font-semibold text-secondary">Área</p>
              <p className="text-secondary/70">{talent.area}</p>
            </div>
          )}

          {talent.availability && (
            <div>
              <p className="text-sm font-semibold text-secondary">Disponibilidad</p>
              <p className="text-secondary/70">{talent.availability}</p>
            </div>
          )}
        </div>

        {/* Links y acciones */}
        <div className="mt-8 flex flex-wrap gap-3">
          {talent.cv_url && (
            <a
              href={talent.cv_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
            >
              Descargar CV
            </a>
          )}

          {talent.linkedin_url && (
            <a
              href={talent.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-secondary/20 px-6 py-3 font-semibold text-secondary hover:bg-secondary/5"
            >
              Ver LinkedIn
            </a>
          )}
        </div>

        {/* Nota de privacidad */}
        <div className="mt-8 rounded-2xl bg-secondary/5 px-4 py-3">
          <p className="text-sm text-secondary/70">
            Este perfil es visible porque {talent.full_name} se postuló a una de
            tus vacancias.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TalentPublicProfile;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEye, FaLinkedin } from 'react-icons/fa';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchPublicTalentProfile } from '../lib/profileService';
import { incrementProfileView, getProfileViewCount } from '../lib/talentService';
import type { Profile } from '../context/AuthContext';
import type { ProfileViewCount } from '../types/talent';

const TalentPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentProfile();
  const [talent, setTalent] = useState<Profile | null>(null);
  const [viewCount, setViewCount] = useState<ProfileViewCount>({ total: 0, lastWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Talento no encontrado.');
        setLoading(false);
        return;
      }

      try {
        // Cargar perfil (AHORA PÚBLICO - sin restricción de rol)
        const talentData = await fetchPublicTalentProfile(id);
        setTalent(talentData);

        // Incrementar vista (funciona incluso sin login)
        await incrementProfileView(id, user?.id);

        // Cargar contador de vistas
        const count = await getProfileViewCount(id);
        setViewCount(count);
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
  }, [id, user]);

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
          <div className="flex items-start justify-between">
            <div className="flex flex-1 items-start gap-4">
              {/* Foto de perfil */}
              {talent.avatar_url && (
                <img
                  src={talent.avatar_url}
                  alt={`Foto de ${talent.full_name}`}
                  className="h-20 w-20 flex-shrink-0 rounded-2xl border border-secondary/10 object-cover"
                />
              )}
              <div className="flex-1">
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
            </div>
            {/* Contador de vistas */}
            {viewCount.lastWeek > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-secondary/5 px-4 py-2 text-sm text-secondary/70">
                <FaEye />
                <span>{viewCount.lastWeek} vistas esta semana</span>
              </div>
            )}
          </div>
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
          {talent.linkedin_url && (
            <a
              href={talent.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-secondary/20 text-xl text-secondary transition-colors hover:bg-secondary/5"
              aria-label="Ver perfil de LinkedIn"
            >
              <FaLinkedin />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default TalentPublicProfile;

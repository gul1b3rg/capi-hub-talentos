import { useNavigate } from 'react-router-dom';
import { FaLinkedin, FaMapMarkerAlt, FaBriefcase, FaEye, FaBuilding } from 'react-icons/fa';
import type { PublicTalentProfile } from '../types/talent';

interface TalentCardProps {
  talent: PublicTalentProfile;
}

/**
 * Genera iniciales de un nombre (máximo 2 letras)
 * Ejemplo: "Analia Ramirez" -> "AR", "Juan" -> "J"
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const TalentCard = ({ talent }: TalentCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/talento/${talent.id}`);
  };

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegación a perfil
  };

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer rounded-3xl border border-white/40 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
          {talent.avatar_url ? (
            <img
              src={talent.avatar_url}
              alt={talent.full_name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-secondary/80 text-white text-2xl font-bold">
              {getInitials(talent.full_name)}
            </div>
          )}
        </div>
      </div>

      {/* Nombre y Headline */}
      <div className="text-center mb-4">
        <h3 className="font-display text-lg font-bold text-secondary mb-1">
          {talent.full_name}
        </h3>
        {talent.headline && (
          <p className="text-sm text-secondary/80 line-clamp-1">
            {talent.headline}
          </p>
        )}
      </div>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        {/* Ubicación */}
        {talent.location && (
          <div className="flex items-center gap-2 text-sm text-secondary/70">
            <FaMapMarkerAlt className="flex-shrink-0" />
            <span className="truncate">{talent.location}</span>
          </div>
        )}

        {/* Área y Experiencia */}
        {(talent.area || talent.experience_years) && (
          <div className="flex items-center gap-2 text-sm text-secondary/70">
            <FaBriefcase className="flex-shrink-0" />
            <span className="truncate">
              {[talent.area, talent.experience_years].filter(Boolean).join(' • ')}
            </span>
          </div>
        )}

        {/* Empresa actual */}
        {talent.current_company && (
          <div className="flex items-center gap-2 text-sm text-secondary/70">
            <FaBuilding className="flex-shrink-0" />
            <span className="truncate">{talent.current_company}</span>
          </div>
        )}
      </div>

      {/* Vistas */}
      {talent.views_last_week !== undefined && talent.views_last_week > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-secondary/60 mb-4 py-2 rounded-full bg-secondary/5">
          <FaEye />
          <span>{talent.views_last_week} vistas esta semana</span>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        {talent.linkedin_url && (
          <a
            href={talent.linkedin_url}
            target="_blank"
            rel="noreferrer"
            onClick={handleLinkedInClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white transition-transform hover:scale-110"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        )}

        <button
          onClick={handleCardClick}
          className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Ver perfil
        </button>
      </div>
    </article>
  );
};

export default TalentCard;

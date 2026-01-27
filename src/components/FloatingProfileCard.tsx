import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

type FloatingProfileCardProps = {
  name: string;
  role: string;
  focus: string;
  location: string;
  availability: string;
  tags: string[];
  accent?: string;
  delay?: number;
};

const FloatingProfileCard = ({
  name,
  role,
  focus,
  location,
  availability,
  tags,
  accent = 'from-white/90 via-white/70 to-white/30',
  delay = 0,
}: FloatingProfileCardProps) => (
  <Link to="/vacancias">
    <article
      className={`w-full max-w-sm rounded-3xl border border-white/40 bg-gradient-to-br ${accent} p-5 text-secondary shadow-lg backdrop-blur-xl animate-float cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
      style={{
        animationDelay: `${delay}s`,
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary/70">{location}</p>
          <h3 className="font-display text-lg">{name}</h3>
          <p className="text-sm text-secondary/80">{role}</p>
        </div>
        <div className="flex gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/20 text-secondary"
            aria-label="Instagram"
          >
            <FaInstagram />
          </span>
        </div>
      </div>
    <p className="mt-4 text-sm text-secondary/70">{focus}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-secondary/80">
          {tag}
        </span>
      ))}
    </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {availability}
      </p>
    </article>
  </Link>
);

export default FloatingProfileCard;

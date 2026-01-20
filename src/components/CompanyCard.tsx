import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaIndustry } from 'react-icons/fa';
import type { CompanyListItem } from '../lib/companyService';

interface CompanyCardProps {
  company: CompanyListItem;
}

const CompanyCard = memo(({ company }: CompanyCardProps) => (
  <Link
    to={`/empresa/${company.id}`}
    className="block rounded-3xl border border-white/40 bg-white/90 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="flex items-center gap-4">
      {company.logo_url ? (
        <img
          src={company.logo_url}
          alt={`Logo de ${company.name}`}
          className="h-16 w-16 rounded-2xl border border-secondary/10 object-contain p-1"
          loading="lazy"
          width="64"
          height="64"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/10 bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold text-secondary">
          {company.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-semibold text-secondary">{company.name}</h3>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary/70">
          {company.industry && (
            <span className="flex items-center gap-1.5">
              <FaIndustry className="text-primary/70" />
              {company.industry}
            </span>
          )}
          {company.location && (
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-primary/70" />
              {company.location}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
));

CompanyCard.displayName = 'CompanyCard';

export default CompanyCard;

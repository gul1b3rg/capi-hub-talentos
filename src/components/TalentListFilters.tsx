import { useState, useEffect } from 'react';
import type { TalentFilters } from '../types/talent';

interface TalentListFiltersProps {
  filters: TalentFilters;
  onFilterChange: (filters: TalentFilters) => void;
}

const areaOptions = [
  'Todos',
  'Siniestros',
  'Comercial',
  'TI',
  'Reaseguro',
  'Innovación',
  'Operaciones',
  'Legal',
  'Finanzas',
];

const experienceOptions = [
  'Todos',
  '0-1 años',
  '1-3 años',
  '3-5 años',
  '5-8 años',
  '8+ años',
];

const sortOptions = [
  { value: 'popular', label: 'Más populares' },
  { value: 'recent', label: 'Más recientes' },
  { value: 'name', label: 'Alfabético (A-Z)' },
];

const TalentListFilters = ({ filters, onFilterChange }: TalentListFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleAreaChange = (value: string) => {
    onFilterChange({
      ...filters,
      area: value === 'Todos' ? null : value
    });
  };

  const handleExperienceChange = (value: string) => {
    onFilterChange({
      ...filters,
      experience_years: value === 'Todos' ? null : value
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sortBy: value as 'recent' | 'popular' | 'name'
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      area: null,
      experience_years: null,
      location: '',
      sortBy: 'popular'
    });
  };

  const hasActiveFilters = filters.search || filters.area || filters.experience_years;

  return (
    <div className="mb-8 rounded-3xl border border-white/40 bg-white/90 p-6 shadow-lg backdrop-blur-xl">
      <div className="space-y-4">
        {/* Búsqueda */}
        <div>
          <input
            type="text"
            placeholder="Buscar por nombre o título..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary placeholder:text-secondary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filtros en fila */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Área */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">
              Área
            </label>
            <select
              value={filters.area || 'Todos'}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {areaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Experiencia */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">
              Experiencia
            </label>
            <select
              value={filters.experience_years || 'Todos'}
              onChange={(e) => handleExperienceChange(e.target.value)}
              className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentListFilters;

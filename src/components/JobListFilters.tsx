import { memo, useEffect, useMemo, useState } from 'react';

interface Filters {
  area: string;
  seniority: string;
  modality: string;
  location: string;
  companyId: string;
  search: string;
}

interface JobListFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  companyOptions: { id: string; name: string }[];
}

const modalityOptions = ['Presencial', 'Híbrido', 'Remoto'];
const areaOptions = ['Siniestros', 'Comercial', 'TI', 'Innovación', 'Operaciones', 'Legal', 'Finanzas'];
const experienceOptions = ['0-1 años', '1-3 años', '3-5 años', '5-8 años', '8+ años'];

const JobListFilters = memo(({ filters, onChange, companyOptions }: JobListFiltersProps) => {
  const uniqueCompanyOptions = useMemo(
    () =>
      companyOptions.filter(
        (company, index, arr) => arr.findIndex((item) => item.id === company.id) === index,
      ),
    [companyOptions],
  );
  const [companySearch, setCompanySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!filters.companyId) {
      setCompanySearch('');
      return;
    }
    const match = uniqueCompanyOptions.find((company) => company.id === filters.companyId);
    setCompanySearch(match?.name ?? '');
  }, [filters.companyId, uniqueCompanyOptions]);

  const handleChange = (field: keyof Filters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/80 p-5 shadow-lg md:grid-cols-3">
      <input
        type="text"
        placeholder="Buscar por título o descripción"
        className="rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={filters.search}
        onChange={(event) => handleChange('search', event.target.value)}
      />
      <input
        type="text"
        placeholder="Ubicación"
        className="rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={filters.location}
        onChange={(event) => handleChange('location', event.target.value)}
      />
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar empresa"
            className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={companySearch}
            onFocus={() => setShowSuggestions(true)}
            onChange={(event) => {
              setCompanySearch(event.target.value);
              handleChange('companyId', '');
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 120);
            }}
          />
          {showSuggestions && (
            <div className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-2xl border border-secondary/20 bg-white shadow-lg">
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-secondary/70 hover:bg-secondary/5"
                onMouseDown={() => {
                  setCompanySearch('');
                  handleChange('companyId', '');
                }}
              >
                Todas las empresas
              </button>
              {uniqueCompanyOptions
                .filter((company) => company.name.toLowerCase().includes(companySearch.toLowerCase()))
                .map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-secondary hover:bg-secondary/5"
                    onMouseDown={() => {
                      setCompanySearch(company.name);
                      handleChange('companyId', company.id);
                    }}
                  >
                    {company.name}
                  </button>
                ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-secondary/60">Escribe y selecciona una empresa del listado.</p>
      </div>
      <select
        className="rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={filters.area}
        onChange={(event) => handleChange('area', event.target.value)}
      >
        <option value="">Áreas</option>
        {areaOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        className="rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={filters.seniority}
        onChange={(event) => handleChange('seniority', event.target.value)}
      >
        <option value="">Experiencia</option>
        {experienceOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        className="rounded-2xl border border-secondary/20 px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={filters.modality}
        onChange={(event) => handleChange('modality', event.target.value)}
      >
        <option value="">Modalidad</option>
        {modalityOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});

JobListFilters.displayName = 'JobListFilters';

export default JobListFilters;
